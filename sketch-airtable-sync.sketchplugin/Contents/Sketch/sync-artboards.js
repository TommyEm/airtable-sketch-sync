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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/sync-artboards.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@skpm/timers/immediate.js":
/*!************************************************!*\
  !*** ./node_modules/@skpm/timers/immediate.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* globals coscript, sketch */
var timeout = __webpack_require__(/*! ./timeout */ "./node_modules/@skpm/timers/timeout.js")

function setImmediate(func, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10) {
  return timeout.setTimeout(func, 0, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10)
}

function clearImmediate(id) {
  return timeout.clearTimeout(id)
}

module.exports = {
  setImmediate: setImmediate,
  clearImmediate: clearImmediate
}


/***/ }),

/***/ "./node_modules/@skpm/timers/test-if-fiber.js":
/*!****************************************************!*\
  !*** ./node_modules/@skpm/timers/test-if-fiber.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function () {
  return typeof coscript !== 'undefined' && coscript.createFiber
}


/***/ }),

/***/ "./node_modules/@skpm/timers/timeout.js":
/*!**********************************************!*\
  !*** ./node_modules/@skpm/timers/timeout.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* globals coscript, sketch */
var fiberAvailable = __webpack_require__(/*! ./test-if-fiber */ "./node_modules/@skpm/timers/test-if-fiber.js")

var setTimeout
var clearTimeout

var fibers = []

if (fiberAvailable()) {
  var fibers = []

  setTimeout = function (func, delay, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10) {
    // fibers takes care of keeping coscript around
    var id = fibers.length
    fibers.push(coscript.scheduleWithInterval_jsFunction(
      (delay || 0) / 1000,
      function () {
        func(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10)
      }
    ))
    return id
  }

  clearTimeout = function (id) {
    var timeout = fibers[id]
    if (timeout) {
      timeout.cancel() // fibers takes care of keeping coscript around
      fibers[id] = undefined // garbage collect the fiber
    }
  }
} else {
  setTimeout = function (func, delay, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10) {
    coscript.shouldKeepAround = true
    var id = fibers.length
    fibers.push(true)
    coscript.scheduleWithInterval_jsFunction(
      (delay || 0) / 1000,
      function () {
        if (fibers[id]) { // if not cleared
          func(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10)
        }
        clearTimeout(id)
        if (fibers.every(function (_id) { return !_id })) { // if everything is cleared
          coscript.shouldKeepAround = false
        }
      }
    )
    return id
  }

  clearTimeout = function (id) {
    fibers[id] = false
  }
}

module.exports = {
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
}


/***/ }),

/***/ "./node_modules/promise-polyfill/lib/index.js":
/*!****************************************************!*\
  !*** ./node_modules/promise-polyfill/lib/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(setTimeout, setImmediate) {

/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function() {
        // @ts-ignore
        return constructor.reject(reason);
      });
    }
  );
}

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined');
}

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new');
  if (typeof fn !== 'function') throw new TypeError('not a function');
  /** @type {!number} */
  this._state = 0;
  /** @type {!boolean} */
  this._handled = false;
  /** @type {Promise|undefined} */
  this._value = undefined;
  /** @type {!Array<!Function>} */
  this._deferreds = [];

  doResolve(fn, this);
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  self._handled = true;
  Promise._immediateFn(function() {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
      return;
    }
    var ret;
    try {
      ret = cb(self._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve(deferred.promise, ret);
  });
}

function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.');
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function')
    ) {
      var then = newValue.then;
      if (newValue instanceof Promise) {
        self._state = 3;
        self._value = newValue;
        finale(self);
        return;
      } else if (typeof then === 'function') {
        doResolve(bind(then, newValue), self);
        return;
      }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
  } catch (e) {
    reject(self, e);
  }
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    Promise._immediateFn(function() {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value);
      }
    });
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = null;
}

