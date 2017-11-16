//------------------------------------
// Browser utilities
//------------------------------------
var browserAPI = {
	get isChrome() {
		return navigator.userAgent.indexOf("Chrome") >= 0;
	},
};

browserAPI.extension = {
	getResourceURL: function (resourcePath, resourceName) {
		return chrome.extension.getURL(resourcePath + resourceName);
	},
	getResourceText: function (resourcePath, resourceName) {
		var resourceText;
		var request = new XMLHttpRequest();
		var resourceURL = browserAPI.extension.getResourceURL(resourcePath, resourceName);
		request.open("GET", resourceURL, false);
		request.send(null);
		return request.responseText;
	},
	loadScript: function (scriptPath, scriptName) {
		eval.call(window, browserAPI.extension.getResourceText(scriptPath, scriptName));
	},
	eventHandlerId: 0,
	runScriptInPageContext: function (script) {
		if (browserAPI.isChrome) {
			var scriptElement = document.createElement("script");
			scriptElement.type = "text/javascript";
			var id = "hvstat-tempjs-" + this.eventHandlerId++;
			scriptElement.id = id;
			scriptElement.textContent = script + "document.body.removeChild(document.getElementById('"+id+"'));";
			document.body.appendChild(scriptElement);
		} else {
			// Firefox has window.eval to evaluate in context of the web page,
			// should be faster than DOM modifications
			window.eval(script);
		}
	},
	modifyEventHandler: function (modifier, param) {
		browserAPI.extension.runScriptInPageContext( "(" + modifier.toString() + ")(" + JSON.stringify(param) + ");");
	}
};

browserAPI.extension.style = {
	element: null,
	add: function (styleText) {
        if (!this.element) {
            this.element = document.createElement("style");
            this.element.type = "text/css";
            (document.head || document.documentElement).insertBefore(this.element, null);
        }
        this.element.textContent += "\n" + styleText;
	},
	addFromResource: function (styleResourcePath, styleResouceName, imageResouceInfoArray) {
		var styleText = browserAPI.extension.getResourceText(styleResourcePath, styleResouceName);
		if (Array.isArray(imageResouceInfoArray)) {
			// Replace image URLs
			for (var i = 0; i < imageResouceInfoArray.length; i++) {
				var imageResourceName = imageResouceInfoArray[i].name;
				var imageOriginalPath = imageResouceInfoArray[i].originalPath;
				var imageResourcePath = imageResouceInfoArray[i].resourcePath;
				var imageResourceURL = browserAPI.extension.getResourceURL(imageResourcePath, imageResourceName);
				var regex = new RegExp(util.escapeRegex(imageOriginalPath + imageResourceName), "g");
				styleText = styleText.replace(regex, imageResourceURL);
			}
		}
		this.add(styleText);
	},
	ImageResourceInfo: function (originalPath, name, resourcePath) {
		this.originalPath = originalPath;
		this.name = name;
		this.resourcePath = resourcePath;
	},
};

browserAPI.I = browserAPI.extension.style.ImageResourceInfo;	// Alias
