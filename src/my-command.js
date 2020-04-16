const sketch = require('sketch');
const { DataSupplier } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
// const Airtable = require('airtable');
const { APIKey, bases, table, view } = require('./secret');
const { 
	createBoldLabel,
	createField,
	createSelect,
	setKeyOrder,
} = require('./lib/ui');

const document = require('sketch/dom').getSelectedDocument();

// const base = new Airtable({ apiKey: 'keyf4awab19Xtmlye' }).base('appvF01ICAgG9SQ7w');
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
	const userSettings = getUserSettings(defaultSettings);
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
						// let { contentID, 'Copy Content': copy } = record.fields;
						if (record.fields.Key === layerName) {
							// const airtableDataKey = record.fields.Key;
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


function getUserSettings(defaultSettings) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Airtable');
	alert.setInformativeText('lorem');

	alertContent.setFlipped(true);


	// UI Settings
	const labelWidth = 100;
	const labelHeight = 24;
	const fieldWidth = 150;
	const fieldHeight = 28;
	const fieldSpacing = 20;
	let offsetY = 0;


	// API Key
	const APIKeyLabel = createBoldLabel(
		'API Key',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(APIKeyLabel);

	const APIKeyField = createField(
		defaultSettings.APIKey,
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(APIKeyField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Select base (Project)
	const baseLabel = createBoldLabel(
		'Base', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight)
	);
	alertContent.addSubview(baseLabel);

	const baseSelect = createSelect(
		baseNames, 
		0, 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight)
	);
	alertContent.addSubview(baseSelect);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Language
	const langLabel = createBoldLabel(
		'Language', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(langLabel);

	const langSelect = createSelect(
		langs, 
		0, 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(langSelect);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Max records
	const maxRecordsLabel = createBoldLabel(
		'Max records', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(maxRecordsLabel);

	const maxRecordsField = createField(
		defaultSettings.maxRecords, 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(maxRecordsField);



	alertContent.frame = NSMakeRect(
		0, 
		20, 
		300, 
		CGRectGetMaxY(alertContent.subviews().lastObject().frame())
	);
	alert.accessoryView = alertContent;


	// Buttons
	// const buttonOk = alert.addButtonWithTitle('OK');
	// const buttonCancel = alert.addButtonWithTitle('Cancel');


	// setKeyOrder(alert, [
	// 	baseLabel,
	// 	baseSelect,
	// 	langLabel,
	// 	langSelect,
	// 	buttonOk,
	// ]);

	alert.runModal();

	// Display alert
	// var responseCode = alert.runModal();
	// log('responseCode', responseCode);

	// if (responseCode === 1000) {
		return {
			APIKey: APIKeyField.stringValue(),
			base: bases[baseNames[baseSelect.indexOfSelectedItem()]],
			view: view,
			maxRecords: maxRecordsField.stringValue(),
			lang: langs[langSelect.indexOfSelectedItem()],
		}

	// } else {
	// 	return false;
	// }
}
