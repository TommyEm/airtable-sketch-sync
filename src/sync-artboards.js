const document = require('sketch/dom').getSelectedDocument();
const { pluginSettings } = require('./settings');
const { bases } = require('./secret');
const { getUserOptions } = require('./lib/alert');
const { 
	getDefaultOptions,
	baseNames,
	langs,
} = require('./defaults');
const { getApiEndpoint } = require('./lib/utils');


const defaultOptions = getDefaultOptions();


export function syncAllArtboards(context) {
	log('Sync all artboards on page');
	
	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);

	if (userOptions) {

		// Get Pages
		document.pages.forEach(page => {
			page.layers.forEach(layer => {
				
				// Get Artboards
				if (layer.type === 'Artboard') {
					syncArtboard(layer, userOptions);
				}

			});

		});

	}
}


export function syncSelectedArtboards(context) {
	log('Sync Selected');

	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);

	if (userOptions) {
		document.selectedLayers.forEach(layer => {

			if (layer.type === 'Artboard') {
				log('Artboard');
				syncArtboard(layer, userOptions);
				
			} else {
				log(layer.name);

			}

		});
	}
}


/**
 * Sync a single artboard
 * @param {object} artboard 
 * @param {object} options 
 */
function syncArtboard(artboard, options) {
	const table = artboard.name;
	const base = bases[options.base];

	const apiEndpoint = getApiEndpoint(
		base,
		table,
		options.maxRecords,
		options.view,
		pluginSettings.APIKey,
	);


	fetch(apiEndpoint)
		.then((res) => res.json())
		.then((data) => {
			syncLayerValue(artboard, data, options);
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


/**
 * Sync a single layer upon his type
 * 
 * parentLayers stucture:
 * - Symbol
 *   - overrides
 *     - {
 *         - type
 *         - value
 *         - affectedLayer
 *            - name
 * 			  - type
 *       }
 * @param {object} parentLayers 
 * @param {object} data 
 * @param {object} options 
 */
function syncLayerValue(parentLayers, data, options) {
	parentLayers.layers.forEach(layer => {
		let layerName;

		if (layer.type === 'SymbolInstance') {
			const symbolName = layer.name;
			log(symbolName);

			// log(layer.overrides);
			// log(layer);
			// syncLayerValue(layer, data, options);
			layer.overrides.forEach(override => {
				// if (
				// 	override.affectedLayer.type === 'SymbolInstance' ||
				// 	override.affectedLayer.type === 'Text'
				// ) {
				// 	log(JSON.stringify(override, null, 2));
				// }
					
				layerName = override.affectedLayer.name;
				updateLayerValue(data, override, layerName, options, symbolName);
			});

		} else if (layer.type === 'Text') {
			layerName = layer.name;
			updateLayerValue(data, layer, layerName, options);

		} else if (layer.type === 'Group') {
			syncLayerValue(layer, data, options);
		}
	});
}


/**
 * Sync a layer content with Airtable
 * @param {object} data 
 * @param {object} layer 
 * @param {string} layerName 
 * @param {object} options 
 */
function updateLayerValue(data, layer, layerName, options, symbolName) {
	data.records.reverse().map((record) => {
		const recordName = record.fields.Name;
		let recordNames = [];
		let cleanLayerName = layerName;

		// Support for emojis in layer names
		// They will be ignored
		const emojis = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

		if (layerName.match(emojis)) {
			cleanLayerName = layerName
				.replace(emojis, '')
				.replace('️', '') // Beware, there's an invisible character here
				.trim();
		}

		// Check symbol overrides. Record names must use a / (forward slash) for this.
		// Template: "Symbol Name / Override Name"
		if (symbolName && 
			recordName.match(symbolName) && 
			recordName.match(/\//)
		) {
			const names = recordName.split('/');
			recordNames = names.map(name => name.trim());
		}
		

		// Here we inject the value from Airtable into the Sketch layer
		if (
			recordName === cleanLayerName || 
			recordNames[1] === cleanLayerName
		) {
			const currentCellData = record.fields[options.lang];
			const data = currentCellData ? currentCellData : ' ';

			if (layer.value) {
				layer.value = data;

			} else if (layer.text) {
				layer.text = data;
			}
		}
	});
}
