const sketch = require('sketch');
const { DataSupplier, Settings } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
// const Airtable = require('airtable');
const { bases } = require('./secret');
const { getUserSettings } = require('./lib/alert');

const document = require('sketch/dom').getSelectedDocument();

const baseNames = Object.keys(bases).map(base => base);
const langs = [
	'en_US',
	'en_UK',
	'fr_FR',
];
const views = ['Grid view'];

// Setting variables
let defaultSettings = {};
const pluginOptions = Settings.settingForKey('sketchAirtableSync');

if (pluginOptions) {
	defaultSettings.APIKey = pluginOptions.APIKey;
	defaultSettings.base = pluginOptions.base;
	defaultSettings.maxRecords = pluginOptions.maxRecords;
	defaultSettings.view = pluginOptions.view;
	defaultSettings.lang = pluginOptions.lang;
	
} else {
	defaultSettings.APIKey = '';
	defaultSettings.base = baseNames[0];
	defaultSettings.maxRecords = 15;
	defaultSettings.view = views[0];
	defaultSettings.lang = langs[0];
}


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


	// We iterate on each target for data
	items.forEach((item, index) => {
		let layerName;
		if (item.type === 'DataOverride') {
			layerName = item.override.affectedLayer.name;

		} else if (item.type === 'Text') {
			layerName = item.name;
		}


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
		
			const currentTable = layer.getParentArtboard().name;
			const currentBase = bases[userSettings.base];

			const apiEndpoint = encodeURI(`https://api.airtable.com/v0/${currentBase}/${currentTable}?maxRecords=${userSettings.maxRecords}&view=${userSettings.view}&api_key=${userSettings.APIKey}`);

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
