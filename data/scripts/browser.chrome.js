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
		return chrome.runtime.getURL(resourcePath + resourceName);
	},
	getResourceText: async function (resourcePath, resourceName) {
		var response = await fetch(browserAPI.extension.getResourceURL(resourcePath, resourceName));
		return await response.text();
	},
	loadScript: async function (scriptPath, scriptName) {
		await import(chrome.runtime.getURL(scriptPath + scriptName));
	},
	runScriptInPageContext: async function (scriptId, params) {
		var scriptElement = document.createElement("script");
		var completed = new Promise(resolve => scriptElement.onload = () => resolve());
		scriptElement.type = "text/javascript";
		scriptElement.src = chrome.runtime.getURL("/scripts/injected.js#" + scriptId + "::" + params);
		document.body.appendChild(scriptElement);
		await completed;
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
	addFromResource: async function (styleResourcePath, styleResouceName, imageResouceInfoArray) {
		var styleText = await browserAPI.extension.getResourceText(styleResourcePath, styleResouceName);
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
