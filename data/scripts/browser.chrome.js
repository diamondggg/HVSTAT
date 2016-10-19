//------------------------------------
// Browser utilities
//------------------------------------
var browser = {
	isChrome: true,
};

browser.extension = {
	getResourceURL: function (resourcePath, resourceName) {
		return chrome.extension.getURL(resourcePath + resourceName);
	},
	getResourceText: function (resourcePath, resourceName) {
		var resourceText;
		var request = new XMLHttpRequest();
		var resourceURL = browser.extension.getResourceURL(resourcePath, resourceName);
		request.open("GET", resourceURL, false);
		request.send(null);
		return request.responseText;
	},
	loadScript: function (scriptPath, scriptName) {
		eval.call(window, browser.extension.getResourceText(scriptPath, scriptName));
	},
	eventHandlerId: 0,
	modifyEventHandler: function (modifier, param) {
		// Chromium extensions have their own view of Element.onclick and similar,
		// so inject script element into the page
		var scriptElement = document.createElement("script");
		scriptElement.type = "text/javascript";
		var id = "hvstat-tempjs-" + this.eventHandlerId++;
		scriptElement.id = id;
		scriptElement.textContent = "(" + modifier.toString() + ")(" + JSON.stringify(param) + ");document.body.removeChild(document.getElementById('"+id+"'));";
		document.body.appendChild(scriptElement);
	}
};

browser.extension.style = {
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
		var styleText = browser.extension.getResourceText(styleResourcePath, styleResouceName);
		if (Array.isArray(imageResouceInfoArray)) {
			// Replace image URLs
			for (var i = 0; i < imageResouceInfoArray.length; i++) {
				var imageResourceName = imageResouceInfoArray[i].name;
				var imageOriginalPath = imageResouceInfoArray[i].originalPath;
				var imageResourcePath = imageResouceInfoArray[i].resourcePath;
				var imageResourceURL = browser.extension.getResourceURL(imageResourcePath, imageResourceName);
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

browser.I = browser.extension.style.ImageResourceInfo;	// Alias
