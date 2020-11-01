const sketch = require('sketch');
const { DataSupplier } = sketch;
const util = require('util');
const fetch = require("sketch-polyfill-fetch");
const { getUserOptions, displayError } = require('./lib/alert');
const {
	baseNames,
	getOptions,
	getSettings,
	langs,
} = require('./defaults');
const { getApiEndpoint, stripMarkdownFromText } = require('./lib/utils');
const { parse } = require('@textlint/markdown-to-ast');

const document = require('sketch/dom').getSelectedDocument();
const defaultOptions = getOptions();


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

	syncSelectedLayer(sketchDataKey, items);
}


export function syncSelectedLayer(sketchDataKey, items) {

	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);
	const settings = getSettings();


	if (userOptions) {

		// We iterate on each target for data
		items.forEach((item, itemIndex) => {
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
				const bases = JSON.parse(settings.bases);
				const currentBase = bases[userOptions.base];

				const apiEndpoint = getApiEndpoint(
					currentBase,
					currentTable,
					userOptions.maxRecords,
					userOptions.view,
					settings.APIKey,
				);

				fetch(apiEndpoint)
					.then((res) => res.json())
					.then((data) => {
						data.records.reverse().map((record, index) => {
							if (record.fields.Name === layerName) {
								const currentCellData = record.fields[userOptions.lang];
								const data = currentCellData ? currentCellData : ' ';

								const ast = parse(data);
								const astData = ast.children;
								const cleanData = stripMarkdownFromText(astData, []).join('');

								// TODO: if possible, update the override styles

								DataSupplier.supplyDataAtIndex(sketchDataKey, cleanData, itemIndex);
							}
						});
					})
					.catch((error) => {
						if (error.response) {
							console.log(error.response.data);
							displayError(error.response.data);
						} else if (error.request) {
							console.log(error.request);
							displayError(error.request);
						} else {
							// Something happened in setting up the request that triggered an Error
							console.log('Error', error.message);
							displayError(error.message);
						}
						console.log(error.config);
					});
			}
		});
	}

}