/**
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, self) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done) return;
        done = true;
        resolve(self, value);
      },
      function(reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(self, ex);
  }
}

Promise.prototype['catch'] = function(onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop);

  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};

Promise.prototype['finally'] = finallyConstructor;

Promise.all = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array'));
    }

    var args = Array.prototype.slice.call(arr);
    if (args.length === 0) return resolve([]);
    var remaining = args.length;

    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then;
          if (typeof then === 'function') {
            then.call(
              val,
              function(val) {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        args[i] = val;
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex);
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.resolve = function(value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value;
  }

  return new Promise(function(resolve) {
    resolve(value);
  });
};

Promise.reject = function(value) {
  return new Promise(function(resolve, reject) {
    reject(value);
  });
};

Promise.race = function(arr) {
  return new Promise(function(resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array'));
    }

    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject);
    }
  });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediate === 'function' &&
    function(fn) {
      // @ts-ignore
      setImmediate(fn);
    }) ||
  function(fn) {
    setTimeoutFunc(fn, 0);
  };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
  }
};

module.exports = Promise;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@skpm/timers/timeout.js */ "./node_modules/@skpm/timers/timeout.js")["setTimeout"], __webpack_require__(/*! ./node_modules/@skpm/timers/immediate.js */ "./node_modules/@skpm/timers/immediate.js")["setImmediate"]))

/***/ }),

/***/ "./node_modules/sketch-polyfill-fetch/lib/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/sketch-polyfill-fetch/lib/index.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Promise) {/* globals NSJSONSerialization NSJSONWritingPrettyPrinted NSDictionary NSHTTPURLResponse NSString NSASCIIStringEncoding NSUTF8StringEncoding coscript NSURL NSMutableURLRequest NSMutableData NSURLConnection */
var Buffer;
try {
  Buffer = __webpack_require__(/*! buffer */ "buffer").Buffer;
} catch (err) {}

function response(httpResponse, data) {
  var keys = [];
  var all = [];
  var headers = {};
  var header;

  for (var i = 0; i < httpResponse.allHeaderFields().allKeys().length; i++) {
    var key = httpResponse
      .allHeaderFields()
      .allKeys()
      [i].toLowerCase();
    var value = String(httpResponse.allHeaderFields()[key]);
    keys.push(key);
    all.push([key, value]);
    header = headers[key];
    headers[key] = header ? header + "," + value : value;
  }

  return {
    ok: ((httpResponse.statusCode() / 200) | 0) == 1, // 200-399
    status: Number(httpResponse.statusCode()),
    statusText: String(
      NSHTTPURLResponse.localizedStringForStatusCode(httpResponse.statusCode())
    ),
    useFinalURL: true,
    url: String(httpResponse.URL().absoluteString()),
    clone: response.bind(this, httpResponse, data),
    text: function() {
      return new Promise(function(resolve, reject) {
        const str = String(
          NSString.alloc().initWithData_encoding(data, NSASCIIStringEncoding)
        );
        if (str) {
          resolve(str);
        } else {
          reject(new Error("Couldn't parse body"));
        }
      });
    },
    json: function() {
      return new Promise(function(resolve, reject) {
        var str = String(
          NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding)
        );
        if (str) {
          // parse errors are turned into exceptions, which cause promise to be rejected
          var obj = JSON.parse(str);
          resolve(obj);
        } else {
          reject(
            new Error(
              "Could not parse JSON because it is not valid UTF-8 data."
            )
          );
        }
      });
    },
    blob: function() {
      return Promise.resolve(data);
    },
    arrayBuffer: function() {
      return Promise.resolve(Buffer.from(data));
    },
    headers: {
      keys: function() {
        return keys;
      },
      entries: function() {
        return all;
      },
      get: function(n) {
        return headers[n.toLowerCase()];
      },
      has: function(n) {
        return n.toLowerCase() in headers;
      }
    }
  };
}

// We create one ObjC class for ourselves here
var DelegateClass;

