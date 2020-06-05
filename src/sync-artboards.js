const sketch = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const { SymbolMaster } = require('sketch/dom');
const { pluginSettings } = require('./settings');
const { bases } = require('./secret');
const { getUserOptions } = require('./lib/alert');
const { 
	getDefaultOptions,
	baseNames,
	langs,
} = require('./defaults');
const { getApiEndpoint, removeEmojis } = require('./lib/utils');


const foreignSymbolMasters = getForeignSymbolMasters(document);
const defaultOptions = getDefaultOptions();


export function syncAllArtboards(context) {
	log('Sync all artboards on page');
	
	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);

	if (userOptions) {

		let currentPage = 0;

		// Get Pages
		document.pages.forEach(page => {
			page.layers.forEach(layer => {
				
				// Get Artboards
				if (layer.type === 'Artboard') {
					syncArtboard(layer, userOptions);
				}

			});

			if (currentPage === document.pages.length) {
				sketch.UI.message('Sync finished');
			} else {
				++currentPage;
			}


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


	const commonDataApiEndpoint = getApiEndpoint(
		base,
		'Global Template',
		options.maxRecords,
		options.view,
		pluginSettings.APIKey,
	);
	let commonData;

	fetch(commonDataApiEndpoint)
		.then((res) => res.json())
		.then((data) => {
			commonData = data;
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
			syncLayerValue(artboard, data, commonData, options);
		})
		.then(() => {
			sketch.UI.message('Sync finished!');
			log('DONE');
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
function syncLayerValue(parentLayers, data, commonData, options) {
	parentLayers.layers.forEach(layer => {
		let layerName;

		if (layer.type === 'SymbolInstance') {
			const symbolName = layer.name;
			// log(symbolName);


			// log(layer.overrides);
			// log(layer);
			// syncLayerValue(layer, data, commonData, options);
			layer.overrides.forEach(override => {
				// To Debug
				// if (
				// 	override.affectedLayer.name.match(/Label/) 
				// 	&& layer.name === 'Drop Zone'
				// ) {
				// 	log(layer.name);
				// 	log(override.affectedLayer.id);
				// 	log(getForeignLayerNameWithID(override.affectedLayer.id, foreignSymbolMasters));
				// }

				if (
					override.affectedLayer.type === 'SymbolInstance' ||
					override.affectedLayer.type === 'Text'
				) {
					const idHierarchy = override.path.split('/');
					let overrideNameHierarchy = [symbolName];
					
					idHierarchy.forEach(id => {
						let overrideName;
						let overrideNameFromPath = document.getLayerWithID(id);

						if (overrideNameFromPath === undefined) {
							// If it's undefined, the layer comes from a library, we need a special treatment to retrieve it
							overrideName = getForeignLayerNameWithID(id, foreignSymbolMasters);
							overrideName = overrideName ? removeEmojis(overrideName) : undefined;

						} else {
							overrideName = removeEmojis(overrideNameFromPath.name);
						}
							
						overrideNameHierarchy.push(overrideName);

					});

					const overrideFullName = overrideNameHierarchy.join(' / ');

					layerName = override.affectedLayer.name;
					// log(layerName);
					// log(overrideFullName);
					updateLayerValue(commonData, override, layerName, options, overrideFullName);
					updateLayerValue(data, override, layerName, options, overrideFullName);
				}
					
			});

		} else if (layer.type === 'Text') {
			layerName = layer.name;
			updateLayerValue(data, layer, layerName, options);

		} else if (layer.type === 'Group') {
			syncLayerValue(layer, data, commonData, options);
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
		
		// Support for emojis in layer names
		// They will be ignored
		let cleanLayerName = removeEmojis(layerName);
		

		// Check symbol with nested overrides. Record names must use a / (forward slash) for this.
		// Template: "Symbol Name / Override Name"

		// if (symbolName && 
		// 	recordName.match(symbolName) && 
		// 	recordName.match(/\//)
		// ) {
		// 	const names = recordName.split('/');
		// 	recordNames = names.map(name => name.trim());
		// }
		if (symbolName) {
			const names = recordName.split('/');
			recordNames = names.map(name => name.trim());

			const reg = new RegExp(recordNames.join('.*'), 'i');

			if (symbolName.match(reg) && layer ) {
				const currentCellData = record.fields[options.lang];
				const data = currentCellData ? currentCellData : ' ';

				if (layer.value) {
					layer.value = data;

				} else if (layer.text) {
					layer.text = data;
				}
			}

		} else if ( 
		// Here we inject the value from Airtable into the Sketch layer
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



function getForeignSymbolMasters(document) {
	let foreignSymbolList = document.sketchObject.documentData().foreignSymbols();
	let symbolMasters = [];
	foreignSymbolList.forEach(foreignSymbol => {
		symbolMasters.push(SymbolMaster.fromNative(foreignSymbol.localObject()));
	});
	return symbolMasters;
}

function getForeignLayerNameWithID(layerID, masters) {
	let match;
	let layerName;
	for (let master of masters) {
		match = master.sketchObject.layers().find(layer => {
			if (layer.objectID() == layerID) {
				layerName = layer.name();
			}
			return layer.objectID() == layerID;
		});
		if (match) { 
			break; 
		}
	}
	return layerName;
}