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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/my-command.js");
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

/***/ "./src/lib/ui.js":
/*!***********************!*\
  !*** ./src/lib/ui.js ***!
  \***********************/
/*! exports provided: setKeyOrder, createBoldLabel, createField, createSelect */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setKeyOrder", function() { return setKeyOrder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBoldLabel", function() { return createBoldLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createField", function() { return createField; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSelect", function() { return createSelect; });
function setKeyOrder(alert, order) {
  for (var i = 0; i < order.length; i++) {
    var thisItem = order[i],
        nextItem = order[i + 1];
    if (nextItem) thisItem.setNextKeyView(nextItem);
  }

  alert.window().setInitialFirstResponder(order[0]);
}
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

/***/ "./src/my-command.js":
/*!***************************!*\
  !*** ./src/my-command.js ***!
  \***************************/
/*! exports provided: onStartup, onShutdown, onSupplyData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onStartup", function() { return onStartup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onShutdown", function() { return onShutdown; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onSupplyData", function() { return onSupplyData; });
var sketch = __webpack_require__(/*! sketch */ "sketch");

var DataSupplier = sketch.DataSupplier;

var util = __webpack_require__(/*! util */ "util");

var fetch = __webpack_require__(/*! sketch-polyfill-fetch */ "./node_modules/sketch-polyfill-fetch/lib/index.js"); // const Airtable = require('airtable');


var _require = __webpack_require__(/*! ./secret */ "./src/secret.js"),
    APIKey = _require.APIKey,
    bases = _require.bases,
    table = _require.table,
    view = _require.view;

var _require2 = __webpack_require__(/*! ./lib/ui */ "./src/lib/ui.js"),
    createBoldLabel = _require2.createBoldLabel,
    createField = _require2.createField,
    createSelect = _require2.createSelect,
    setKeyOrder = _require2.setKeyOrder;

var document = __webpack_require__(/*! sketch/dom */ "sketch/dom").getSelectedDocument(); // const base = new Airtable({ apiKey: 'keyf4awab19Xtmlye' }).base('appvF01ICAgG9SQ7w');


var baseNames = Object.keys(bases).map(function (base) {
  return base;
});
var langs = ['en_US', 'en_UK', 'fr_FR']; // Setting variables

var defaultSettings = {};
defaultSettings.APIKey = APIKey;
defaultSettings.base = bases.rvt2skp;
defaultSettings.maxRecords = 15;
defaultSettings.view = view;
defaultSettings.lang = langs[0];
function onStartup() {
  DataSupplier.registerDataSupplier('public.text', 'Sketch Airtable Sync', 'SupplyData');
}
function onShutdown() {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers();
}
function onSupplyData(context) {
  var sketchDataKey = context.data.key;
  var items = util.toArray(context.data.items).map(sketch.fromNative); // Create UI

  var userSettings = getUserSettings(defaultSettings);
  log(userSettings); // We iterate on each target for data

  items.forEach(function (item, index) {
    var layerName;

    if (item.type === 'DataOverride') {
      layerName = item.override.affectedLayer.name;
    } else if (item.type === 'Text') {
      layerName = item.name;
    } // console.log('layername', layerName);


    var layer;

    switch (item.type) {
      case 'DataOverride':
        layer = document.getLayerWithID(item.symbolInstance.id);
        break;

      case 'Text':
        layer = document.getLayerWithID(item.id);
        break;

      default:
        break;
    }

    if (layer.getParentArtboard()) {
      var _table = layer.getParentArtboard().name;
      var apiEndpoint = encodeURI("https://api.airtable.com/v0/".concat(userSettings.base, "/").concat(_table, "?maxRecords=").concat(userSettings.maxRecords, "&view=").concat(userSettings.view, "&api_key=").concat(userSettings.APIKey));
      fetch(apiEndpoint).then(function (res) {
        return res.json();
      }).then(function (data) {
        data.records.reverse().map(function (record, index) {
          // let { contentID, 'Copy Content': copy } = record.fields;
          if (record.fields.Name === layerName) {
            // const airtableDataKey = record.fields.Key;
            var _data = record.fields[userSettings.lang]; // console.log('sketchDataKey', sketchDataKey);
            // console.log('data', data);

            DataSupplier.supplyDataAtIndex(sketchDataKey, _data, index);
          }
        });
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
      }); // base(artboardName)
      // 	.select({
      // 		maxRecords: 3,
      // 		view: 'Grid view',
      // 	}).eachPage(function page(records, fetchNextPage) {
      // 		records.forEach(function(record) {
      // 			console.log('Retrieved', record.get('Title'));
      // 		});
      // 		fetchNextPage();
      // 	}, function done(err) {
      // 		if (err) { console.error(err); return; }
      // 	});
      // console.log(base('Success').find('rec1l5DNXef6v3Oq4'));
    } // let data = Math.random().toString();
    // DataSupplier.supplyDataAtIndex(sketchDataKey, data, index);

  });
}

