const { getSettings } = require('./defaults');
const { setPlugin } = require('./lib/alert');


export default function () {
	const settings = getSettings();
	setPlugin(settings);
}
