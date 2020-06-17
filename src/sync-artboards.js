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
		sketch.UI.message('Sync finished!');
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
			syncLayer(artboard, data, commonData, options, []);
		})
		.then(() => {
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
 * @param {object} commonData
 * @param {object} options
 * @param {array} layersHierarchy
 */
function syncLayer(parentLayers, data, commonData, options, layersHierarchy) {	
	
	parentLayers.layers.forEach(layer => {

		if (layer.type === 'SymbolInstance') {
			const symbolName = layer.name;

			layer.overrides.forEach(override => {
				if (
					override.affectedLayer.type === 'SymbolInstance' ||
					override.affectedLayer.type === 'Text'
				) {
					// We need to get the full and clean name of the override
					const overrideFullName = getOverrideFullName(symbolName, override);
					const layerName = removeEmojis(override.affectedLayer.name);
					
					// Update values from Global Template
					updateLayerValue(commonData, override, layerName, options, layersHierarchy, overrideFullName);

					// Update screen-specific values
					updateLayerValue(data, override, layerName, options, layersHierarchy, overrideFullName);
				}

			});

		} else if (layer.type === 'Text') {
			const layerName = removeEmojis(layer.name);
			const layerFullPath = layersHierarchy ? layersHierarchy.join(' / ') : null;
			updateLayerValue(data, layer, layerName, options, layerFullPath);
			
		} else if (layer.type === 'Group') {
			const parentName = parentLayers.name;
			layersHierarchy.push(parentName);
			syncLayer(layer, data, commonData, options, layersHierarchy);
		}

	});

}


/**
 * Sync a layer content with Airtable
 * @param {object} data
 * @param {object} layer
 * @param {string} layerName
 * @param {object} options
 * @param {string} layerFullPath
 * @param {string} symbolName
 */
function updateLayerValue(data, layer, layerName, options, layerFullPath, symbolName) {
	const { lang } = options; // Language selected

	data.records.reverse().map(record => {
		const recordName = record.fields.Name;
		let recordNames = [];

		// Check symbol with nested overrides. Record names must use a / (forward slash) for this.
		// Template: "Symbol Name / Override Name"
		if (symbolName) {
			const names = recordName.split('/');
			recordNames = names.map(name => name.trim());

			const reg = new RegExp(recordNames.join('.*'), 'i');

			if (symbolName.match(reg) && layer) {
				injectValue(record, layer, lang);
			}


		// TODO: Not working. Need to check first if there is a path ('/') and then check if the record regexp matches the path
		} else if (layerFullPath) {
			const names = recordName.split('/');
			recordNames = names.map(name => name.trim());
			
			const reg = new RegExp(recordNames.join('.*'), 'i');
			const pathFullName = layerFullPath + ' / ' + layerName;

			// Start by filtering nested record names
			if (recordName.match(/\//)) {
				if (layerFullPath.match(recordNames[0])) {
					console.log('layerFullPath', layerFullPath);
					console.log('recordName', recordNames[0]);

					if (pathFullName.match(reg)) {
						// log('Match');
						console.log('Match', pathFullName);
						injectValue(record, layer, lang);
					}
				}

			// Then check non-nested records
			} else if (recordName === layerName) {
				// injectValue(record, layer, lang);
			}
				
			// layerFullPath.match(/\//)

			// 	if (pathFullName.match(reg)) {
			// 		log('Nested');
			// 		log(pathFullName);
			// 		log(recordName);
			// 		injectValue(record, layer, lang);
			// 	}
			// }

			// const testReg = new RegExp(names[0], 'i');
			// console.log(testReg);
			// const layerNames = layerFullPath.split('/');
			// const layerReg = new RegExp(layerNames.join('.*'), 'i');
			// log('layer');
			// log(layerFullPath);
			// log('record');
			// log(recordName);

			// if (recordName.match(layerReg)) {
			// 	console.log(recordName);
			// }
			

			// const reg = new RegExp(recordNames.join('.*'), 'i');
			// const pathFullName = layerFullPath + ' / ' + layerName;

			// if (pathFullName.match(reg) && layer) {
			// 	// log('pathFullName');
			// 	// log(pathFullName);
			// 	// log('recordName');
			// 	// log(recordName);
			// 	injectValue(record, layer, lang);
			// }

		}
	});
}



/**
 * Inject value from Airtable record into Sketch layer
 * @param {object} record 
 * @param {object} layer
 */
function injectValue(record, layer, lang) {
	const currentCellData = record.fields[lang];
	const data = currentCellData ? currentCellData : ' ';

	if (layer.value) {
		layer.value = data;

	} else if (layer.text) {
		layer.text = data;
	}
}



/**
 * Get library master symbols from local instances
 * @param {object} document
 * @returns {object}
 */
function getForeignSymbolMasters(document) {
	let foreignSymbolList = document.sketchObject.documentData().foreignSymbols();
	let symbolMasters = [];
	foreignSymbolList.forEach(foreignSymbol => {
		symbolMasters.push(SymbolMaster.fromNative(foreignSymbol.localObject()));
	});
	return symbolMasters;
}


/**
 * Get the name of layer from a library symbol
 * @param {string} layerID 
 * @param {object} masters
 * @returns {string}
 */
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


/**
 * Get the full and clean name of an override. Supports local and library symbols
 * @param {string} symbolName 
 * @param {object} override
 * @returns {string}
 */
function getOverrideFullName(symbolName, override) {
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

	return overrideNameHierarchy.join(' / ');
}