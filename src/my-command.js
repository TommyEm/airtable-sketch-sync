const sketch = require('sketch');
const { DataSupplier } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
// const Airtable = require('airtable');
const { APIKey, base, table, view } = require('./secret');

const document = require('sketch/dom').getSelectedDocument();

// const base = new Airtable({ apiKey: 'keyf4awab19Xtmlye' }).base('appvF01ICAgG9SQ7w');
const records = 15;
const lang = 'en_US';


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


	// We iterate on each target for data
	items.forEach((item, index) => {
		let layerName;
		if (item.type === 'DataOverride') {
			layerName = item.override.affectedLayer.name;

		} else if (item.type === 'Text') {
			layerName = item.name;
		}
		// console.log('layer', layerName);


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

			const apiEndpoint = encodeURI(`https://api.airtable.com/v0/${base}/${table}?maxRecords=${records}&view=${view}&api_key=${APIKey}`);

			fetch(apiEndpoint)
				.then((res) => res.json())
				.then((data) => {
					data.records.reverse().map((record, index) => {
						// let { contentID, 'Copy Content': copy } = record.fields;
						if (record.fields.Key === layerName) {
							// const airtableDataKey = record.fields.Key;
							const data = record.fields[lang];

							console.log('sketchDataKey', sketchDataKey);
							console.log('data', data);
							
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


			// base(artboardName)
			// 	.select({
			// 		maxRecords: 3,
			// 		view: 'Grid view',
			// 	}).eachPage(function page(records, fetchNextPage) {
			// 		records.forEach(function(record) {
			// 			console.log('Retrieved', record.get('Title'));
			// 		});

			// 		fetchNextPage();

			// 	}, function done(err) {
			// 		if (err) { console.error(err); return; }
			// 	});

			// console.log(base('Success').find('rec1l5DNXef6v3Oq4'));

		}






		// let data = Math.random().toString();
		// DataSupplier.supplyDataAtIndex(sketchDataKey, data, index);
	})
}
