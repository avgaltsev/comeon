(function (window) {
	"use strict";

	var requirePattern = /\brequire\(("|')([^"']+)\1\)/g;

	function normalizePath(rawPath) {
		var path = [];

		rawPath.split("/").forEach(function (value) {
			if (value === ".") {
			} else if (value === "..") {
				path.pop();
			} else if (/[\w\-\.]+/.test(value)) {
				path.push(value);
			}
		});

		return path.join("/");
	}

	function normalizeId(rawId) {
		return normalizePath(rawId.replace(/\.js$/, ""));
	}

	// function getModuleContext(moduleId) {
	// 	return moduleId.slice(0, moduleId.lastIndexOf("/") + 1);
	// }

	function require(moduleContext, moduleRequest) {
		var self = this;

		var moduleId = getModuleId(moduleContext, moduleRequest);

		if (self._modules && self._modules[moduleId] && self._modules[moduleId].exports) {
			return self._modules[moduleId].exports;
		} else {
			throw new Error("Module not found: \"" + moduleId + "\"");
		}
	}

	/**
	 * @class Comeon
	 */
	function Comeon(options) {
		options = options || {};

		this._path = options.path ? ("" + options.path) : "/";

		if (this._path[this._path.length - 1] !== "/") {
			this._path = this._path + "/";
		}

		this._map = options.map;

		this._modules = {};
	}

	var prototype = Comeon.prototype;

	/**
	 * @method require
	 */
	prototype.require = function require(dependencies) {
		return this._registerModules(null, dependencies).then(this._loadModules.bind(this));
	};

	/**
	 * @method _registerModules
	 */
	prototype._registerModules = function _registerModules(contextModule, dependencies) {
		var path = contextModule ? contextModule.path : [];

		if (!Array.isArray(dependencies)) {
			dependencies = [dependencies];
		}

		return Promise.all(dependencies.map(function (dependency) {
			if (dependency.indexOf("/") && dependency.indexOf("./") && dependency.indexOf("../")) {
				return this._findToplevelModule(contextModule, path, dependency);
			} else {
				return this._findRelativeModule(contextModule, normalizePath(path.concat(dependency).join("/")));
			}
		}, this));
	};

	/**
	 * @method _findToplevelModule
	 */
	prototype._findToplevelModule = function _findToplevelModule(contextModule, path, dependency) {
		var promise = this._findRelativeModule(contextModule, normalizePath(path.concat("node_modules", dependency).join("/")));

		if (path.length) {
			promise = promise.catch(this._findToplevelModule.bind(this, contextModule, path.slice(0, -1), dependency));
		}

		return promise;
	};

	/**
	 * @method _findRelativeModule
	 */
	prototype._findRelativeModule = function _findRelativeModule(contextModule, id) {
		if (this._modules[id]) {
			return Promise.resolve(this._modules[id]);
		}

		var tryOne = this._fetchModuleData.bind(this, id, id + ".js"),
			tryTwo = this._fetchModuleData.bind(this, id, id + "/index.js"),
			tryThree = (function () {
				return this._fetchFile(id + "/package.json").then((function (contents) {
					var filename;

					try {
						filename = normalizePath(id + "/" + JSON.parse(contents).main);
					} catch (exception) {
						return Promise.reject();
					}

					return this._fetchModuleData(id, filename);
				}).bind(this));
			}).bind(this);

		return tryOne().catch(tryTwo).catch(tryThree).then(this._registerModule.bind(this, contextModule));
	};

	/**
	 * @method _fetchModuleData
	 */
	prototype._fetchModuleData = function _fetchModuleData(id, filename) {
		var path = id.split("/").slice(0, -1);

		return this._fetchFile(filename).then(function (contents) {
			var dependencies = [],
				matches;

			while ((matches = requirePattern.exec(contents)) !== null) {
				dependencies.push(matches[2]);
			}

			return {
				id: id,
				path: path,
				filename: filename,
				dependencies: dependencies
			}
		});
	};

	/**
	 * @method _fetchFile
	 */
	prototype._fetchFile = function _fetchFile(url) {
		return new Promise((function (resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.open("GET", this._path + url);

			xhr.addEventListener('readystatechange', function (event) {
				var xhr = event.target;

				if (xhr.status === 200) {
					if (xhr.readyState === 4) {
						resolve(xhr.responseText);
					}
				} else {
					reject(url);
				}
			});

			xhr.send();
		}).bind(this));
	};

	/**
	 * @method _registerModule
	 */
	prototype._registerModule = function _registerModule(contextModule, moduleData) {
		var module = this._modules[moduleData.id] = {
			id: moduleData.id,
			path: moduleData.path,
			filename: moduleData.filename,
			dependencies: {},
			exports: {},
			loaded: false
		};

		if (contextModule) {
			contextModule.dependencies[moduleData.id] = module;
		}

		return this._registerModules(module, moduleData.dependencies);
	};

	// prototype._getModuleId = function _getModuleId(contextModule, dependency) {
	// 	var moduleId = [];

	// 	(/^\.\.?\//.test(dependency) ? (moduleContext + dependency) : dependency).replace(/\.js$/, "").split("/").forEach(function (value) {
	// 		if (value === ".") {
	// 		} else if (value === "..") {
	// 			moduleId.pop();
	// 		} else if (/[\w\-\.]+/.test(value)) {
	// 			moduleId.push(value);
	// 		}
	// 	});

	// 	return moduleId.join("/");
	// };

	/**
	 * @method _loadModules
	 */
	prototype._loadModules = function _loadModules() {
		var modules;

		while ((modules = this._getIndependentModules()).length) {
			modules.forEach(this._loadModule.bind(this));
		}
	};

	/**
	 * @method _getIndependentModules
	 */
	prototype._getIndependentModules = function _getIndependentModules() {
	};

	/**
	 * @method _loadModule
	 */
	prototype._loadModule = function _loadModule(module) {
	};

	// prototype._loadNextModule = function loadNextModule(moduleQueue, callback) {
	// 	var self = this;

	// 	if (moduleQueue.length) {
	// 		var iframe = document.createElement("iframe");

	// 		iframe.src = "about:blank";
	// 		iframe.style.display = "none";

	// 		iframe.onload = function () {
	// 			var moduleId = moduleQueue.pop();

	// 			var iframeWindow = this.contentWindow;
	// 			var iframeDocument = this.contentDocument;

	// 			iframeWindow.global = window;

	// 			iframeWindow.require = require.bind(self, self._modules[moduleId].context);

	// 			iframeWindow.module = {
	// 				exports: {}
	// 			};

	// 			iframeWindow.exports = iframeWindow.module.exports;

	// 			var script = iframeDocument.createElement("script");

	// 			script.src = self._modules[moduleId].url;

	// 			script.onload = function () {
	// 				self._modules[moduleId].exports = iframeWindow.module.exports;

	// 				if (moduleQueue.length) {
	// 					loadNextModule.bind(self)(moduleQueue, callback);
	// 				} else if (typeof callback === "function") {
	// 					callback(self._modules[moduleId].exports);
	// 				}
	// 			};

	// 			iframeDocument.head.appendChild(script);
	// 		};

	// 		document.body.appendChild(iframe);
	// 	} else if (typeof callback === "function") {
	// 		callback();
	// 	}
	// };

	window.Comeon = Comeon;

	var script = Array.prototype.slice.call(document.getElementsByTagName("script"), -1)[0],
		path = script.getAttribute("data-path"),
		main = script.getAttribute("data-main");

	if (main) {
		window.comeon = new Comeon(path);

		window.addEventListener("load", function () {
			window.comeon.require(main);
		});
	}
})(window);