function fetch(urlString, options) {
  if (
    typeof urlString === "object" &&
    (!urlString.isKindOfClass || !urlString.isKindOfClass(NSString))
  ) {
    options = urlString;
    urlString = options.url;
  }
  options = options || {};
  if (!urlString) {
    return Promise.reject("Missing URL");
  }
  var fiber;
  try {
    fiber = coscript.createFiber();
  } catch (err) {
    coscript.shouldKeepAround = true;
  }
  return new Promise(function(resolve, reject) {
    var url = NSURL.alloc().initWithString(urlString);
    var request = NSMutableURLRequest.requestWithURL(url);
    request.setHTTPMethod(options.method || "GET");

    Object.keys(options.headers || {}).forEach(function(i) {
      request.setValue_forHTTPHeaderField(options.headers[i], i);
    });

    if (options.body) {
      var data;
      if (typeof options.body === "string") {
        var str = NSString.alloc().initWithString(options.body);
        data = str.dataUsingEncoding(NSUTF8StringEncoding);
      } else if (Buffer && Buffer.isBuffer(options.body)) {
        data = options.body.toNSData();
      } else if (
        options.body.isKindOfClass &&
        options.body.isKindOfClass(NSData) == 1
      ) {
        data = options.body;
      } else if (options.body._isFormData) {
        var boundary = options.body._boundary;
        data = options.body._data;
        data.appendData(
          NSString.alloc()
            .initWithString("--" + boundary + "--\r\n")
            .dataUsingEncoding(NSUTF8StringEncoding)
        );
        request.setValue_forHTTPHeaderField(
          "multipart/form-data; boundary=" + boundary,
          "Content-Type"
        );
      } else {
        var error;
        data = NSJSONSerialization.dataWithJSONObject_options_error(
          options.body,
          NSJSONWritingPrettyPrinted,
          error
        );
        if (error != null) {
          return reject(error);
        }
        request.setValue_forHTTPHeaderField(
          "" + data.length(),
          "Content-Length"
        );
      }
      request.setHTTPBody(data);
    }

    if (options.cache) {
      switch (options.cache) {
        case "reload":
        case "no-cache":
        case "no-store": {
          request.setCachePolicy(1); // NSURLRequestReloadIgnoringLocalCacheData
        }
        case "force-cache": {
          request.setCachePolicy(2); // NSURLRequestReturnCacheDataElseLoad
        }
        case "only-if-cached": {
          request.setCachePolicy(3); // NSURLRequestReturnCacheDataElseLoad
        }
      }
    }

    if (!options.credentials) {
      request.setHTTPShouldHandleCookies(false);
    }

    var finished = false;

    var connection = NSURLSession.sharedSession().dataTaskWithRequest_completionHandler(
      request,
      __mocha__.createBlock_function(
        'v32@?0@"NSData"8@"NSURLResponse"16@"NSError"24',
        function(data, res, error) {
          if (fiber) {
            fiber.cleanup();
          } else {
            coscript.shouldKeepAround = false;
          }
          if (error) {
            finished = true;
            return reject(error);
          }
          return resolve(response(res, data));
        }
      )
    );

    connection.resume();

    if (fiber) {
      fiber.onCleanup(function() {
        if (!finished) {
          connection.cancel();
        }
      });
    }
  });
}

module.exports = fetch;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/promise-polyfill/lib/index.js */ "./node_modules/promise-polyfill/lib/index.js")))

/***/ }),

/***/ "./src/defaults.js":
/*!*************************!*\
  !*** ./src/defaults.js ***!
  \*************************/
/*! exports provided: baseNames, langs, views, getDefaultOptions */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseNames", function() { return baseNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "langs", function() { return langs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "views", function() { return views; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultOptions", function() { return getDefaultOptions; });
var _require = __webpack_require__(/*! sketch */ "sketch"),
    Settings = _require.Settings;

var _require2 = __webpack_require__(/*! ./secret */ "./src/secret.js"),
    bases = _require2.bases;

var baseNames = Object.keys(bases).map(function (base) {
  return base;
});
var langs = ['en_US', 'en_UK', 'fr_FR'];
var views = ['Grid view'];
function getDefaultOptions() {
  var defaultOptions = {};
  var pluginOptions = Settings.settingForKey('sketchAirtableSync');

  if (pluginOptions) {
    defaultOptions.base = pluginOptions.base;
    defaultOptions.maxRecords = pluginOptions.maxRecords;
    defaultOptions.view = pluginOptions.view;
    defaultOptions.lang = pluginOptions.lang;
  } else {
    defaultOptions.base = baseNames[0];
    defaultOptions.maxRecords = 15;
    defaultOptions.view = views[0];
    defaultOptions.lang = langs[0];
  }

  return defaultOptions;
}

