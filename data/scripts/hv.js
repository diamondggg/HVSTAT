//------------------------------------
// HV utility object
//------------------------------------
var hv = {};

hv.util = {
	getGaugeRate: function (gaugeElement, gaugeMaxWidth) {
		if (!gaugeElement) {
			return 0;
		}
		var result = /width\s*?:\s*?(\d+?)px/i.exec(gaugeElement.style.cssText);
		var rate = 0;
		if (result) {
			rate = Number(result[1]) / gaugeMaxWidth;
		} else {
			rate = gaugeElement.width / gaugeMaxWidth;
		}
		return rate;
	},
	getCharacterGaugeRate: function (gauge) {
		return hv.util.getGaugeRate(gauge, 120);
	},
	percent: function (value) {
		return Math.floor(value * 100);
	},
	isUsingHVFontEngine: null,
	_hvFontMap: null,
	get hvFontMap() {
		if (!this._hvFontMap) {
			var fntArray1 = "0123456789.,!?%+-=/\\'\":;()[]_";
			var cssArray1 = "0123456789abcdefghijklmnopqrs";
			var fntArray2 = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			var cssArray2 = "9abcdefghijklmnopqrstuvwxyz";
			this._hvFontMap = {};
			for (var i = 0; i < cssArray1.length; i++) {
				this._hvFontMap['c2' + cssArray1[i]] = this._hvFontMap['c4' + cssArray1[i]] = fntArray1[i];
			}
			for (var i = 0; i < cssArray2.length; i++) {
				this._hvFontMap['c3' + cssArray2[i]] = this._hvFontMap['c5' + cssArray2[i]] = fntArray2[i];
			}
		}
		return this._hvFontMap;
	},
	hvFontTextBlockSelector: 'div.fl, div.fc, div.fr',
	innerText: function (element) {
		if (!this.isUsingHVFontEngine) {
			return util.innerText(element);
		}
		// Parse HV Font text
		var innerText = "";
		var textBlock, textBlocks;
		var selfClassNames = element.className.split(' ');
		//console.debug(selfClassNames);
		if (selfClassNames.indexOf('fl') >= 0 || selfClassNames.indexOf('fc') >= 0 || selfClassNames.indexOf('fr') >= 0) {
			textBlocks = [element];
		} else {
			textBlocks = element.querySelectorAll(this.hvFontTextBlockSelector);
		}
		//console.debug(textBlocks);
		var charDivsLtoR, charDivsRtoL, charDivs, charDiv, regexResult, index;
		var i, j, len;
		for (i = 0; i < textBlocks.length; i++) {
			var charDivs = textBlocks[i].children;
			var text = [];
			for (var j = 0; j < charDivs.length; j++) {
				var className = charDivs[j].className;
				if (className in this.hvFontMap) {
					text.push(this.hvFontMap[className]);
				}
			}
			if (textBlocks[i].className.split(' ').indexOf('fl') === -1)
				text.reverse();
			innerText += text.join('');
			innerText += " ";	//	Separator between text blocks
		}
		return innerText;
	}
};

hv.locationMap = {
	"character":		"?s=Character&ss=ch",
	"equipment":		"?s=Character&ss=eq",
	"abilities":		"?s=Character&ss=ab",
	"training":			"?s=Character&ss=tr",
	"battleItems":		"?s=Character&ss=it",
	"inventory":		"?s=Character&ss=in",
	"settings":			"?s=Character&ss=se",
	"equipmentShop":	"?s=Bazaar&ss=es",
	"itemShop":			"?s=Bazaar&ss=is",
	"itemShopBot":		"?s=Bazaar&ss=ib",
	"monsterLab":		"?s=Bazaar&ss=ml",
	"shrine":			"?s=Bazaar&ss=ss",
	"forge":			"?s=Forge",
	"moogleMailInbox":		"?s=Bazaar&ss=mm&filter=inbox",
	"moogleMailWriteNew":	"?s=Bazaar&ss=mm&filter=new",
	"moogleMailReadMail":	"?s=Bazaar&ss=mm&filter=read",
	"moogleMailSentMail":	"?s=Bazaar&ss=mm&filter=sent",
	"moogleMail":		"?s=Bazaar&ss=mm",
	"battle":			"?s=Battle&ss=ba",
	"arena":			"?s=Battle&ss=ar",
	"ringOfBlood":		"?s=Battle&ss=rb",
	"grindfest":		"?s=Battle&ss=gr",
	"itemWorld":		"?s=Battle&ss=iw",
};

hv.character = {
	get healthRate() {
		var bar = util.document.body.querySelector('#dvbh img');
		if (bar) {
			return hv.util.getGaugeRate(bar, 414);
		}
		return hv.util.getGaugeRate(util.document.body.querySelector('#vbh img'), 496);
	},
	get magicRate() {
		var bar = util.document.body.querySelector('#dvbm img');
		if (bar) {
			return hv.util.getGaugeRate(bar, 414);
		}
		return hv.util.getGaugeRate(util.document.body.querySelector('#vbm img'), 207);
	},
	get spiritRate() {
		var bar = util.document.body.querySelector('#dvbs img');
		if (bar) {
			return hv.util.getGaugeRate(bar, 414);
		}
		return hv.util.getGaugeRate(util.document.body.querySelector('#vbs img'), 207);
	},
	get overchargeRate() {
		var bar = util.document.body.querySelector('#dvbc img');
		if (bar) {
			return hv.util.getGaugeRate(bar, 414);
		}
		bar = util.document.body.querySelector('#vcp');
		if (!bar) {
			return 0;
		}
		var numPips = bar.children[0].children.length;
		if (numPips && bar.children[0].children[numPips - 1].id == 'vcr')
			numPips -= 0.5;
		return numPips / 10;
	},
	get healthPercent() {
		return hv.util.percent(this.healthRate);
	},
	get magicPercent() {
		return hv.util.percent(this.magicRate);
	},
	get spiritPercent() {
		return hv.util.percent(this.spiritRate);
	},
	get overchargePercent() {
		return hv.util.percent(this.overchargeRate);
	},
};

