//------------------------------------
// Noncombat
//------------------------------------
hvStat.noncombat = {};

//------------------------------------
// Noncombat - Support
//------------------------------------
hvStat.noncombat.support = {
	captureStatuses: function () {
		var difficulties = ["", "NORMAL", "HARD", "NIGHTMARE", "HELL", "NINTENDO", "BATTLETOADS", "IWBTH", "PFUDOR"];
		var difficulty = hv.settings.difficulty;
		if (difficulty) {
			hvStat.characterStatus.difficulty.id = hv.settings.difficulty;
			hvStat.characterStatus.difficulty.name = hvStat.constant.difficulty[hv.settings.difficulty].name;
			hvStat.characterStatus.difficulty.index = difficulties.indexOf(difficulty);
		}
		elements = document.querySelectorAll('#eqsl img');
		var result;
		for (var i = 0; i < elements.length; i++) {
			result = /set(\d)_on/.exec(elements[i].getAttribute("src"));
			if (result) {
				hvStat.characterStatus.equippedSet = Number(result[1]);
				break;
			}
		}
		hvStat.storage.characterStatus.save();
	},
	captureProficiencies: function () {
		var proficiencyTable = document.getElementById("prof_outer");
		var prof = hvStat.characterStatus.proficiencies;
		//Equipment Proficiencies
		var equipProf = proficiencyTable.children[0].children[1].children[0].children;
		prof.oneHanded = Number(hv.util.innerText(equipProf[0].children[1]));
		prof.twoHanded = Number(hv.util.innerText(equipProf[1].children[1]));
		prof.dualWielding = Number(hv.util.innerText(equipProf[2].children[1]));
		prof.clothArmor = Number(hv.util.innerText(equipProf[3].children[1]));
		prof.lightArmor = Number(hv.util.innerText(equipProf[4].children[1]));
		prof.heavyArmor = Number(hv.util.innerText(equipProf[5].children[1]));
		//Magic Proficiencies
		var magicProf = proficiencyTable.children[1].children[1].children[0].children;
		prof.staff = Number(hv.util.innerText(magicProf[0].children[1]));
		prof.elemental = Number(hv.util.innerText(magicProf[1].children[1]));
		prof.divine = Number(hv.util.innerText(magicProf[2].children[1]));
		prof.forbidden = Number(hv.util.innerText(magicProf[3].children[1]));
		prof.deprecating = Number(hv.util.innerText(magicProf[4].children[1]));
		prof.supportive = Number(hv.util.innerText(magicProf[5].children[1]));
		hvStat.characterStatus.areProficienciesCaptured = true;
		hvStat.storage.characterStatus.save();
	},
	captureShrine: function () {
		var messageBoxElement = document.querySelector('#messagebox');
		if (!messageBoxElement) {
			return;
		}
		var messageElements = messageBoxElement.querySelectorAll('div.cmb6');
		var message0 = hv.util.innerText(messageElements[0]);
		if (message0.match(/power/i)) {
			hvStat.shrine.artifactsTraded++;
			var message2 = hv.util.innerText(messageElements[2]);
			if (message2.match(/Elixir/i)) {
				hvStat.shrine.artifactElixer++;
			} else if (message2.match(/crystal/i)) {
				hvStat.shrine.artifactCrystal++;
			} else if (message2.match(/increased/i)) {
				hvStat.shrine.artifactStat++;
			} else if (message2.match(/(\d) hath/i)) {
				hvStat.shrine.artifactHath++;
				hvStat.shrine.artifactHathTotal += Number(RegExp.$1);
			} else if (message2.match(/energy drink/i)) {
				hvStat.shrine.artifactItem++;
			}
		} else if (message0.match(/item/i)) {
			var message3 = hv.util.innerText(messageElements[3]);
			hvStat.shrine.trophyArray.push(hvStat.util.capitalizeEquipmentName(message3));
		}
		hvStat.storage.shrine.save();
	},
	confirmBeforeBattle: function () {
		if (hvStat.settings.StartAlertDifficulty >= hvStat.characterStatus.difficulty.index) {
			return;
		}
		var message = "Are you sure you want to start this challenge on " +
			hvStat.characterStatus.difficulty.name +
			' difficulty, with set number: ' +
			hvStat.characterStatus.equippedSet + '?\n';
		var modifier = function(message) {
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
		}
		browser.extension.modifyEventHandler(modifier, message);
	},
};

