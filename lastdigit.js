"use strict"

// Legacy browser support: IE9 and above
// (Not tested on the actual browsers, only via IE11)
// 
// IE8 requires a few polyfills
// IE8 also lacks addEventListener and instead has its proprietary attachEvent() method
//
// [1] https://gist.github.com/NicholeMattera/1d0ac659eec8d8ed553eaa65f8b6fc50)
// [2] https://gist.github.com/arturotena/22158dcabe386bbfc536
//
// (Or I could rewrite this in modern JavaScript and compile it with BabelJS :'))


// POLYFILLS
if (window.NodeList && !("forEach" in NodeList.prototype)) { // forEach not impl in IE11 and lower
    NodeList.prototype.forEach = function(callbackfn, thisArg) {
		for (var i = 0; i < this.length; ++i)
			callbackfn(this[i], thisArg)
    }
	// proprietary IE8 shit? or caused by IE11 in IE8 document mode?
	if (window.StaticNodeList)
		StaticNodeList.prototype.forEach = NodeList.prototype.forEach
}
if (!String.prototype.trim) { // not impl in IE9 and lower
	(function() {
		// Make sure we trim BOM and NBSP
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
		String.prototype.trim = function() {
			return this.replace(rtrim, "");
		};
	})();
}
if (!Array.prototype.indexOf) { // not impl in IE8 and lower
	Array.prototype.indexOf = function(searchElement, fromIndex) {
		if (this === undefined || this == null) {
			throw new TypeError('"this" is null or not defined');
		}
		var length = ~~this.length  // Hack to convert object.length to a UInt32
		fromIndex = +fromIndex || 0;
		if (!isFinite(fromIndex))
			fromIndex = 0;
		else if (fromIndex < 0) {
			fromIndex += this.length;
			if (fromIndex < 0)
				fromIndex = 0;
		}
		for (; fromIndex < length; fromIndex++) {
			if (this[fromIndex] === searchElement)
				return fromIndex;
		}
		return -1;
	}
}

/**
* The player's desired last digit(s) of score (as an integer from 0 to 9 inclusive)
* @type array
*/
var g_lastDigits = undefined
/**
* True if player has the premium pass, false otherwise
* @type bool
*/
var g_isPremium = false
/**
* This is either an integer (1-3 incl.) representing the stage being played
* in slow cooking, or an undefined value when 1MC is the mode being played.
* @todo
*/
var g_stageNum = undefined
/**
* Defines how many of the right-most significant digits to use when checking
* whether a score will meet the bingo requirement when the game ends.
* Can be 1, 2, or 3 depending on the mode and whether premium pass is active.
* @todo
*/
var g_numEndingDigits = 1

var $StartForm = document.getElementById("start-form");
console.assert($StartForm, "No start form!");

var $MainForm = document.getElementById("main-form");
console.assert($MainForm, "No main form!")


function _onStart() {
	g_isPremium = !!$StartForm.premium.checked
	var digit = parseInt($StartForm.digit.value, 10)
	if (!(digit >= 0 && digit <= 9)) {
		// Show an error, as older browsers may not abide by form validation rules.
		// TODO: use HTML/CSS instead of an alert
		alert("ERROR: Invalid value for the last digit. Please input a number from 0 to 9.")
		var el = document.getElementById("digit-select")
		if (el) el.focus()
		return false
	}
	g_lastDigits = [digit]
	
	switch ($StartForm.mode.value) {
		case "SC":
			startSlowCookingStage(1)
			gotoMainForm_SC()
			break
		case "1MC":
			start1MinCooking()
			gotoMainForm_1MC()
			break
		default:
			throw "Unrecognized game mode: '"+$StartForm.mode.value+"'"
	}
	console.log(g_lastDigits)
	console.log(g_isPremium)
	console.log(g_stageNum)
}

function _onBack() {
	gotoStartForm()
}

function _onNext() {
	if (!isSlowCooking() || !(g_stageNum < 3))
		return

	startSlowCookingStage(g_stageNum + 1)
}

function _onReset() {
	if (!isSlowCooking())
		return
	
	startSlowCookingStage(1)
}

/**
 * @param {KeyboardEvent} ev
 */
function _onKeyDownDigitsOnly(ev) {
	if ("key" in ev) {
		console.log(ev.key)
		// FIXME: "Dead" keys may slip through (e.g. '^' on French AZERTY keyboard)
		if (!(ev.key.substring(0, 5) == "Arrow" || (ev.key.length === 1 && ev.key >= 0) ||
			[
				"Backspace", "Tab", "Enter", "Escape", "Home", "End", "Delete",
				// non-standard key identifiers from IE
			 	"Esc", "Del", "Left", "Right", "Up", "Down"
			].indexOf(ev.key) >= 0))
		{
			ev.preventDefault()
		}
	}
	else {
		if (!(
			// Digit0 ~ 9
			(ev.keyCode >= 48 && ev.keyCode <= 57) ||
			// Numpad0 ~ 9
			(ev.keyCode >= 96 && ev.keyCode <= 105) || 
			// Home, End, the Arrow keys
			(ev.keyCode >= 35 && ev.keyCode <= 40) || 
			// Backspace, Tab, Enter, Escape, Delete
			[8, 9, 13, 27, 46].indexOf(ev.keyCode) >= 0))
		{
			ev.returnValue = false
		}
	}
}

