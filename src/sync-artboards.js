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
const { getApiEndpoint, removeEmojis } = require('./lib/utils');
const { parse } = require('@textlint/markdown-to-ast');


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

	// No artboard selected
	if (document.selectedLayers.isEmpty) {
		displayError('No artboards are selected. Please select one or more.');

	// Artboards selected OK
	} else {

		// Get user options from modal
		const userOptions = getUserOptions(defaultOptions, baseNames, langs);

		if (userOptions) {
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
							override.affectedLayer.type === 'SymbolInstance' ||
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
	const currentCellData = record.fields[lang];
	// const data = currentCellData ? currentCellData.replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '') : ' ';
	const data = currentCellData ? currentCellData : ' ';
	// console.log(data);

	if (!layer.hidden) {
		if (layer.value) {
			// layer.value = data;

		} else if (layer.text) {
			// layer.text = data;

			// console.log(layer.sketchObject.treeAsDictionary());
		}
		checkForMarkdown(data, layer.sketchObject, layer);
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


function stripMarkdownFromText(data, accData) {
	const arrData = Array.isArray(data) ? data : Object.values(data);

	return arrData.reduce((acc, curr) => {
		if ((curr.type === 'Str' || curr.type === 'Code') && curr.value) {
			accData.push(curr.value);
			return accData;

		} else if (curr.type && curr.type !== 'Definition') {
			return stripMarkdownFromText(curr.children, accData);

		} else {
			return accData;
		}
	}, []);
}


function checkForMarkdown(data, layer, layer2) {

	const ast = parse(data);
	const paragraphs = ast.children;
	console.log('layer', layer.treeAsDictionary());


	// paragraphs.forEach(paragraph => { });

	const baseFont = layer.font();
	// console.log('paragraph', paragraphs[0]);
	// console.log('paragraph 2', paragraphs[1]);

	const plainText = stripMarkdownFromText(paragraphs, []).join('');
	// console.log('STRIPPED', plainText);

	if (layer2.value) {
		layer2.value = plainText;

	} else if (layer2.text) {
		layer2.text = plainText;
	}

	let rangeDelay = 0;

	paragraphs[0].children.forEach(text => {
		console.log(text);

		let rangeStart = text.range[0];
		let rangeEnd = text.range[1] - text.range[0];
		let range = NSMakeRange(rangeStart, rangeEnd);

		switch (text.type) {
			case 'Strong':
				rangeStart -= rangeDelay;
				rangeEnd -= (4 + rangeDelay);
				range = NSMakeRange(rangeStart, rangeEnd);
				const boldFont = NSFontManager.sharedFontManager().convertFont_toHaveTrait(baseFont, NSBoldFontMask);
				layer.addAttribute_value_forRange(NSFontAttributeName, boldFont, range);
				rangeDelay += 4;
				break;

			case 'Emphasis':
				rangeStart -= rangeDelay;
				rangeEnd -= 2;
				range = NSMakeRange(rangeStart, rangeEnd);
				const emphasisFont = NSFontManager.sharedFontManager().convertFont_toHaveTrait(baseFont, NSItalicFontMask);
				layer.addAttribute_value_forRange(NSFontAttributeName, emphasisFont, range);
				rangeDelay += 2;
				break;

			case 'Delete':
				rangeStart -= rangeDelay;
				rangeEnd -= 4;
				range = NSMakeRange(rangeStart, rangeEnd);
				layer.addAttribute_value_forRange(NSStrikethroughStyleAttributeName, 1, range);
				rangeDelay += 4;
				break;

			case 'LinkReference':
				rangeStart -= rangeDelay;
				rangeEnd -= 5;
				range = NSMakeRange(rangeStart, rangeEnd);
				// const color = NSColor.colorWithRed_green_blue_alpha(1,0,0,1);
				const color = NSColor.colorWithHex('0000FF');
				layer.addAttribute_value_forRange(NSForegroundColorAttributeName, color, range);
				layer.addAttribute_value_forRange(NSUnderlineStyleAttributeName, 1, range);
				rangeDelay += 5;
				break;

			case 'Definition':
				break;

			case 'Code':
				rangeDelay += 2;
				break;
			// case 'Str':
			// 	sketchParsedText.push(text.value);
			// 	break;

			default:
				break;
		}
	});

	return layer;
}
