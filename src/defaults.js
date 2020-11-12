const { Settings } = require('sketch');


export const defaultLangs = [
	'en_US',
	'en_UK',
	'fr_FR',
];
export const views = ['Grid view'];


export const defaultBases = {
	"baseName1": "Insert Base Key",
	"baseName2": "Insert Base Key"
};


export function getOptions() {
	let defaultOptions = {};
	const pluginOptions = Settings.settingForKey('airSketch');

	if (pluginOptions) {
		defaultOptions.base = pluginOptions.base;
		defaultOptions.maxRecords = pluginOptions.maxRecords;
		defaultOptions.view = pluginOptions.view;
		defaultOptions.lang = pluginOptions.lang;
		defaultOptions.underlineColor = pluginOptions.underlineColor;
		defaultOptions.commonData = pluginOptions.commonData;

	} else { // Defaults
		defaultOptions.base = defaultBases[0];
		defaultOptions.maxRecords = 100;
		defaultOptions.view = views[0];
		defaultOptions.lang = defaultLangs[0];
		defaultOptions.underlineColor = '0000FF';
		defaultOptions.commonData = 'Common';
	}

	return defaultOptions;
}


/**
 * Get saved settings if they exist, otherwise returns default ones
 * @returns {object}
 */
export function getSettings() {
	let defaultSettings = {};
	const pluginSettings = Settings.settingForKey('airSketchSettings');

	if (pluginSettings) {
		defaultSettings.APIKey = pluginSettings.APIKey;
		defaultSettings.bases = pluginSettings.bases;
		defaultSettings.langs = pluginSettings.langs;

	} else {
		defaultSettings.APIKey = 'Insert APIKey';
		defaultSettings.bases = JSON.stringify(defaultBases, null, 2);
		defaultSettings.langs = JSON.stringify(defaultLangs);
	}

	return defaultSettings;
}


const storedSettings = Settings.settingForKey('airSketchSettings');
let names = [];

if (storedSettings) {
	const { bases } = storedSettings;
	names = Object.keys(JSON.parse(bases)).map(base => base);
} else {
	names = Object.keys(defaultBases).map(base => base);
}

export const baseNames = names;
