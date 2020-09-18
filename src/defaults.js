const { Settings } = require('sketch');


export const langs = [
	'en_US',
	'en_UK',
	'fr_FR',
];
export const views = ['Grid view'];


const defaultBases = {
	"baseName1": "Base Key",
	"baseName2": "Base Key"
};


export function getDefaultOptions() {
	let defaultOptions = {};
	const pluginOptions = Settings.settingForKey('sketchAirtableSync');

	if (pluginOptions) {
		defaultOptions.base = pluginOptions.base;
		defaultOptions.maxRecords = pluginOptions.maxRecords;
		defaultOptions.view = pluginOptions.view;
		defaultOptions.lang = pluginOptions.lang;
		defaultOptions.underlineColor = pluginOptions.underlineColor;

	} else {
		defaultOptions.base = defaultBases[0];
		defaultOptions.maxRecords = 100;
		defaultOptions.view = views[0];
		defaultOptions.lang = langs[0];
		defaultOptions.underlineColor = '0000FF';
	}

	return defaultOptions;
}


const { bases } = Settings.settingForKey('sketchAirtableSyncSettings');

export const baseNames = Object.keys(JSON.parse(bases)).map(base => base);
