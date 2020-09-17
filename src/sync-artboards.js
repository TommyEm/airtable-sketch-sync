const sketch = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const UI = require('sketch/ui');
const { SymbolMaster } = require('sketch/dom');
const Bluebird = require('bluebird');
const { pluginSettings } = require('./settings');
const { bases } = require('./secret');
const {
	getUserOptions,
	displayError,
	progress,
} = require('./lib/alert');
const {
	getDefaultOptions,
	baseNames,
	langs,
} = require('./defaults');
const {
	getApiEndpoint,
	getCleanArtboardName,
	removeEmojis,
	stripMarkdownFromText,
} = require('./lib/utils');
const { parse } = require('@textlint/markdown-to-ast');


const foreignSymbolMasters = getForeignSymbolMasters(document);
const defaultOptions = getDefaultOptions();
let { underlineColor } = defaultOptions;



export function syncAllArtboards(context) {
	log('Sync all artboards on page');

	// Get user options from modal
	const userOptions = getUserOptions(defaultOptions, baseNames, langs);


	if (userOptions) {

		// Launch progress UI
		const progressModal = progress();

		const artboards = document.selectedPage.layers.map(layer => {
			if (layer.type === 'Artboard') {
				return layer;
			}
		});
		const increment = (100 - 5) / artboards.length;

		return Bluebird.map(
			artboards,
			artboard => {
				progressModal.increment(increment);
				return syncArtboard(artboard, userOptions)
			},
			{ concurrency: 1 }

		).then(() => {
			console.log('Finished');
			sketch.UI.message('Sync finished');
			progressModal.close();
		});

	}
}



export function syncSelectedArtboards(context) {
	log('Sync Selected');

	// No artboard selected
	if (document.selectedLayers.isEmpty) {
		displayError('No artboards are selected. Please select one or more.');

	// Artboards selected OK
	} else {

		// Get user options from modal
		const userOptions = getUserOptions(defaultOptions, baseNames, langs);

		if (userOptions) {
			underlineColor = userOptions.underlineColor;

			// Launch progress UI
			const progressModal = progress();

			const artboards = document.selectedLayers.layers.map(layer => {
				if (layer.type === 'Artboard') {
					return layer;
				}
			});
			const increment = (100 - 5) / artboards.length;

			return Bluebird.map(
				artboards,
				layer => {
					if (layer.type === 'Artboard') {
						log('Artboard');
						progressModal.increment(increment);
						return syncArtboard(layer, userOptions);

					} else {
						log(layer.name);
						return displayError('No artboards are selected. Please select one or more.');
					}
				},
				{ concurrency: 1 }
			)
				.then(() => {
					console.log('Finished');
					progressModal.close();
				});

		}

	}
}


export function resetSelectedArtboards(context) {
	log('Clean up');

	// No artboard selected
	if (document.selectedLayers.isEmpty) {
		displayError('No artboards are selected. Please select one or more.');

	// Artboards selected OK
	} else {

		document.selectedLayers.forEach(layer => {

			if (layer.type === 'Artboard') {
				log('Artboard');
				resetArtboard(layer);

			} else {
				log(layer.name);
				displayError('No artboards are selected. Please select one or more.');
			}

		});

	}

}


/**
 * Insert a placeholder value into each nested text layer and override
 * @param {object} parentLayers
 */
function resetArtboard(parentLayers) {

	parentLayers.layers.forEach(layer => {
		if (layer.hidden === false) { // We don't sync hidden layers

			switch (layer.type) {
				case 'SymbolInstance':
					layer.overrides.forEach(override => {
						if (
							override.affectedLayer.type === 'Text' &&
							override.value != '' &&
							override.value != ' '
						) {
							override.value = 'Text';
						}
					});
					break;

				case 'Text':
					if (layer.text != '' && layer.text != ' ') {
						layer.text = 'Text';
					}
					break;

				case 'Group':
					resetArtboard(layer);
					break;

				default:
			}

		}
	});

}


/**
 * Sync a single artboard
 * @param {object} artboard
 * @param {object} options
 * @param {object} progress
 * @param {number} progressIncrement
 */
