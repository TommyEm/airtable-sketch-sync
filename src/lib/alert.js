const { Settings } = require('sketch');
const document = require('sketch/dom').getSelectedDocument();
const {
    createBoldLabel,
    createField,
    createSelect,
} = require('./ui');
const {
	baseNames,
	defaultBases,
	defaultLangs,
	getOptions,
	getSettings,
} = require('../defaults');

const views = ['Grid view'];

// UI Settings
const labelWidth = 100;
const labelHeight = 24;
const fieldWidth = 150;
const fieldWidthLarge = 400;
const fieldHeight = 28;
const fieldSpacing = 20;

const defaultOptions = getOptions();


/**
 * Create alert modal with options
 */
export function getUserOptions() {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Sketch Airtable Sync');
	alert.setInformativeText('Sync artboards');
	// Buttons
	alert.addButtonWithTitle('OK');
	alert.addButtonWithTitle('Cancel');

	alertContent.setFlipped(true);

	let offsetY = 24;
	const settings = getSettings();
	const langs = JSON.parse(settings.langs);


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

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Underline color
	const underlineColorLabel = createBoldLabel(
		'Underline color',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(underlineColorLabel);

	const underlineColorField = createField(
		defaultOptions.underlineColor,
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(underlineColorField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Common data table name
	const commonDataLabel = createBoldLabel(
		'Common data',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(commonDataLabel);

	const commonDataField = createField(
		defaultOptions.commonData,
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(commonDataField);


	alertContent.frame = NSMakeRect(
		0,
		20,
		300,
		CGRectGetMaxY(alertContent.subviews().lastObject().frame()),
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
				underlineColor: underlineColorField.stringValue(),
				commonData: commonDataField.stringValue(),
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
 * @param {object} settings
 */
export function setPlugin(settings) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Sketch Airtable Sync');
	alert.setInformativeText('Settings');
	// Buttons
	alert.addButtonWithTitle('Save');
	alert.addButtonWithTitle('Cancel');

	alertContent.setFlipped(true);

	let offsetY = 12;


	// API Key
	const APIKeyLabel = createBoldLabel(
		'API Key',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(APIKeyLabel);

	const APIKeyField = createField(
		settings.APIKey,
		NSMakeRect(labelWidth, offsetY, fieldWidthLarge, fieldHeight));
	alertContent.addSubview(APIKeyField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Bases
	const basesLabel = createBoldLabel(
		'Bases',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(basesLabel);

	const basesField = createField(
		settings.bases,
		NSMakeRect(labelWidth, offsetY, fieldWidthLarge, 300));
	alertContent.addSubview(basesField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


	// Languages (Fields)
	const langsLabel = createBoldLabel(
		'Languages',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(langsLabel);

	const langsField = createField(
		settings.langs,
		NSMakeRect(labelWidth, offsetY, fieldWidthLarge, 100));
	alertContent.addSubview(langsField);


	alertContent.frame = NSMakeRect(
		0,
		20,
		500,
		CGRectGetMaxY(alertContent.subviews().lastObject().frame())
	);
	alert.accessoryView = alertContent;


	// Display alert
	var responseCode = alert.runModal();

	if (responseCode == NSAlertFirstButtonReturn) {
		if (responseCode === 1000) {
			const APIKey = APIKeyField.stringValue() == '' ? 'Insert API Key' : APIKeyField.stringValue();
			const bases = basesField.stringValue() == '' ? JSON.stringify(defaultBases, null, 2) : basesField.stringValue();
			const langs = langsField.stringValue() == '' ? JSON.stringify(defaultLangs) : langsField.stringValue();

			const pluginSettings = {
				APIKey,
				bases,
				langs,
			};

			Settings.setSettingForKey('airtableSketchSyncSettings', pluginSettings);

			return pluginSettings;

		} else {
			return false;
		}
	}
}



/**
 * Set substitute text for layer resets
 */
export function getSubstituteText() {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
		alertContent = NSView.alloc().init();

	alert.setIcon(alertIcon);
	alert.setMessageText('Sketch Airtable Sync');
	alert.setInformativeText('Reset layers content');
	// Buttons
	alert.addButtonWithTitle('OK');
	alert.addButtonWithTitle('Cancel');

	alertContent.setFlipped(true);

	let offsetY = 12;


	const SubstituteTextLabel = createBoldLabel(
		'Substitute Text',
		12,
		NSMakeRect(0, offsetY, fieldWidth, labelHeight));
	alertContent.addSubview(SubstituteTextLabel);

	const SubstituteTextField = createField(
		'Text',
		NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
	alertContent.addSubview(SubstituteTextField);

	offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing;


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
			return SubstituteTextField.stringValue();

		} else {
			return false;
		}
	}
}



/**
 * Error alert
 * @param {string} message
 */
export function displayError(message) {
	const alert = NSAlert.alloc().init(),
		alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
		alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath);

	alert.setIcon(alertIcon);
	alert.setMessageText('Error');
	alert.setInformativeText(message);
	// Buttons
	alert.addButtonWithTitle('OK');

	// Display alert
	alert.runModal();
}



/**
 * Creates a progress modal
 * @returns {function}
 */
export function progress() {
	let documentWindow = document.sketchObject.windowControllers()[0].window();
	let mySheetWindow = NSWindow.alloc().initWithContentRect_styleMask_backing_defer(
		NSMakeRect(0, 0, 200, 100),
		(NSWindowStyleMaskTitled | NSWindowStyleMaskDocModalWindow),
		NSBackingStoreBuffered,
		true
	);

	let progressView = NSProgressIndicator
		.alloc()
		.initWithFrame(NSMakeRect(20, 20, 160, 12));
	progressView.setControlTint(NSBlueControlTint);
	progressView.indeterminate = false;
	progressView.minValue = 0;
	progressView.maxValue = 100;
	progressView.doubleValue = 5;
	progressView.startAnimation(true);

	mySheetWindow.contentView().addSubview(progressView);
	documentWindow.beginSheet_completionHandler(mySheetWindow, nil);

	// TODO: use function generator?
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
	return {
		close: () => documentWindow.endSheet(mySheetWindow),
		increment: value => progressView.incrementBy(value),
	};
}