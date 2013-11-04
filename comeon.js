(function (window) {
	
	
	var script = Array.prototype.slice.call(document.getElementsByTagName("script"), -1)[0];
	
	var path = script.getAttribute("data-path") || "/";
	
	var main = script.getAttribute("data-main") || "main";
	
	
	var requirePattern = /(?:^|\s|=)require\((?:"|')([^"']*)(?:"|')\)/g;
	
	
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
	
	
	var modules = {};
	
	
	function getModuleId() {
		
		var moduleId = [];
		
		Array.prototype.join.call(arguments, "/").replace(/\.(?:js|node)$/, "").split("/").forEach(function (value) {
			
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
	
	
	function require(context, query) {
		
		return this[getModuleId(/^\.\.?\//.test(query) ? context + query : query)].exports;
		
	}
	
	
	function enqueueModule(path, query) {
		
		var moduleId = getModuleId(query);
		
		var queue = [];
		
		if (!modules[moduleId]) {
			
			modules[moduleId] = {
				url: path + moduleId + ".js?ts=" + (new Date()).valueOf()
			};
			
			searchRequires(modules[moduleId].url).forEach(function (value) {
				
				Array.prototype.push.apply(queue, enqueueModule(path, (/^\.\.?\//.test(value) ? getModuleContext(moduleId) + value : value)));
				
			});
			
			queue.push(moduleId);
			
		}
		
		return queue;
		
	}
	
	
	function loadNextModule(queue) {
		
		if (queue.length) {
			
			var iframe = document.createElement("iframe");
			
			iframe.src = "about:blank";
			iframe.style.display = "none";
			
			iframe.onload = function () {
				
				var moduleId = queue.shift();
				
				var iframeWindow = this.contentWindow;
				var iframeDocument = this.contentDocument;
				
				iframeWindow.require = require.bind(modules, getModuleContext(moduleId));
				
				iframeWindow.exports = {};
				
				iframeWindow.module = {
					exports: iframeWindow.exports
				}
				
				var script = iframeDocument.createElement("script");
				
				script.src = modules[moduleId].url;
				
				script.onload = function () {
					
					modules[moduleId].exports = iframeWindow.module.exports;
					
					setTimeout(function () {
						
						iframe.parentNode.removeChild(iframe);
						
						delete iframe;
						
					}, 1000);
					
					loadNextModule(queue);
					
				};
				
				iframeDocument.head.appendChild(script);
				
			};
			
			document.body.appendChild(iframe);
			
		}
		
	}
	
	
	window.onload = function () {
		
		loadNextModule(enqueueModule(path, main));
		
	}
	
	
})(window);