hvStat.noncombat.support.popup = {
	popup0: null,
	popup1:null,
	observer: null,
	adjustments: [
		{ location: "equipment", from: "598px", to: "680px" },
		{ location: "equipment", from: "445px", to: "527px" },
		{ location: "equipmentShop", from: "540px", to: "680px" },
		{ location: "equipmentShop", from: "212px", to: "310px" },
		{ location: "forge", from: "620px", to: "680px" },
		{ location: "itemWorld", from: "620px", to: "680px" },
	],
	addObserver: function () {
		this.popup0 = hv.elementCache.popup;
		this.observer = new MutationObserver(this.adjustHorizontalPosition);
		this.observer.observe(this.popup0, { attributes: true });
		if (hv.location === "equipment") {
			this.popup1 = util.document.body.querySelector('#compare_pane');
			if (this.popup1) {
				this.observer.observe(this.popup1, { attributes: true });
			}
		}
	},
	adjustHorizontalPosition: function (mutations) {
		var isStyleChanged = false;
		for (var i = 0; i < mutations.length; i++) {
			var mutation = mutations[i];
//			console.debug(mutation);
			if (mutation.attributeName === "style") {
				isStyleChanged = true;
			}
		}
		if (isStyleChanged) {
			var style = mutation.target.style;
//			console.debug(style);
			var adjustments = hvStat.noncombat.support.popup.adjustments;
			for (i = 0; i < adjustments.length; i++) {
				var adjustment = adjustments[i];
				if (hv.location === adjustment.location && style.left === adjustment.from) {
					style.left = adjustment.to;
				}
			}
		}
	},
};

//------------------------------------
// Noncombat - Inventory
//------------------------------------
hvStat.noncombat.inventory = {};

hvStat.noncombat.inventory.equipment = {
	showTagInputFields: function (doClean) {
		var equipTagArrayTable = [
			{id: hvStat.equipmentTags.OneHandedIDs,	value: hvStat.equipmentTags.OneHandedTAGs,	idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.TwoHandedIDs,	value: hvStat.equipmentTags.TwoHandedTAGs,	idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.StaffsIDs,	value: hvStat.equipmentTags.StaffsTAGs,		idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.ShieldIDs,	value: hvStat.equipmentTags.ShieldTAGs,		idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.ClothIDs,		value: hvStat.equipmentTags.ClothTAGs,		idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.LightIDs,		value: hvStat.equipmentTags.LightTAGs,		idClean: [], valueClean: []},
			{id: hvStat.equipmentTags.HeavyIDs,		value: hvStat.equipmentTags.HeavyTAGs,		idClean: [], valueClean: []}
		];
		var elements = document.querySelectorAll('#inv_equip div.eqdp, #item_pane div.eqdp, #equip div.eqdp, #equip_pane div.eqdp');
		Array.prototype.forEach.call(elements, function (element) {
			var onmouseover = element.getAttribute("onmouseover");
			var regexResult = onmouseover.match(/(One-handed Weapon|Two-handed Weapon|Staff|Shield|Cloth Armor|Light Armor|Heavy Armor)(?:\s*&nbsp;)*\s*Level/);
			if (!regexResult) {
				return;
			}
			var id = parseInt(String(element.id), 10);
			var equipTypeIdx;
			switch (regexResult[1]) {
			case "One-handed Weapon":
				equipTypeIdx = 0;
				break;
			case "Two-handed Weapon":
				equipTypeIdx = 1;
				break;
			case "Staff":
				equipTypeIdx = 2;
				break;
			case "Shield":
				equipTypeIdx = 3;
				break;
			case "Cloth Armor":
				equipTypeIdx = 4;
				break;
			case "Light Armor":
				equipTypeIdx = 5;
				break;
			case "Heavy Armor":
				equipTypeIdx = 6;
				break;
			}
			var idArray = equipTagArrayTable[equipTypeIdx].id;
			var valueArray = equipTagArrayTable[equipTypeIdx].value;
			var idCleanArray = equipTagArrayTable[equipTypeIdx].idClean;
			var valueCleanArray = equipTagArrayTable[equipTypeIdx].valueClean;
			var inputElement = document.createElement("input");
			inputElement.type = "text";
			inputElement.className = "hvstat-equipment-tag";
			inputElement.name = "tagid_" + String(id);
			inputElement.size = 5;
			inputElement.maxLength = 6;
			var index = idArray.indexOf(id);
			if (index < 0) {
				inputElement.className += " hvstat-equipment-tag-new";
				inputElement.value = "*NEW*";
			} else {
				inputElement.value = valueArray[index];
				if (doClean) {
					idCleanArray.push(id);
					valueCleanArray.push(valueArray[index]);
				}
			}
			element.parentNode.insertBefore(inputElement, null);
			inputElement.addEventListener("change", function (event) {
				var target = event.target;
				var tagId = Number(target.name.replace("tagid_", ""));
				var tagValue = target.value;
				var index = idArray.indexOf(tagId);
				if (index >= 0) {
					valueArray[index] = tagValue;
				} else {
					idArray.push(tagId);
					valueArray.push(tagValue);
				}
				target.className = target.className.replace(" hvstat-equipment-tag-new", "");
				hvStat.storage.equipmentTags.save();
			});
		});
		if (doClean) {
			var cleaned = false;
			var i = equipTagArrayTable.length;
			while (i--) {
				if (equipTagArrayTable[i].id.length > equipTagArrayTable[i].idClean.length) {
					idCleanArray = equipTagArrayTable[i].idClean;
					valueCleanArray = equipTagArrayTable[i].valueClean;
					switch (i) {
					case 0:
						hvStat.equipmentTags.OneHandedIDs = idCleanArray;
						hvStat.equipmentTags.OneHandedTAGs = valueCleanArray;
						break;
					case 1:
						hvStat.equipmentTags.TwoHandedIDs = idCleanArray;
						hvStat.equipmentTags.TwoHandedTAGs = valueCleanArray;
						break;
					case 2:
						hvStat.equipmentTags.StaffsIDs = idCleanArray;
						hvStat.equipmentTags.StaffsTAGs = valueCleanArray;
						break;
					case 3:
						hvStat.equipmentTags.ShieldIDs = idCleanArray;
						hvStat.equipmentTags.ShieldTAGs = valueCleanArray;
						break;
					case 4:
						hvStat.equipmentTags.ClothIDs = idCleanArray;
						hvStat.equipmentTags.ClothTAGs = valueCleanArray;
						break;
					case 5:
						hvStat.equipmentTags.LightIDs = idCleanArray;
						hvStat.equipmentTags.LightTAGs = valueCleanArray;
						break;
					case 6:
						hvStat.equipmentTags.HeavyIDs = idCleanArray;
						hvStat.equipmentTags.HeavyTAGs = valueCleanArray;
						break;
					}
					cleaned = true;
				}
			}
			if (cleaned) {
				hvStat.storage.equipmentTags.save();
			}
		}
	},
};