function getUserSettings(defaultSettings) {
  var alert = NSAlert.alloc().init(),
      alertIconPath = context.plugin.urlForResourceNamed('icon.png').path(),
      alertIcon = NSImage.alloc().initByReferencingFile(alertIconPath),
      alertContent = NSView.alloc().init();
  alert.setIcon(alertIcon);
  alert.setMessageText('Airtable');
  alert.setInformativeText('lorem');
  alertContent.setFlipped(true); // UI Settings

  var labelWidth = 100;
  var labelHeight = 24;
  var fieldWidth = 150;
  var fieldHeight = 28;
  var fieldSpacing = 20;
  var offsetY = 0; // API Key

  var APIKeyLabel = createBoldLabel('API Key', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(APIKeyLabel);
  var APIKeyField = createField(defaultSettings.APIKey, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(APIKeyField);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Select base (Project)

  var baseLabel = createBoldLabel('Base', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(baseLabel);
  var baseSelect = createSelect(baseNames, 0, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(baseSelect);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Language

  var langLabel = createBoldLabel('Language', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(langLabel);
  var langSelect = createSelect(langs, 0, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(langSelect);
  offsetY = CGRectGetMaxY(alertContent.subviews().lastObject().frame()) + fieldSpacing; // Max records

  var maxRecordsLabel = createBoldLabel('Max records', 12, NSMakeRect(0, offsetY, fieldWidth, labelHeight));
  alertContent.addSubview(maxRecordsLabel);
  var maxRecordsField = createField(defaultSettings.maxRecords, NSMakeRect(labelWidth, offsetY, fieldWidth, fieldHeight));
  alertContent.addSubview(maxRecordsField);
  alertContent.frame = NSMakeRect(0, 20, 300, CGRectGetMaxY(alertContent.subviews().lastObject().frame()));
  alert.accessoryView = alertContent; // Buttons
  // const buttonOk = alert.addButtonWithTitle('OK');
  // const buttonCancel = alert.addButtonWithTitle('Cancel');
  // setKeyOrder(alert, [
  // 	baseLabel,
  // 	baseSelect,
  // 	langLabel,
  // 	langSelect,
  // 	buttonOk,
  // ]);

  alert.runModal(); // Display alert
  // var responseCode = alert.runModal();
  // log('responseCode', responseCode);
  // if (responseCode === 1000) {

  return {
    APIKey: APIKeyField.stringValue(),
    base: bases[baseNames[baseSelect.indexOfSelectedItem()]],
    view: view,
    maxRecords: maxRecordsField.stringValue(),
    lang: langs[langSelect.indexOfSelectedItem()]
  }; // } else {
  // 	return false;
  // }
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
    kubity: 'appspzJrn3jpBxBt1',
    rvt2skp: 'appvF01ICAgG9SQ7w'
  },
  table: 'YOUR-TABLE-NAME',
  view: 'Grid view'
};

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

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['onStartup'] = __skpm_run.bind(this, 'onStartup');
that['onShutdown'] = __skpm_run.bind(this, 'onShutdown');
that['onSupplyData'] = __skpm_run.bind(this, 'onSupplyData');
that['onRun'] = __skpm_run.bind(this, 'default')

//# sourceMappingURL=my-command.js.map