/***/ }),

/***/ "./src/lib/alert.js":
/*!**************************!*\
  !*** ./src/lib/alert.js ***!
  \**************************/
/*! exports provided: getUserOptions, setPlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUserOptions", function() { return getUserOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setPlugin", function() { return setPlugin; });
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
  alertContent.frame = NSMakeRect(0, 20, 300, CGRectGetMaxY(alertContent.subviews().lastObject().frame()));
  alert.accessoryView = alertContent; // Display alert

  var responseCode = alert.runModal();

  if (responseCode == NSAlertFirstButtonReturn) {
    if (responseCode === 1000) {
      var pluginOptions = {
        base: baseSelect.stringValue(),
        view: viewSelect.stringValue(),
        maxRecords: maxRecordsField.stringValue(),
        lang: langSelect.stringValue()
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

/***/ "./src/lib/utils.js":
/*!**************************!*\
  !*** ./src/lib/utils.js ***!
  \**************************/
/*! exports provided: getApiEndpoint, removeEmojis */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getApiEndpoint", function() { return getApiEndpoint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeEmojis", function() { return removeEmojis; });
function getApiEndpoint(base, table, maxRecords, view, APIKey) {
  return encodeURI("https://api.airtable.com/v0/".concat(base, "/").concat(table, "?maxRecords=").concat(maxRecords, "&view=").concat(view, "&api_key=").concat(APIKey));
}
/**
 * Support for emojis in layer names (they will be ignored)
 * @param {string} string
 * @returns {string}
 */

function removeEmojis(string) {
  var emojis = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

  if (string.match(emojis)) {
    return string.replace(emojis, '').replace('️', '') // Beware, there's an invisible character here
    .trim();
  } else {
    return string.trim();
  }
}

/***/ }),

/***/ "./src/secret.js":
/*!***********************!*\
  !*** ./src/secret.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  APIKey: 'keyf4awab19Xtmlye',
  bases: {
    archiklip: 'appah63sWZZp4m8Na',
    kubity: 'appkfJduoblSphVdp',
    rvt2skp: 'appegmk9i1AWF5vwg'
  },
  table: 'YOUR-TABLE-NAME',
  view: 'Grid view'
};

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

/***/ "./src/sync-artboards.js":
/*!*******************************!*\
  !*** ./src/sync-artboards.js ***!
  \*******************************/
/*! exports provided: syncAllArtboards, syncSelectedArtboards */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(fetch, setTimeout) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "syncAllArtboards", function() { return syncAllArtboards; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "syncSelectedArtboards", function() { return syncSelectedArtboards; });
function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var sketch = __webpack_require__(/*! sketch */ "sketch");

var document = __webpack_require__(/*! sketch/dom */ "sketch/dom").getSelectedDocument();

var _require = __webpack_require__(/*! sketch/dom */ "sketch/dom"),
    SymbolMaster = _require.SymbolMaster;

var _require2 = __webpack_require__(/*! ./settings */ "./src/settings.js"),
    pluginSettings = _require2.pluginSettings;

var _require3 = __webpack_require__(/*! ./secret */ "./src/secret.js"),
    bases = _require3.bases;

var _require4 = __webpack_require__(/*! ./lib/alert */ "./src/lib/alert.js"),
    getUserOptions = _require4.getUserOptions;

var _require5 = __webpack_require__(/*! ./defaults */ "./src/defaults.js"),
    getDefaultOptions = _require5.getDefaultOptions,
    baseNames = _require5.baseNames,
    langs = _require5.langs;

var _require6 = __webpack_require__(/*! ./lib/utils */ "./src/lib/utils.js"),
    getApiEndpoint = _require6.getApiEndpoint,
    removeEmojis = _require6.removeEmojis;

