const sketch = require('sketch');
const { Settings } = sketch;
const {
    createBoldLabel,
    createField,
    createSelect,
} = require('./ui');

const views = ['Grid view'];


/**
 * Create alert modal with options
 * @param {object} defaultSettings 
 * @param {array} baseNames 
 */
export function getUserSettings(defaultSettings, baseNames, langs) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Airtable');
	alert.setInformativeText('lorem');

	alertContent.setFlipped(true);


	// UI Settings
	const labelWidth = 100;
	const labelHeight = 24;
	const fieldWidth = 150;
	const fieldHeight = 28;
	const fieldSpacing = 20;
	let offsetY = 0;


	// API Key
	const APIKeyLabel = createBoldLabel(
		'API Key',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(APIKeyLabel);

	const APIKeyField = createField(
		defaultSettings.APIKey,
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(APIKeyField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Select base (Project)
	const baseLabel = createBoldLabel(
		'Base', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight)
	);
	alertContent.addSubview(baseLabel);

	const baseSelect = createSelect(
		baseNames, 
		baseNames.indexOf(defaultSettings.base), 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight)
	);
	alertContent.addSubview(baseSelect);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Language
	const langLabel = createBoldLabel(
		'Language', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(langLabel);

	const langSelect = createSelect(
		langs, 
		langs.indexOf(defaultSettings.lang), 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(langSelect);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// View
	const viewLabel = createBoldLabel(
		'View',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(viewLabel);

	const viewSelect = createSelect(
		views,
		views.indexOf(defaultSettings.view),
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(viewSelect);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Max records
	const maxRecordsLabel = createBoldLabel(
		'Max records', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(maxRecordsLabel);

	const maxRecordsField = createField(
		defaultSettings.maxRecords, 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(maxRecordsField);



	alertContent.frame = NSMakeRect(
		0, 
		20, 
		300, 
		CGRectGetMaxY(alertContent.subviews().lastObject().frame())
	);
	alert.accessoryView = alertContent;


	// Buttons
	const buttonOk = alert.addButtonWithTitle('OK');
	const buttonCancel = alert.addButtonWithTitle('Cancel');
	

	// Display alert
	var responseCode = alert.runModal();

	if (responseCode === 1000) {
		const pluginOptions = {
			APIKey: APIKeyField.stringValue(),
			base: baseSelect.stringValue(),
			view: viewSelect.stringValue(),
			maxRecords: maxRecordsField.stringValue(),
			lang: langSelect.stringValue(),
		};

		Settings.setSettingForKey('sketchAirtableSync', pluginOptions);

		return pluginOptions;

	} else {
		return false;
	}
}
