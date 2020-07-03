var that = this;
function __skpm_run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/settings.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/lib/alert.js":
/*!**************************!*\
  !*** ./src/lib/alert.js ***!
  \**************************/
/*! exports provided: getUserOptions, setPlugin, displayError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUserOptions", function() { return getUserOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setPlugin", function() { return setPlugin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "displayError", function() { return displayError; });
var sketch = __webpack_require__(/*! sketch */ "sketch");

var Settings = sketch.Settings;

var _require = __webpack_require__(/*! ./ui */ "./src/lib/ui.js"),
    createBoldLabel = _require.createBoldLabel,
    createField = _require.createField,
    createSelect = _require.createSelect;

var views = ['Grid view']; // UI Settings

var labelWidth = 100;
var labelHeight = 24;
var fieldWidth = 150;
var fieldHeight = 28;
var fieldSpacing = 20;
/**
 * Create alert modal with options
 * @param {object} defaultOptions
 * @param {array} baseNames
 */

function getUserOptions(defaultOptions, baseNames, langs) {
  var alert = NSAlert.alloc().init(),
      alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
      alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
      alertContent = NSView.alloc().init();
  alert.setIcon(alertIcon);
  alert.setMessageText('Airtable');
  alert.setInformativeText('lorem'); // Buttons

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');
  alertContent.setFlipped(true);
  var offsetY = 0; // Select base (Project)

  var baseLabel = createBoldLabel('Base', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(baseLabel);
  var baseSelect = createSelect(baseNames, baseNames.indexOf(defaultOptions.base), NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(baseSelect);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Language

  var langLabel = createBoldLabel('Language', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(langLabel);
  var langSelect = createSelect(langs, langs.indexOf(defaultOptions.lang), NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(langSelect);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // View

  var viewLabel = createBoldLabel('View', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(viewLabel);
  var viewSelect = createSelect(views, views.indexOf(defaultOptions.view), NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(viewSelect);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Max records

  var maxRecordsLabel = createBoldLabel('Max records', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(maxRecordsLabel);
  var maxRecordsField = createField(defaultOptions.maxRecords, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(maxRecordsField);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Underline color

  var underlineColorLabel = createBoldLabel('Underline color', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(underlineColorLabel);
  var underlineColorField = createField(defaultOptions.underlineColor, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(underlineColorField);
  alertContent.frame = NSMakeRect(0, 20, 300, CGRectGetMaxY(alertContent.subviews().lastObject().frame()));
  alert.accessoryView = alertContent; // Display alert

  var responseCode = alert.runModal();

  if (responseCode == NSAlertFirstButtonReturn) {
    if (responseCode === 1000) {
      var pluginOptions = {
        base: baseSelect.stringValue(),
        view: viewSelect.stringValue(),
        maxRecords: maxRecordsField.stringValue(),
        lang: langSelect.stringValue(),
        underlineColor: underlineColorField.stringValue()
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

function setPlugin(defaultSettings) {
  var alert = NSAlert.alloc().init(),
      alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
      alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
      alertContent = NSView.alloc().init();
  alert.setIcon(alertIcon);
  alert.setMessageText('Sketch Airtable Sync');
  alert.setInformativeText('Settings'); // Buttons

  alert.addButtonWithTitle('OK');
  alert.addButtonWithTitle('Cancel');
  alertContent.setFlipped(true);
  var offsetY = 0; // API Key

  var APIKeyLabel = createBoldLabel('API Key', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(APIKeyLabel);
  var APIKeyField = createField(defaultSettings.APIKey, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(APIKeyField);
  alertContent.frame = NSMakeRect(0, 20, 300, CGRectGetMaxY(alertContent.subviews().lastObject().frame()));
  alert.accessoryView = alertContent; // Display alert

  var responseCode = alert.runModal();

  if (responseCode == NSAlertFirstButtonReturn) {
    if (responseCode === 1000) {
      var pluginSettings = {
        APIKey: APIKeyField.stringValue()
      };
      Settings.setSettingForKey('sketchAirtableSyncSettings', pluginSettings);
      return pluginSettings;
    } else {
      return false;
    }
  }
}
/**
 * Error alert
 * @param {string} message
 */

function displayError(message) {
  var alert = NSAlert.alloc().init(),
      alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
      alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
      alertContent = NSView.alloc().init();
  alert.setIcon(alertIcon);
  alert.setMessageText('Error');
  alert.setInformativeText(message); // Buttons

  alert.addButtonWithTitle('OK'); // Display alert

  alert.runModal();
}

/***/ }),

/***/ "./src/lib/ui.js":
/*!***********************!*\
  !*** ./src/lib/ui.js ***!
  \***********************/
/*! exports provided: createBoldLabel, createField, createSelect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBoldLabel", function() { return createBoldLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createField", function() { return createField; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSelect", function() { return createSelect; });
/**
 * Create a label with bold style
 * @param {string} text 
 * @param {number} size 
 * @param {object} frame 
 */
function createBoldLabel(text, size, frame) {
  var label = NSTextField.alloc().initWithFrame(frame);
  label.setStringValue(text);
  label.setFont(NSFont.boldSystemFontOfSize(size));
  label.setBezeled(false);
  label.setDrawsBackground(false);
  label.setEditable(false);
  label.setSelectable(false);
  return label;
}
/**
 * Create a text field
 * @param {string} value 
 * @param {object} frame 
 */

function createField(value, frame) {
  var field = NSTextField.alloc().initWithFrame(frame);
  field.setStringValue(value);
  return field;
}
/**
 * Create a select field
 * @param {array} items 
 * @param {number} selectedItemIndex 
 * @param {object} frame 
 */

function createSelect(items, selectedItemIndex, frame) {
  var comboBox = NSComboBox.alloc().initWithFrame(frame),
      selectedItemIndex2 = selectedItemIndex > -1 ? selectedItemIndex : 0;
  comboBox.addItemsWithObjectValues(items);
  comboBox.selectItemAtIndex(selectedItemIndex2);
  comboBox.setNumberOfVisibleItems(16);
  comboBox.setCompletes(1);
  return comboBox;
}

/***/ }),

/***/ "./src/settings.js":
/*!*************************!*\
  !*** ./src/settings.js ***!
  \*************************/
/*! exports provided: pluginSettings, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluginSettings", function() { return pluginSettings; });
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sketch */ "sketch");
/* harmony import */ var sketch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sketch__WEBPACK_IMPORTED_MODULE_0__);

var Settings = sketch__WEBPACK_IMPORTED_MODULE_0___default.a.Settings;

var _require = __webpack_require__(/*! ./lib/alert */ "./src/lib/alert.js"),
    setPlugin = _require.setPlugin;

var pluginSettings = Settings.settingForKey('sketchAirtableSyncSettings');
var defaultSettings = {};

if (pluginSettings) {
  defaultSettings.APIKey = pluginSettings.APIKey;
} else {
  defaultSettings.APIKey = '';
}

/* harmony default export */ __webpack_exports__["default"] = (function () {
  setPlugin(defaultSettings);
});

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=settings.js.map