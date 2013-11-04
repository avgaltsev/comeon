(function (window) {
	
	
	var requirePattern = /(?:^|\s|=|;)require\((?:"|')([^"']*)(?:"|')\)/g;
	
	
	function searchRequires(url) {
		
		var requires = [];
		
		var xhr = new XMLHttpRequest();
		
		xhr.open("get", url, false);
		
		xhr.onreadystatechange = function () {
			
			if ((xhr.readyState === 4) && (xhr.status === 200)) {
				
				var match;
				
				while ((match = requirePattern.exec(xhr.responseText)) !== null) {
					requires.push(match[1]);
				}
				
			}
			
		};
		
		xhr.send();
		
		return requires;
		
	}
	
	
	function getModuleId(moduleContext, moduleRequest) {
		
		var moduleId = [];
		
		(/^\.\.?\//.test(moduleRequest) ? (moduleContext + moduleRequest) : moduleRequest).replace(/\.(?:js|node)$/, "").split("/").forEach(function (value) {
			
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
		
		if (self.modules[moduleId]) {
			return self.modules[moduleId].exports;
		} else {
			throw Error("Module not found.");
		}
		
	}
	
	
	function enqueueModule(moduleId) {
		
		var self = this;
		
		var moduleQueue = [];
		
		if (!self.modules[moduleId]) {
			
			self.modules[moduleId] = {
				url: self.path + moduleId + ".js?ts=" + (new Date()).valueOf()
			};
			
			moduleQueue.push(moduleId);
			
			searchRequires(self.modules[moduleId].url).forEach(function (value) {
				
				Array.prototype.push.apply(moduleQueue, enqueueModule.bind(self)(getModuleId(getModuleContext(moduleId), value)));
				
			});
			
		}
		
		return moduleQueue;
		
	}
	
	
	function loadNextModule(moduleQueue) {
		
		var self = this;
		
		if (moduleQueue.length) {
			
			var iframe = document.createElement("iframe");
			
			iframe.src = "about:blank";
			iframe.style.display = "none";
			
			iframe.onload = function () {
				
				var self = this;
				
				var moduleId = moduleQueue.pop();
				
				var iframeWindow = self.contentWindow;
				var iframeDocument = self.contentDocument;
				
				iframeWindow.require = require.bind(self, getModuleContext(moduleId));
				
				iframeWindow.exports = {};
				
				iframeWindow.module = {
					exports: iframeWindow.exports
				}
				
				var script = iframeDocument.createElement("script");
				
				script.src = self.modules[moduleId].url;
				
				script.onload = function () {
					
					self.modules[moduleId].exports = iframeWindow.module.exports;
					
					setTimeout(function () {
						
						iframe.parentNode.removeChild(iframe);
						
						delete iframe;
						
					}, 1000);
					
					loadNextModule.bind(self)(moduleQueue);
					
				};
				
				iframeDocument.head.appendChild(script);
				
			};
			
			document.body.appendChild(iframe);
			
		}
		
	}
	
	
	function Comeon(path) { // TODO: multiple paths
		
		var self = this;
		
		self.path = path;
		
		self.modules = [];
		
	}
	
	
	Comeon.prototype.run = function (moduleRequest) {
		
		var self = this;
		
		loadNextModule.bind(self)(enqueueModule.bind(self)(getModuleId("", moduleRequest)));
		
	}
	
	
	window.Comeon = Comeon;
	
	
	var script = Array.prototype.slice.call(document.getElementsByTagName("script"), -1)[0];
	
	var main = script.getAttribute("data-main");
	
	if (main) {
		
		window.addEventListener("load", function () {
			
			var application = new Comeon(script.getAttribute("data-path") || "/");
			
			application.run(main);
			
		});
		
	}
	
	
})(window);
