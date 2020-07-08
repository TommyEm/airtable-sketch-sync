const sketch = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const { SymbolMaster } = require('sketch/dom');
const { pluginSettings } = require('./settings');
const { bases } = require('./secret');
const { getUserOptions, displayError } = require('./lib/alert');
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

	// No artboard selected
	if (document.selectedLayers.isEmpty) {
		displayError('No artboards are selected. Please select one or more.');

	// Artboards selected OK
	} else {

		// Get user options from modal
		const userOptions = getUserOptions(defaultOptions, baseNames, langs);

		if (userOptions) {
			underlineColor = userOptions.underlineColor;

			document.selectedLayers.forEach(layer => {

				if (layer.type === 'Artboard') {
					log('Artboard');
					syncArtboard(layer, userOptions);

				} else {
					log(layer.name);
					displayError('No artboards are selected. Please select one or more.');
				}

			});
			sketch.UI.message('Sync finished!');
		}

	}
}


/**
 * Sync a single artboard
 * @param {object} artboard
 * @param {object} options
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
	let commonData;

	fetch(commonDataApiEndpoint)
		.then((res) => res.json())
		.then((data) => {
			commonData = data;
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


	setTimeout(() => {
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
				syncLayer(artboard, commonData, options, []);
				syncLayer(artboard, data, options, []);
			})
			.then(() => {
				log('Artboard synced');
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
					console.log('Error — No artboard', error.message);
					displayError('There\'s an error in the selected options.\n\n' + error.message);
				}
				console.log(error.config);
			});

	}, 1050);
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
							const layerFullPath = layersHierarchy.join(' / ');
							const overrideFullName = getOverrideFullName(symbolName, override);
							const layerName = removeEmojis(override.affectedLayer.name);

							// Update values
							updateLayerValue(data, override, layerName, options, layerFullPath, overrideFullName);
						}
					});
					break;

				case 'Text':
					const layerName = removeEmojis(layer.name);
					const layerFullPath = layersHierarchy.join(' / ');
					updateLayerValue(data, layer, layerName, options, layerFullPath);
					break;

				case 'Group':
					let newLayersHierarchy = [...layersHierarchy];
					newLayersHierarchy.push(layer.name);
					syncLayer(layer, data, options, newLayersHierarchy);
					break;

				default:
					break;
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
		const names = recordName.split('/');

		let recordNames = [];
		recordNames = names.map(name => name.trim());

		const reg = new RegExp(recordNames.join('.*'), 'i');

		// Check symbol with nested overrides. Record names must use a / (forward slash) for this.
		// Template: "Symbol Name / Override Name"
		if (symbolName) {
			const fullName = layerFullPath + ' / ' + symbolName;

			if (fullName.match(recordNames[0]) && fullName.match(reg)) {
				injectValue(record, layer, lang);
			}


		// Check nested and non-nested layers
		} else {
			const fullName = layerFullPath + ' / ' + layerName;

			// Start by filtering nested record names
			if (
				recordName.match(/\//) &&
				layerFullPath.match(recordNames[0]) &&
				fullName.match(reg)
			) {
				injectValue(record, layer, lang);

			// Then check non-nested records
			} else if (recordName === layerName && !layerFullPath.match(/\//)) {
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


/**
 * Checks for data sub objects and converts markdown styles into Objective-C format
 * @param {object} astData // Data in AST format
 * @param {object} layer // Sketch object
 */
function applyMarkdownStyles(astData, layer) {
	astData.forEach(paragraph => {
		if (paragraph.children) {
			let rangeDelay = 0;

			paragraph.children.forEach(text => {
				// Convert markdown + returns rangeDelay for update
				rangeDelay = convertMarkdownToSketch(text, layer, rangeDelay);
			});

		} else {
			let rangeDelay = 0;
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

		case 'LinkReference':
			rangeStart -= rangeDelay;
			rangeEnd -= 5;
			range = NSMakeRange(rangeStart, rangeEnd);
			const color = NSColor.colorWithHex(underlineColor);
			layerObject.addAttribute_value_forRange(NSForegroundColorAttributeName, color, range);
			layerObject.addAttribute_value_forRange(NSUnderlineStyleAttributeName, 1, range);
			rangeDelay += 5;
			break;

		case 'Str':
		case 'Definition': // Link definition
		default:
			break;
	}

	return rangeDelay;
}