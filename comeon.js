(function (window) {
	
	
	"use strict";
	
	var requirePattern = /(?:^|\s|=|;)require\(("|')([\w-\/\.]*)\1\)/g;
	
	
	function searchRequires(url) {
		
		var requires = [];
		
		var xhr = new XMLHttpRequest();
		
		xhr.open("GET", url, false);
		
		xhr.onreadystatechange = function () {
			
			if ((xhr.readyState === 4) && (xhr.status === 200)) {
				
				var match;
				
				while ((match = requirePattern.exec(xhr.responseText)) !== null) {
					requires.push(match[2]);
				}
				
			} else {
				requires = false;
			}
			
		};
		
		xhr.send();
		
		return requires;
		
	}
	
	
	function getModuleId(moduleContext, moduleRequest) {
		
		var moduleId = [];
		
		(/^\.\.?\//.test(moduleRequest) ? (moduleContext + moduleRequest) : moduleRequest).replace(/\.js$/, "").split("/").forEach(function (value) {
			
			if (value === ".") {
			} else if (value === "..") {
				moduleId.pop();
			} else if (/[\w\-\.]+/.test(value)) {
				moduleId.push(value);
			}
			
		});
		
		return moduleId.join("/");
		
	}
	
	
	function getModuleContext(moduleId) {
		
		return moduleId.slice(0, moduleId.lastIndexOf("/") + 1);
		
	}
	
	
	function require(moduleContext, moduleRequest) {
		
		var self = this;
		
		var moduleId = getModuleId(moduleContext, moduleRequest);
		
		if (self.modules && self.modules[moduleId] && self.modules[moduleId].exports) {
			return self.modules[moduleId].exports;
		} else {
			throw new Error("Module not found: \"" + moduleId + "\"");
		}
		
	}
	
	
	function enqueueModule(moduleId) {
		
		var self = this;
		
		var moduleQueue = [];
		
		//if (!self.modules[moduleId]) {
			
			var moduleUrl = self.path + moduleId + ".js";
			var moduleContext = getModuleContext(moduleId);
			var requires = searchRequires(moduleUrl);
			
			if (!requires) {
				moduleUrl = self.path + moduleId + "/index.js";
				moduleContext = moduleId + "/";
				requires = searchRequires(moduleUrl);
			}
			
			if (requires) {
				
				self.modules[moduleId] = {
					url: moduleUrl,
					context: moduleContext,
					exports: {}
				};
				
				moduleQueue.push(moduleId);
				
				requires.forEach(function (value) {
					enqueueModule.bind(self)(getModuleId(moduleContext, value)).forEach(function (moduleId) {
						var index = moduleQueue.indexOf(moduleId);
						if (~index) {
							moduleQueue.splice(index, 1);
						}
						moduleQueue.push(moduleId);
					});
					//Array.prototype.push.apply(moduleQueue, enqueueModule.bind(self)(getModuleId(moduleContext, value)));
				});
				
			} else {
				self.modules[moduleId] = {};
			}
			
		//}
		
		return moduleQueue;
		
	}
	
	
	function loadNextModule(moduleQueue, callback) {
		
		var self = this;
		
		if (moduleQueue.length) {
			
			var iframe = document.createElement("iframe");
			
			iframe.src = "about:blank";
			iframe.style.display = "none";
			
			iframe.onload = function () {
				
				var moduleId = moduleQueue.pop();
				
				var iframeWindow = this.contentWindow;
				var iframeDocument = this.contentDocument;
				
				iframeWindow.global = window;
				
				iframeWindow.require = require.bind(self, self.modules[moduleId].context);
				
				iframeWindow.module = {
					exports: {}
				};
				
				iframeWindow.exports = iframeWindow.module.exports;
				
				var script = iframeDocument.createElement("script");
				
				script.src = self.modules[moduleId].url;
				
				script.onload = function () {
					
					self.modules[moduleId].exports = iframeWindow.module.exports;
					
					if (moduleQueue.length) {
						loadNextModule.bind(self)(moduleQueue, callback);
					} else if (typeof callback === "function") {
						callback(self.modules[moduleId].exports);
					}
					
				};
				
				iframeDocument.head.appendChild(script);
				
			};
			
			document.body.appendChild(iframe);
			
		} else if (typeof callback === "function") {
			callback();
		}
		
	}
	
	
	function Comeon(path) { // TODO: multiple paths
		
		var self = this;
		
		self.path = path;
		
		self.modules = {};
		
	}
	
	
	Comeon.prototype.require = function require(moduleRequest, callback) {
		
		var self = this;
		
		loadNextModule.bind(self)(enqueueModule.bind(self)(getModuleId("", moduleRequest)), callback);
		
	};
	
	
	window.Comeon = Comeon;
	
	
	var script = Array.prototype.slice.call(document.getElementsByTagName("script"), -1)[0];
	
	var main = script.getAttribute("data-main");
	
	if (main) {
		
		window.addEventListener("load", function () {
			
			var comeon = new Comeon(script.getAttribute("data-path") || "/");
			
			comeon.require(main);
			
		});
		
	}
	
	
})(window);
