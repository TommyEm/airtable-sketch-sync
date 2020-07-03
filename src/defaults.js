const { Settings } = require('sketch');
const { bases } = require('./secret');

export const baseNames = Object.keys(bases).map(base => base);
export const langs = [
	'en_US',
	'en_UK',
	'fr_FR',
];
export const views = ['Grid view'];


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
		defaultOptions.base = baseNames[0];
		defaultOptions.maxRecords = 15;
		defaultOptions.view = views[0];
		defaultOptions.lang = langs[0];
		defaultOptions.underlineColor = '0000FF';
	}

	return defaultOptions;
}