function _onChangeDigitsOnly(el) {
	// TODO
	//var score = parseScore(el.value)
	el.value = formatScore(el.value)
}

/**
 * 
 * @param {string} score 
 * @returns The score as an integer
 */
function parseScore(score) {
	return Number(String(score).replace(/[^0-9]/g, ""));
}

/**
 * 
 * @param {string} score 
 */
function formatScore(score) {
	score = String(score).replace(/[^0-9]/g, "").trim()
	if (score.length <= g_numEndingDigits)
		return score

	// TODO
	if (window.Intl) {
		return new Intl.NumberFormat(navigator.languages, {
			style: "decimal",
			numberingSystem: "latn",
			maximumFractionDigits: 0,
			minimumIntegerDigits: g_numEndingDigits,
		}).format(score)
	}

	score = Number(score).toLocaleString()
	/*@cc_on
		// Even with integers, IE10 and under seem to include a decimal part...
		// So let's truncate it!
		var sep = (1).toLocaleString().match(/\D/g)
		if (sep && sep.length === 1) {
			sep = score.indexOf(sep)
			if (sep >= 0)
				score = score.substring(0, sep)
		}
	@*/
	return score
}

function setHeaderText(str) {
	var el = document.getElementById("_headerText")
	if (el) el.innerText = str
}

function showElement(el) {
	if (el.classList)
		el.classList.remove("hidden")
	else
		el.className = (" " + el.className + " ").replace(" hidden ", "").trim()
}

function hideElement(el) {
	if (el.classList)
		el.classList.add("hidden")
	else if ((" "+el.className+" ").indexOf(" hidden ") < 0)
		el.className += " hidden"
}

function gotoStartForm() {
	showElement($StartForm)
	hideElement($MainForm)
}

function gotoMainForm_1MC() {
	document.querySelectorAll(".only-1MC").forEach(showElement)
	document.querySelectorAll(".only-SC").forEach(hideElement)
	// https://caniuse.com/mdn-api_htmlelement_hidden
	hideElement($StartForm)
	showElement($MainForm)
}

function gotoMainForm_SC() {
	document.querySelectorAll(".only-SC").forEach(showElement)
	document.querySelectorAll(".only-1MC").forEach(hideElement)
	hideElement($StartForm)
	showElement($MainForm)
}


function updateForm_NumLastDigits() {
	var el = document.getElementById("_pleaseEnterLastDigitsText")
	if (!el) return;
	
	if (g_numEndingDigits == 1) {
		el.innerText = "Please enter the last digit of your score on this form."
	} else {
		// NOTE: should we have a disclaimer to enter in leading zeroes
		// for a score lesser than 100 in the "current score" input box?

		// TODO!!
		var n = document.createElement("b")
		n.innerText = "last "+g_numEndingDigits+" digits"
		if (el.replaceChildren)
			el.replaceChildren("Please enter the ", n, " of each score on this form.")
		else if (el.append)
		{
			el.innerText = ''
			el.append("Please enter the ", n, " of each score on this form.")
		}

	}
}

function updateForm_NextStageBtn() {
	var el = document.querySelector("#main-form button[type=submit]")
	if (el) el.disabled = g_stageNum == 3
}

function start1MinCooking() {
	g_stageNum = undefined
	g_numEndingDigits = g_isPremium ? 2 : 1
	setHeaderText("One Minute Cooking")
	updateForm_NumLastDigits()
}

function startSlowCookingStage(stageNum) {
	stageNum = parseInt(stageNum, 10)
	if (!(stageNum >= 1 && stageNum <= 3))
		throw "Invalid stage number: "+stageNum

	g_stageNum = stageNum
	g_numEndingDigits = g_isPremium ? 3 : 2
	setHeaderText("Stage " + g_stageNum + "/3 in Slow Cooking")
	updateForm_NumLastDigits()
	updateForm_NextStageBtn()

	var el = document.getElementById("start-score")
	if (el) {
		if (g_stageNum > 1) {
			el.disabled = false
			el.value = ""
			el.focus()
		} else {
			el.disabled = true
		}
	}
}

/*
$StartForm.addEventListener("change", function() {
	var valid = $StartForm.checkValidity()
	document.querySelector('button[type=submit]').disabled = !valid
	if (valid) {
		$StartForm.requestSubmit();
	}
});

//$StartForm.addEventListener("submit", update);
$StartForm.querySelector("#digit-select").addEventListener("input", function(e) {
	if (e.isComposing || e.inputType !== 'insertText')
		return;
	
});
*/

function isSlowCooking() { return g_stageNum !== undefined; }
function is1MC() { return g_stageNum === undefined; }