function syncArtboard(artboard, options) {
	const table = getCleanArtboardName(artboard.name);
	const base = bases[options.base];

	const commonDataApiEndpoint = getApiEndpoint(
		base,
		'Global Template',
		options.maxRecords,
		options.view,
		pluginSettings.APIKey,
	);

	return new Bluebird((resolve, reject) => {
		fetch(commonDataApiEndpoint)
			.then((res) => resolve(res.json()))
	})
		.delay(1000)
		.then(commonData => {
			const apiEndpoint = getApiEndpoint(
				base,
				table,
				options.maxRecords,
				options.view,
				pluginSettings.APIKey,
			);

			return fetch(apiEndpoint)
				.then((res) => res.json())
				.then((data) => syncLayer(
					artboard,
					{ records: [...commonData.records, ...data.records] },
					options,
					[]
				));
		})
		.then(() => {
			log('Artboard synced');
			return 'Artboard synced';
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
				displayError('There\'s an error in the selected options.\n\n' + error.message);
				return;
			}
			console.log(error.config);
		});

}


/**
 * Sync a single layer upon his type
 *
 * Symbols parentLayers stucture:
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
function syncLayer(parentLayers, data, options, layersHierarchy) {

	parentLayers.layers.forEach(layer => {
		if (layer.hidden === false) { // We don't sync hidden layers

			switch (layer.type) {
				case 'SymbolInstance':
					const symbolName = layer.name;

					layer.overrides.forEach(override => {
						if (
							// override.affectedLayer.type === 'SymbolInstance' ||
							override.affectedLayer.type === 'Text'
						) {
							// We need to get the full and clean name of the override
							const layerFullPath = layersHierarchy.join(' // '); // 2 slashes so adjacent nested words can be easily targeted by regex
							const overrideFullName = getOverrideFullName(symbolName, override);
							const layerName = removeEmojis(override.affectedLayer.name);

							// Update values
							updateLayerValue(data, override, layerName, options, layerFullPath, overrideFullName);
						}
					});
					break;

				case 'Text':
					const layerName = removeEmojis(layer.name);
					const layerFullPath = layersHierarchy.join(' // ');
					updateLayerValue(data, layer, layerName, options, layerFullPath);
					break;

				case 'Group':
					let newLayersHierarchy = [...layersHierarchy];
					newLayersHierarchy.push(layer.name);
					syncLayer(layer, data, options, newLayersHierarchy);
					break;

				default:
			}

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
		const recordNames = recordName.split('/').map(name => name.trim());

		// const reg = new RegExp(recordNames.join('.*'), 'i');
		const reg = new RegExp(recordNames.join('\\s\/.*\/\\s'), 'i');

		// Check symbol with nested overrides. Record names must use a / (forward slash) for this.
		// Template: "Symbol Name / Override Nested Name"
		if (symbolName) {
			const fullName = layerFullPath + ' // ' + symbolName;

			if (fullName.match(reg)) {
				injectValue(record, layer, lang);
			}


		// Check nested and non-nested layers
		} else {
			const fullName = layerFullPath + ' // ' + layerName;

			// Conditions
			const nestedRecordMatchFullName = recordName.match(/\//)
				&& fullName.match(reg);
			const notNestedLayerMatchRecord = !layerFullPath.match(/\//)
				&& recordName === layerName;

			if (
				nestedRecordMatchFullName
				|| notNestedLayerMatchRecord
			) {
				injectValue(record, layer, lang);
			}
		}

	});
}



/**
 * Inject value from Airtable record into Sketch layer
 * @param {object} record
 * @param {object} layer
 */
