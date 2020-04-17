import sketch from 'sketch';
const { Settings } = sketch;
const { setPlugin } = require('./lib/alert');


export const pluginSettings = Settings.settingForKey('sketchAirtableSyncSettings');

let defaultSettings = {};

if (pluginSettings) {
    defaultSettings.APIKey = pluginSettings.APIKey;

} else {
    defaultSettings.APIKey = '';
}


export default function () {
    setPlugin(defaultSettings);
}
