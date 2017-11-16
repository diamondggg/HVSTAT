//------------------------------------
// Browser utilities
//------------------------------------
var browserAPI = {
	isChrome: false,
};

browserAPI.extension = {
	getResourceURL: function (resourcePath, resourceName) {
		return self.options.relPath + resourcePath + resourceName;
	},
	getResourceText: function (resourcePath, resourceName) {
		return self.options[resourceName];
	},
	loadScript: function (scriptPath, scriptName) {
		eval.call(window, browserAPI.extension.getResourceText(scriptPath, scriptName));
	},
	modifyEventHandler: function (modifier, param) {
		// Firefox legacy extensions share Element.onclick and similar with the page,
		// so just call the worker
		modifier(param);
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