var foreignSymbolMasters = getForeignSymbolMasters(document);
var defaultOptions = getDefaultOptions();
function syncAllArtboards(context) {
  log('Sync all artboards on page'); // Get user options from modal

  var userOptions = getUserOptions(defaultOptions, baseNames, langs);

  if (userOptions) {
    var currentPage = 0; // Get Pages

    document.pages.forEach(function (page) {
      page.layers.forEach(function (layer) {
        // Get Artboards
        if (layer.type === 'Artboard') {
          syncArtboard(layer, userOptions);
        }
      });

      if (currentPage === document.pages.length) {
        sketch.UI.message('Sync finished');
      } else {
        ++currentPage;
      }
    });
  }
}
function syncSelectedArtboards(context) {
  log('Sync Selected'); // Get user options from modal

  var userOptions = getUserOptions(defaultOptions, baseNames, langs);

  if (userOptions) {
    document.selectedLayers.forEach(function (layer) {
      if (layer.type === 'Artboard') {
        log('Artboard');
        syncArtboard(layer, userOptions);
      } else {
        log(layer.name);
      }
    });
    sketch.UI.message('Sync finished!');
  }
}
/**
 * Sync a single artboard
 * @param {object} artboard
 * @param {object} options
 */

function syncArtboard(artboard, options) {
  var table = artboard.name;
  var base = bases[options.base];
  var commonDataApiEndpoint = getApiEndpoint(base, 'Global Template', options.maxRecords, options.view, pluginSettings.APIKey);
  var commonData;
  fetch(commonDataApiEndpoint).then(function (res) {
    return res.json();
  }).then(function (data) {
    commonData = data;
  }).catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
    } else if (error.request) {
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

    console.log(error.config);
  });
  setTimeout(function () {
    var apiEndpoint = getApiEndpoint(base, table, options.maxRecords, options.view, pluginSettings.APIKey);
    fetch(apiEndpoint).then(function (res) {
      return res.json();
    }).then(function (data) {
      syncLayer(artboard, commonData, options, []);
      syncLayer(artboard, data, options, []);
    }).then(function () {
      log('DONE');
    }).catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }

      console.log(error.config);
    });
  }, 1050);
}
/**
 * Sync a single layer upon his type
 *
 * Symbols parentLayers stucture:
 * - Symbol
 *   - overrides
 *     - {
 *         - type
 *         - value
 *         - affectedLayer
 *            - name
 * 			  - type
 *       }
 * @param {object} parentLayers
 * @param {object} data
 * @param {object} commonData
 * @param {object} options
 * @param {array} layersHierarchy
 */


function syncLayer(parentLayers, data, options, layersHierarchy) {
  parentLayers.layers.forEach(function (layer) {
    if (layer.hidden === false) {
      // We don't sync hidden layers
      switch (layer.type) {
        case 'SymbolInstance':
          var symbolName = layer.name;
          layer.overrides.forEach(function (override) {
            if (override.affectedLayer.type === 'SymbolInstance' || override.affectedLayer.type === 'Text') {
              // We need to get the full and clean name of the override
              var _layerFullPath = layersHierarchy.join(' / ');

              var overrideFullName = getOverrideFullName(symbolName, override);

              var _layerName = removeEmojis(override.affectedLayer.name); // Update values


              updateLayerValue(data, override, _layerName, options, _layerFullPath, overrideFullName);
            }
          });
          break;

        case 'Text':
          var layerName = removeEmojis(layer.name);
          var layerFullPath = layersHierarchy.join(' / ');
          updateLayerValue(data, layer, layerName, options, layerFullPath);
          break;

        case 'Group':
          var newLayersHierarchy = _toConsumableArray(layersHierarchy);

          newLayersHierarchy.push(layer.name);
          syncLayer(layer, data, options, newLayersHierarchy);
          break;

        default:
          break;
      }
    }
  });
}
/**
 * Sync a layer content with Airtable
 * @param {object} data
 * @param {object} layer
 * @param {string} layerName
 * @param {object} options
 * @param {string} layerFullPath
 * @param {string} symbolName
 */