//------------------------------------
// Noncombat - Keyboard
//------------------------------------
hvStat.noncombat.keyboard = {
	scrollable: {
		targets: [
			"stats_pane",				// Character
			"equip_pane",				// Equipment
			"inv_item", "inv_equip",	// Inventory
			"item_pane", "shop_pane",	// Battle Inventory, Shop, Forge, Item World
			"slot_pane",				// Monster Lab
			"item", "equip",			// Moogle write
			"arena_pane",				// Arena
		],
		currentTarget: null,
		mouseover: function (event) {
			hvStat.noncombat.keyboard.scrollable.currentTarget = this;
		},
		mouseout: function (event) {
			hvStat.noncombat.keyboard.scrollable.currentTarget = null;
		},
		initialize: function () {
			var i = this.targets.length,
				element;
			while (i--) {
				element = document.getElementById(this.targets[i]);
				if (element) {
					element.addEventListener("mouseover", this.mouseover);
					element.addEventListener("mouseout", this.mouseout);
				}
			}
		},
	},
	documentKeydown: function (event) {
		var scrollTarget;
		if (hvStat.settings.enableScrollHotkey &&
				hvStat.noncombat.keyboard.scrollable.currentTarget &&
				!event.altKey && !event.ctrlKey && !event.shiftKey) {
			scrollTarget = hvStat.noncombat.keyboard.scrollable.currentTarget;
			switch (event.keyCode) {
			case 33:	// PAGE UP
				scrollTarget.scrollTop -= scrollTarget.clientHeight - 20;
				event.preventDefault();
				break;
			case 34:	// PAGE DOWN
				scrollTarget.scrollTop += scrollTarget.clientHeight - 20;
				event.preventDefault();
				break;
			}
		}
	},
};

