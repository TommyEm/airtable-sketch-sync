const sketch = require('sketch');
const { DataSupplier } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
const { bases } = require('./secret');
const { getUserOptions } = require('./lib/alert');
const { pluginSettings } = require('./settings');
const {
	getDefaultOptions,
	baseNames,
	langs,
} = require('./defaults');
const { getApiEndpoint } = require('./lib/utils');

const document = require('sketch/dom').getSelectedDocument();
const defaultOptions = getDefaultOptions();


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

	insertNestedTextStyles();

	syncSelectedLayer(sketchDataKey, items);

}


export function syncSelectedLayer(sketchDataKey, items) {

	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);


	if (userOptions) {

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
				const currentBase = bases[userOptions.base];

				const apiEndpoint = getApiEndpoint(
					currentBase,
					currentTable,
					userOptions.maxRecords,
					userOptions.view,
					pluginSettings.APIKey,
				);

				fetch(apiEndpoint)
					.then((res) => res.json())
					.then((data) => {
						data.records.reverse().map((record, index) => {
							if (record.fields.Name === layerName) {
								const currentCellData = record.fields[userOptions.lang];
								const data = currentCellData ? currentCellData : ' ';

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
		});
	}

}


function insertNestedTextStyles() {

	let text = document.selectedLayers.layers[0];
	const attrStr = text.sketchObject.attributedStringValue();
	let limitRange = NSMakeRange(0, attrStr.length());
	let effectiveRange = MOPointer.alloc().init();

	// console.log('text', JSON.stringify(text, null, 2));
	const objDict = attrStr.treeAsDictionary();
	const jsonData = NSJSONSerialization.dataWithJSONObject_options_error_(objDict, 0, nil);
	const jsonString = NSString.alloc().initWithData_encoding_(jsonData, NSUTF8StringEncoding);
	console.log('attrStr', jsonString);





	let fonts = [];

	while (limitRange.length > 0) {
		console.log('NSFontAttributeName', NSFontAttributeName);
		console.log('limitRange.location', limitRange.location);
		fonts.push(attrStr.attribute_atIndex_longestEffectiveRange_inRange(
			NSFontAttributeName,
			limitRange.location,
			effectiveRange,
			limitRange
		));
		console.log('effectiveRange.value', effectiveRange.value());
		console.log('limitRange', limitRange);
		limitRange = NSMakeRange(
			NSMaxRange(effectiveRange.value()),
			NSMaxRange(limitRange) - NSMaxRange(effectiveRange.value())
		);
	}


	console.log('fonts', fonts);

}