function updateLayerValue(data, layer, layerName, options, layerFullPath, symbolName) {
  var lang = options.lang; // Language selected

  data.records.reverse().map(function (record) {
    var recordName = record.fields.Name;
    var names = recordName.split('/');
    var recordNames = [];
    recordNames = names.map(function (name) {
      return name.trim();
    });
    var reg = new RegExp(recordNames.join('.*'), 'i'); // Check symbol with nested overrides. Record names must use a / (forward slash) for this.
    // Template: "Symbol Name / Override Name"

    if (symbolName) {
      var fullName = layerFullPath + ' / ' + symbolName;

      if (fullName.match(recordNames[0]) && fullName.match(reg)) {
        injectValue(record, layer, lang);
      } // Check nested and non-nested layers

    } else {
      var _fullName = layerFullPath + ' / ' + layerName; // Start by filtering nested record names


      if (recordName.match(/\//) && layerFullPath.match(recordNames[0]) && _fullName.match(reg)) {
        injectValue(record, layer, lang); // Then check non-nested records
      } else if (recordName === layerName && !layerFullPath.match(/\//)) {
        injectValue(record, layer, lang);
      }
    }
  });
}
/**
 * Inject value from Airtable record into Sketch layer
 * @param {object} record
 * @param {object} layer
 */


function injectValue(record, layer, lang) {
  var currentCellData = record.fields[lang];
  var data = currentCellData ? currentCellData : ' ';

  if (!layer.hidden) {
    if (layer.value) {
      layer.value = data;
    } else if (layer.text) {
      layer.text = data;
    }
  }
}
/**
 * Get library master symbols from local instances
 * @param {object} document
 * @returns {object}
 */


function getForeignSymbolMasters(document) {
  var foreignSymbolList = document.sketchObject.documentData().foreignSymbols();
  var symbolMasters = [];
  foreignSymbolList.forEach(function (foreignSymbol) {
    symbolMasters.push(SymbolMaster.fromNative(foreignSymbol.localObject()));
  });
  return symbolMasters;
}
/**
 * Get the name of layer from a library symbol
 * @param {string} layerID
 * @param {object} masters
 * @returns {string}
 */


function getForeignLayerNameWithID(layerID, masters) {
  var match;
  var layerName;

  var _iterator = _createForOfIteratorHelper(masters),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var master = _step.value;
      match = master.sketchObject.layers().find(function (layer) {
        if (layer.objectID() == layerID) {
          layerName = layer.name();
        }

        return layer.objectID() == layerID;
      });

      if (match) {
        break;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return layerName;
}
/**
 * Get the full and clean name of an override. Supports local and library symbols
 * @param {string} symbolName
 * @param {object} override
 * @returns {string}
 */


function getOverrideFullName(symbolName, override) {
  var idHierarchy = override.path.split('/');
  var overrideNameHierarchy = [symbolName];
  idHierarchy.forEach(function (id) {
    var overrideName;
    var overrideNameFromPath = document.getLayerWithID(id);

    if (overrideNameFromPath === undefined) {
      // If it's undefined, the layer comes from a library, we need a special treatment to retrieve it
      overrideName = getForeignLayerNameWithID(id, foreignSymbolMasters);
      overrideName = overrideName ? removeEmojis(overrideName) : undefined;
    } else {
      overrideName = removeEmojis(overrideNameFromPath.name);
    }

    overrideNameHierarchy.push(overrideName);
  });
  return overrideNameHierarchy.join(' / ');
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/sketch-polyfill-fetch/lib/index.js */ "./node_modules/sketch-polyfill-fetch/lib/index.js"), __webpack_require__(/*! ./node_modules/@skpm/timers/timeout.js */ "./node_modules/@skpm/timers/timeout.js")["setTimeout"]))

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("buffer");

/***/ }),

/***/ "sketch":
/*!*************************!*\
  !*** external "sketch" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch");

/***/ }),

/***/ "sketch/dom":
/*!*****************************!*\
  !*** external "sketch/dom" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("sketch/dom");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['syncAllArtboards'] = __skpm_run.bind(this, 'syncAllArtboards');
that['onRun'] = __skpm_run.bind(this, 'default');
that['syncSelectedArtboards'] = __skpm_run.bind(this, 'syncSelectedArtboards')

//# sourceMappingURL=sync-artboards.js.map