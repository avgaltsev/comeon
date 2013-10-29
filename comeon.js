(function () {
	
	var script = Array.prototype.slice.call(document.getElementsByTagName("script"), -1)[0];
	
	var path = script.getAttribute("data-path") || "/";
	
	var mainModuleName = script.getAttribute("data-main") || "main";
	
	function searchRequires(url) {
		
		var requires = [];
		
		var xhr = new XMLHttpRequest();
		
		xhr.open("get", url, false);
		
		xhr.onreadystatechange = function() {
			
			if ((xhr.readyState === 4) && (xhr.status === 200)) {
				
				var pattern = /(?:^|\s|=)require\((?:"|')([^"']*)(?:"|')\)/g;
				
				var match;
				
				while ((match = pattern.exec(xhr.responseText)) !== null) {
					requires.push(match[1]);
				}
				
			}
			
		};
		
		xhr.send();
		
		return requires;
		
	}
	
	var modules = {};
	
	var queue = [];
	
	function enqueueModule(moduleName) {
		
		if (!modules[moduleName]) {
			
			modules[moduleName] = {
				url: path + moduleName + ".js?ts=" + (new Date()).valueOf()
			};
			
			var requires = searchRequires(modules[moduleName].url);
			
			requires.forEach(function (value) {
				
				enqueueModule(value);
				
			});
			
			queue.push(moduleName);
			
		}
		
	}
	
	function require(moduleName) {
		
		return modules[moduleName].exports;
		
	}
	
	function loadNextModule() {
		
		if (queue.length) {
			
			var iframe = document.createElement("iframe");
			
			iframe.src = "about:blank";
			iframe.style.display = "none";
			
			iframe.onload = function () {
				
				var self = this;
				
				var iframeWindow = self.contentWindow;
				var iframeDocument = self.contentDocument;
				
				iframeWindow.require = require;
				
				iframeWindow.exports = {};
				
				iframeWindow.module = {
					exports: iframeWindow.exports
				}
				
				var moduleName = queue.shift();
				
				var script = iframeDocument.createElement("script");
				
				script.src = modules[moduleName].url;
				
				script.addEventListener("load", function () {
					
					modules[moduleName].exports = iframeWindow.module.exports;
					
					setTimeout(function () {
						
						iframe.parentNode.removeChild(iframe);
						
						delete iframe;
						
					}, 1000);
					
					loadNextModule();
					
				});
				
				iframeDocument.head.appendChild(script);
				
			};
			
			document.body.appendChild(iframe);
			
		}
		
	}
	
	window.onload = function () {
		
		enqueueModule(mainModuleName);
		
		loadNextModule();
		
	}
	
})();
