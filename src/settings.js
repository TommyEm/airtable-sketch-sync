const { Settings } = require('sketch');
const { setPlugin } = require('./lib/alert');


export const pluginSettings = Settings.settingForKey('sketchAirtableSyncSettings');

let defaultSettings = {};

if (pluginSettings) {
	defaultSettings.APIKey = pluginSettings.APIKey;
	defaultSettings.bases = pluginSettings.bases;

} else {
	defaultSettings.APIKey = '';
	defaultSettings.bases = '';
}


export default function () {
	setPlugin(defaultSettings);
}