hv.elementCache = {
	_popup: null,
	get popup() {
		if (!this._popup) {
			this._popup = util.document.body.querySelector('#popup_box');
			if (!this._popup) { // battle mode
				this._popup = document.createElement('div');
				this._popup.id = "popup_box";
				this._popup.style.visibility = "hidden";
				this._popup.style.position = "absolute";
				this._popup.style.border = "1px solid #5C0D11";
				this._popup.style.background = "#EDEBDF";
				this._popup.style.opacity = "0.9";
				this._popup.style.zIndex = 5;
				util.document.body.appendChild(this._popup);
			}
		}
		return this._popup;
	},
	_stamina_readout: null,
	get stamina_readout() {
		if (!this._stamina_readout) {
			this._stamina_readout = util.document.body.querySelector('#stamina_readout');
		}
		return this._stamina_readout;
	},
	_level_readout: null,
	get level_readout() {
		if (!this._level_readout) {
			this._level_readout = util.document.body.querySelector('#level_readout');
		}
		return this._level_readout;
	},
};

hv.initialize = function () {
	//this.util.isUsingHVFontEngine = util.innerText(hv.elementCache.stamina_readout).indexOf("Stamina") === -1; // .stamina_readout is null in battle mode
	this.util.isUsingHVFontEngine = (util.document.body.querySelector('div.fl, div.fr') !== null);
	var settings = {
		isUsingHVFontEngine: this.util.isUsingHVFontEngine,
		get difficulty() {
			var regexResult = hv.util.innerText(hv.elementCache.level_readout).match(/(Normal|Hard|Nightmare|Hell|Nintendo|Battletoads|IWBTH|PFUDOR)/i);
			if (regexResult) {
				return regexResult[1].toUpperCase();
			} else {
				return "";
			}
		},
	};

	var battleLog = util.document.body.querySelector('#pane_log');
	var battle = {
		isActive: !!battleLog,
		elementCache: null,
		get isRoundFinished() {
			if (!this.isActive) {
				return false;
			}
			return !!this.elementCache.dialog;
		},
		get isFinished() {
			if (!this.isActive) {
				return false;
			}
			if (!this.isRoundFinished) {
				return false;
			} else {
				if (document.location.search.startsWith("?s=Battle&ss=ba")) {
					// Random Encounter
					return true;
				} else {
					// The others
					var onclick = this.elementCache.dialog.getAttribute("onclick");
					return onclick.indexOf("battle.battle_continue") === -1;
				}
			}
		},
	};
	if (battle.isActive) {
		battle.elementCache = {
			battleLog: battleLog,
			_mainPane: null,
			_quickcastBar: null,
			_monsterPane: null,
			_dialog: null,
			_characterEffectIcons: null,
			_monsters: null,
			_monsterEffectIcons: null,
			_monsterGauges: null,
			_rightPane: null,
			get mainPane() {
				if (!this._mainPane) {
					this._mainPane = util.document.body.querySelector('#mainpane');
				}
				return this._mainPane;
			},
			get quickcastBar() {
				if (!this._quickcastBar) {
					this._quickcastBar = util.document.body.querySelector('#quickbar');
				}
				return this._quickcastBar;
			},
			get monsterPane() {
				if (!this._monsterPane) {
					this._monsterPane = util.document.body.querySelector('#pane_monster');
				}
				return this._monsterPane;
			},
			get dialog() {
				if (!this._dialog) {
					this._dialog = util.document.body.querySelector('div#btcp');
				}
				return this._dialog;
			},
			get characterEffectIcons() {
				if (!this._characterEffectIcons) {
					this._characterEffectIcons = this.mainPane.querySelector('#pane_effects').children;
				}
				return this._characterEffectIcons;
			},
			get monsters() {
				if (!this._monsters) {
					this._monsters = this.monsterPane.querySelectorAll('div.btm1');
				}
				return this._monsters;
			},
			get monsterEffectIcons() {
				if (!this._monsterEffectIcons) {
					this._monsterEffectIcons = this.monsterPane.querySelectorAll('div.btm1 > div.btm6 > img[onmouseover^="battle.set_infopane_effect"]');
				}
				return this._monsterEffectIcons;
			},
			get monsterGauges() {
				if (!this._monsterGauges) {
					this._monsterGauges = this.monsterPane.querySelectorAll('div.btm1 > div.btm4 > div.btm5 > div.chbd > img:first-child');
				}
				return this._monsterGauges;
			},
			get rightPane() {
				if (!this._rightPane) {
					this._rightPane = util.document.body.querySelector('#battle_right');
				}
				return this._rightPane;
			},
			resetAfterUpdate: function() {
				this._quickcastBar = null;
				this._characterEffectIcons = null;
				this._monsters = null;
				this._monsterEffectIcons = null;
				this._monsterGauges = null;
			},
		};
	}
	var isLocationFound = false,
		location = "",
		key;
	if (battle.isActive) {
		location = "engagingBattle";
	} else {
		for (key in this.locationMap) {
			if (document.location.search.indexOf(this.locationMap[key]) === 0) {
				location = key;
				isLocationFound = true;
				break;
			}
		}
		if ((location == "arena" || location == "battle") || !isLocationFound) {
			if (util.document.body.querySelector('#riddleform')) {
				location = "riddle";
			} else if (util.document.body.querySelector('#attr_form')) {
				location = "character";
			}
		}
	}
	this.location = location;
	this.settings = settings;
	this.battle = battle;
};