function injectValue(record, layer, lang) {

	if (!layer.hidden) {
		const currentCellData = record.fields[lang];
		const data = currentCellData ? currentCellData : ' ';
		// const data = currentCellData ? currentCellData.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '') : ' '; // If needed, this strips the string from invisible characters

		const ast = parse(data);
		const astData = ast.children;
		const strippedText = stripMarkdownFromText(astData, []).join('');

		if (layer.value) { // Symbol override
			layer.value = strippedText;
			// TODO: if possible, update the override styles

		} else if (layer.text) { // Text layer
			layer.text = strippedText;
			applyMarkdownStyles(astData, layer.sketchObject);
		}
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

	return overrideNameHierarchy.join(' // ');
}


/**
 * Get the name of layer from a library symbol
 * @param {string} layerID
 * @param {object} masters
 * @returns {string}
 */
function getForeignLayerNameWithID(layerID, masters) {
	let layerName;

	loop1:
	for (let master of masters) {
		const layers = master.sketchObject.layers();

		loop2:
		for (let i = 0; i < layers.length; i++) {

			if (layers[i].objectID() == layerID) {
				layerName = layers[i].name();

			} else if (layers[i].layers) {
				layerName = getForeignGroupedLayerNameWithID(layerID, layers[i].layers());
			}

			if (!!layerName) {
				break loop2;
			}
		}

		if (!!layerName) {
			break loop1;
		}
	}

	return layerName;
}


/**
 * Get the name of layer inside a group
 * @param {string} layerID
 * @param {object} groupedLayers
 * @returns {string}
 */
function getForeignGroupedLayerNameWithID(layerID, groupedLayers) {
	let layerName;

	loop3:
	for (let i = 0; i < groupedLayers.length; i++) {
		const objectID = groupedLayers[i].objectID();

		if (objectID == layerID) {
			layerName = groupedLayers[i].name();

		} else if (typeof groupedLayers[i].layers === 'function') {
			layerName = getForeignGroupedLayerNameWithID(layerID, groupedLayers[i].layers());
		}

		if (!!layerName) {
			break loop3;
		}
	}
	return layerName;
}


/**
 * Checks for data sub objects and converts markdown styles into Objective-C format
 * @param {object} astData // Data in AST format
 * @param {object} layer // Sketch object
 */
function applyMarkdownStyles(astData, layer) {
	astData.forEach(paragraph => {
		let rangeDelay = 0;

		if (paragraph.children) {
			paragraph.children.forEach(text => {
				// Convert markdown + returns rangeDelay for update
				rangeDelay = convertMarkdownToSketch(text, layer, rangeDelay);
			});

		} else {
			const text = paragraph;

			// Convert markdown + returns rangeDelay for update
			rangeDelay = convertMarkdownToSketch(text, layer, rangeDelay);
		}
	});
}


/**
 * Converts an AST node style into Objective-C style and applies it to a layer
 * @param {object} text // AST format
 * @param {object} layerObject // Sketch object
 * @param {number} rangeDelay
 * @returns {number}
 */
function convertMarkdownToSketch(text, layerObject, rangeDelay) {
	let rangeStart = text.range[0];
	let rangeEnd = text.range[1] - text.range[0];
	let range = NSMakeRange(rangeStart, rangeEnd);
	const baseFont = layerObject.font();

	switch (text.type) {
		case 'Strong':
			rangeStart -= rangeDelay;
			rangeEnd -= (4 + rangeDelay);
			range = NSMakeRange(rangeStart, rangeEnd);
			const boldFont = NSFontManager.sharedFontManager().convertFont_toHaveTrait(baseFont, NSBoldFontMask);
			layerObject.addAttribute_value_forRange(NSFontAttributeName, boldFont, range);
			rangeDelay += 4;
			break;

		case 'Emphasis':
			rangeStart -= rangeDelay;
			rangeEnd -= 2;
			range = NSMakeRange(rangeStart, rangeEnd);
			const emphasisFont = NSFontManager.sharedFontManager().convertFont_toHaveTrait(baseFont, NSItalicFontMask);
			layerObject.addAttribute_value_forRange(NSFontAttributeName, emphasisFont, range);
			rangeDelay += 2;
			break;

		case 'Delete':
			rangeStart -= rangeDelay;
			rangeEnd -= 4;
			range = NSMakeRange(rangeStart, rangeEnd);
			layerObject.addAttribute_value_forRange(NSStrikethroughStyleAttributeName, 1, range);
			rangeDelay += 4;
			break;

		case 'Code':
			rangeDelay += 2;
			break;

		case 'Link':
			rangeStart = text.children[0].range[0] - 1;
			rangeEnd = text.children[0].range[1] - text.children[0].range[0];
			rangeStart -= rangeDelay;
			range = NSMakeRange(rangeStart, rangeEnd);
			const linkColor = NSColor.colorWithHex(underlineColor);
			layerObject.addAttribute_value_forRange(NSForegroundColorAttributeName, linkColor, range);
			layerObject.addAttribute_value_forRange(NSUnderlineStyleAttributeName, 1, range);
			break;

		case 'Str':
		case 'Definition': // Link definition
		default:
			break;
	}

	return rangeDelay;
}