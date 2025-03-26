(function() {
	var scripts = {
		confirmBeforeBattle: function(params) {
			var message = decodeURIComponent(params);
			var elements = document.querySelectorAll('#mainpane img[onclick*="init_battle"]');
			var i, element;
			var makeNewOnClick = function(oldOnClick, message) {
				return function(event) {
					if (confirm(message)) {
						oldOnClick(event);
					}
				}
			}
			for (i = 0; i < elements.length; i++) {
				elements[i].onclick = makeNewOnClick(elements[i].onclick, message);
			}
		},
		getDynJSEquip: function(params) {
			if (typeof dynjs_equip !== 'undefined') {document.body.setAttribute('dynjs_equip', JSON.stringify(dynjs_equip));}
			if (typeof dynjs_eqstore !== 'undefined') {document.body.setAttribute('dynjs_eqstore', JSON.stringify(dynjs_eqstore));}
		},
		adjustKeyEventHandling: function(params) {
			var onkeydown = null;
			document.addEventListener("hvstatcomplete", function(event) {
				this.removeEventListener(event.type, arguments.callee);
				if (onkeydown) document.onkeydown = onkeydown;
			});
			var disableDocumentKeydown = function() {
				onkeydown = document.onkeydown;
				document.onkeydown = null;
			}
			if (document.readyState !== "loading") {
				disableDocumentKeydown();
			} else {
				document.addEventListener("readystatechange", function(event) {
					this.removeEventListener(event.type, arguments.callee);
					disableDocumentKeydown();
				});
			}
		},
		disableForgeHotKeys: function(params) { document.onkeypress = null; },
	};
	var myUrl = document.currentScript.src;
	var hashPos = myUrl.indexOf('#');
	if (hashPos !== -1) {
		var paramPos = myUrl.indexOf('::', hashPos + 1);
		if (paramPos != -1) {
			var scriptId = myUrl.substr(hashPos + 1, paramPos - hashPos - 1);
			var params = myUrl.substr(paramPos + 2);
			//console.log('injected script:', scriptId, params);
			scripts[scriptId](params);
		}
	}
	document.body.removeChild(document.currentScript);
})();
