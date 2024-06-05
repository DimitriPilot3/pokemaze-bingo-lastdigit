"use strict"
/**
* The player's desired last digit of score (as an integer from 0 to 9 inclusive)
* @type number
* @todo This should be made an array so it can represent multiple desired digits on the same bingo card
*/
var g_lastDigit = 0
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
* For simplicity, how many of the right-most digits are used to look up
* a stage to see if it matches bingo requirement.
* Can be 1, 2, or 3 depending on the other settings.
* @todo
*/
var g_numEndingDigits = 1

var $StartForm = document.getElementById("start-form");
console.assert($StartForm, "No start form!");

var $MainForm = document.getElementById("main-form");
console.assert($MainForm, "No main form!")



function _onStart() {
	g_isPremium = !!$StartForm.premium.checked
	g_lastDigit = parseInt($StartForm.digit.value, 10)

	if (!(g_lastDigit >= 0 && g_lastDigit <= 9)) {
		g_lastDigit = 0
		// An error should be shown; older browsers may not abide by form validation rules.
		alert("ERROR: Invalid value for the last digit. Please input a number from 0 to 9.")
		return false
	}
	
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
	console.log(g_lastDigit)
	console.log(g_isPremium)
	console.log(g_stageNum)
}

function _onBack() {
	gotoStartForm()
}

function _onNext() {
	if (!isSlowCooking() || g_stageNum >= 3)
		return;

	// TODO: validate form

	startSlowCookingStage(g_stageNum + 1)
}

function _onReset() {
	if (!isSlowCooking())
		return;
	
	startSlowCookingStage(1)
}


function setHeaderText(str) {
	var el = document.getElementById("_headerText")
	if (el) el.textContent = str
}

function toggleVisible(el) {
	el.className = (" " + el.className + " ").replace(" hidden ", "").trim()
}

function toggleHidden(el) {
	el.className += " hidden"
}

function gotoStartForm() {
	$StartForm.hidden = false
	$MainForm.hidden = true
}

function gotoMainForm_1MC() {
	document.querySelectorAll(".only-1MC").forEach(toggleVisible)
	document.querySelectorAll(".only-SC").forEach(toggleHidden)
	$StartForm.hidden = true
	$MainForm.hidden = false
}

function gotoMainForm_SC() {
	document.querySelectorAll(".only-SC").forEach(toggleVisible)
	document.querySelectorAll(".only-1MC").forEach(toggleHidden)
	$StartForm.hidden = true
	$MainForm.hidden = false
}


function updateForm_NumLastDigits() {
	var el = document.getElementById("_pleaseEnterLastDigitsText")
	if (!el) return;
	
	if (g_numEndingDigits == 1) {
		el.innerText = "Please enter the last digit of the score on this form."
	} else {
		// NOTE: should we have a disclaimer to enter in leading zeroes
		// for a score lesser than 100 in the "current score" input box?
		// TODO: polyfill append or replaceChildren
		var n = document.createElement("b")
		n.innerText = g_numEndingDigits
		if (el.replaceChildren)
			el.replaceChildren("Please enter the ", n, " of the score(s) on this form.")
		else if (el.append)
		{
			el.innerText = ''
			el.append("Please enter the ", n, " of the score(s) on this form.")
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