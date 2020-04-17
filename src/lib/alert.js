const sketch = require('sketch');
const { Settings } = sketch;
const {
    createBoldLabel,
    createField,
    createSelect,
} = require('./ui');

const views = ['Grid view'];

// UI Settings
const labelWidth = 100;
const labelHeight = 24;
const fieldWidth = 150;
const fieldHeight = 28;
const fieldSpacing = 20;



/**
 * Create alert modal with options
 * @param {object} defaultOptions 
 * @param {array} baseNames 
 */
export function getUserOptions(defaultOptions, baseNames, langs) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Airtable');
	alert.setInformativeText('lorem');
	// Buttons
	alert.addButtonWithTitle('OK');
	alert.addButtonWithTitle('Cancel');

	alertContent.setFlipped(true);

	
	let offsetY = 0;


	// Select base (Project)
	const baseLabel = createBoldLabel(
		'Base', 
		12, 
		NSMakeRect(0, offsetY, fieldWidth, labelHeight)
	);
	alertContent.addSubview(baseLabel);

	const baseSelect = createSelect(
		baseNames, 
		baseNames.indexOf(defaultOptions.base), 
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
		langs.indexOf(defaultOptions.lang), 
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
		views.indexOf(defaultOptions.view),
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
		defaultOptions.maxRecords, 
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(maxRecordsField);



	alertContent.frame = NSMakeRect(
		0, 
		20, 
		300, 
		CGRectGetMaxY(alertContent.subviews().lastObject().frame())
	);
	alert.accessoryView = alertContent;


	
	// Display alert
	var responseCode = alert.runModal();
	if (responseCode == NSAlertFirstButtonReturn) {
		if (responseCode === 1000) {
			const pluginOptions = {
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
}



/**
 * Plugin Settings (API Key)
 * @param {object} defaultSettings 
 */
export function setPlugin(defaultSettings) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Sketch Airtable Sync');
	alert.setInformativeText('Settings');
	// Buttons
	alert.addButtonWithTitle('OK');
	alert.addButtonWithTitle('Cancel');

	alertContent.setFlipped(true);


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



	alertContent.frame = NSMakeRect(
		0,
		20,
		300,
		CGRectGetMaxY(alertContent.subviews().lastObject().frame())
	);
	alert.accessoryView = alertContent;


	// Display alert
	var responseCode = alert.runModal();
	if (responseCode == NSAlertFirstButtonReturn) {
		if (responseCode === 1000) {
			const pluginSettings = {
				APIKey: APIKeyField.stringValue(),
			};

			Settings.setSettingForKey('sketchAirtableSyncSettings', pluginSettings);

			return pluginSettings;

		} else {
			return false;
		}
	}
}
