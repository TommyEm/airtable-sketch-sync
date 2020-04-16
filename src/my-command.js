const sketch = require('sketch');
const { DataSupplier } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
// const Airtable = require('airtable');
const { 
	APIKey, 
	bases, 
	table, 
	view,
} = require('./secret');
const { getUserSettings } = require('./lib/alert');

const document = require('sketch/dom').getSelectedDocument();

const baseNames = Object.keys(bases).map(base => base);
const langs = [
	'en_US',
	'en_UK',
	'fr_FR',
];

// Setting variables
let defaultSettings = {};
defaultSettings.APIKey = APIKey;
defaultSettings.base = bases.rvt2skp;
defaultSettings.maxRecords = 15;
defaultSettings.view = view;
defaultSettings.lang = langs[0];


export function onStartup() {
	DataSupplier.registerDataSupplier('public.text', 'Sketch Airtable Sync', 'SupplyData');
}

export function onShutdown() {
	// Deregister the plugin
	DataSupplier.deregisterDataSuppliers();
}

export function onSupplyData(context) {
	let sketchDataKey = context.data.key;
	const items = util.toArray(context.data.items).map(sketch.fromNative);

	// Create UI
	const userSettings = getUserSettings(defaultSettings, baseNames, langs);
	log(userSettings);


	// We iterate on each target for data
	items.forEach((item, index) => {
		let layerName;
		if (item.type === 'DataOverride') {
			layerName = item.override.affectedLayer.name;

		} else if (item.type === 'Text') {
			layerName = item.name;
		}
		// console.log('layername', layerName);


		let layer;
		switch (item.type) {
			case 'DataOverride':
				layer = document.getLayerWithID(item.symbolInstance.id);
				break;

			case 'Text':
				layer = document.getLayerWithID(item.id);
				break;

			default:
				break;
		}

		if (layer.getParentArtboard()) {
		
			const table = layer.getParentArtboard().name;

			const apiEndpoint = encodeURI(`https://api.airtable.com/v0/${userSettings.base}/${table}?maxRecords=${userSettings.maxRecords}&view=${userSettings.view}&api_key=${userSettings.APIKey}`);

			fetch(apiEndpoint)
				.then((res) => res.json())
				.then((data) => {
					data.records.reverse().map((record, index) => {
						if (record.fields.Name === layerName) {
							const data = record.fields[userSettings.lang];

							// console.log('sketchDataKey', sketchDataKey);
							// console.log('data', data);
							
							DataSupplier.supplyDataAtIndex(sketchDataKey, data, index);
						}
					})
				})
				.catch((error) => {
					if (error.response) {
						console.log(error.response.data);
					} else if (error.request) {
						console.log(error.request);
					} else {
						// Something happened in setting up the request that triggered an Error
						console.log('Error', error.message);
					}
					console.log(error.config);
				});
		}
	})
}
