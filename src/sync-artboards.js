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

			artboard.layers.forEach(layer => {
				let layerName;

				if (layer.type === 'SymbolInstance') {
					layer.overrides.forEach(override => {
						layerName = override.affectedLayer.name;

						updateLayerValue(data, override, layerName, options);
					});

				} else if (layer.type === 'Text') {
					layerName = layer.name;

					updateLayerValue(data, layer, layerName, options);
				}

			});

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
 * Sync a layer content with Airtable
 * @param {object} data 
 * @param {object} layer 
 * @param {string} layerName 
 * @param {object} options 
 */
function updateLayerValue(data, layer, layerName, options) {
	data.records.reverse().map((record) => {
		if (record.fields.Name === layerName) {
			const currentCellData = record.fields[options.lang];
			const data = currentCellData ? currentCellData : ' ';

			layer.value = data;
		}
	});
}
