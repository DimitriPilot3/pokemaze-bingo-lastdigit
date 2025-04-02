"use strict"

const LUT_10_BONUS = [
	/* 0 */ [ 0,  9, 18, 27, 36, 45, 54, 63, 72, 81,   ],
	/* 1 */ [    10, 19, 28, 37, 46, 55, 64, 73, 82, 91],
	/* 2 */ [ 1,     20, 29, 38, 47, 56, 65, 74, 83, 92],
	/* 3 */ [ 2, 11,     30, 39, 48, 57, 66, 75, 84, 93],
	/* 4 */ [ 3, 12, 21,     40, 49, 58, 67, 76, 85, 94],
	/* 5 */ [ 4, 13, 22, 31,     50, 59, 68, 77, 86, 95],
	/* 6 */ [ 5, 14, 23, 32, 41,     60, 69, 78, 87, 96],
	/* 7 */ [ 6, 15, 24, 33, 42, 51,     70, 79, 88, 97],
	/* 8 */ [ 7, 16, 25, 34, 43, 52, 61,     80, 89, 98],
	/* 9 */ [ 8, 17, 26, 35, 44, 53, 62, 71,     90, 99],
]

const LUT_20_BONUS = [
	/* 0 */ [ 0,  8, 16, 25, 33, 41, 50, 58, 66, 75, 83, 91],
	/* 1 */ [     9, 17,     34, 42,     59, 67,     84, 92],
	/* 2 */ [ 1, 10, 18, 26, 35, 43, 51, 60, 68, 76, 85, 93],
	/* 3 */ [ 2,     19, 27,     44, 52,     69, 77,     94],
	/* 4 */ [ 3, 11, 20, 28, 36, 45, 53, 61, 70, 78, 86, 95],
	/* 5 */ [ 4, 12,     29, 37,     54, 62,     79, 87,   ],
	/* 6 */ [ 5, 13, 21, 30, 38, 46, 55, 63, 71, 80, 88, 96],
	/* 7 */ [    14, 22,     39, 47,     64, 72,     89, 97],
	/* 8 */ [ 6, 15, 23, 31, 40, 48, 56, 65, 73, 81, 90, 98],
	/* 9 */ [ 7,     24, 32,     49, 57,     74, 82,     99],
]

const LUT_30_BONUS = [
	/* 0 */ [ 0,  7, 15, 23,     38, 46,     61, 69,     84, 92],
	/* 1 */ [     8, 16,     31, 39,     54, 62, 70, 77, 85, 93],
	/* 2 */ [ 1,  9,     24, 32, 40, 47, 55, 63,     78, 86,   ],
	/* 3 */ [ 2, 10, 17, 25, 33,     48, 56,     71, 79,     94],
	/* 4 */ [ 3,     18, 26,     41, 49,     64, 72, 80, 87, 95],
	/* 5 */ [    11, 19,     34, 42, 50, 57, 65, 73,     88, 96],
	/* 6 */ [ 4, 12, 20, 27, 35, 43,     58, 66,     81, 89,   ],
	/* 7 */ [ 5, 13,     28, 36,     51, 59,     74, 82, 90, 97],
	/* 8 */ [ 6,     21, 29,     44, 52, 60, 67, 75, 83,     98],
	/* 9 */ [    14, 22, 30, 37, 45, 53,     68, 76,     91, 99],
]


if (!("MAX_SAFE_INTEGER" in Number))
	Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1

function LastDigitOf(score) {
	// TODO: define semantics so we don't use parseInt over and over
	score = parseInt(score, 10)
	if (!(score >= 0) || score > Number.MAX_SAFE_INTEGER)
		return NaN
	return score % 10
}

function LastNDigitsOf(score, n) {
	// TODO: semantics
	score = parseInt(score, 10)
	n = Math.floor(n)
	if (!(score >= 0 && score <= Number.MAX_SAFE_INTEGER) || !(n > 0))
		return NaN
	if (!(n > 0 && n < 23))
		throw RangeError("n out of range")
	return Math.round(score % Math.pow(10, n))
	//score = String.prototype.replace.call(score, /[^0-9].*/, "")
	//return score === "" ? 0 : score.slice(-n)
}

function StageBonus(score, stageNum) {
	// TODO: semantics
	score = parseInt(score, 10)
	if (!(score >= 0))
		return NaN
	if (stageNum == 1)
		return _10PercentRoundUp(score)
	else if (stageNum == 2)
		return _20PercentRoundUp(score)
	else if (stageNum == 3)
		return _30PercentRoundUp(score)
	throw RangeError("stageNum was "+stageNum+" but must be 1, 2, or 3")
}

function WithStageBonus(score, stageNum) {
	// TODO: semantics
	score = parseInt(score, 10)
	return score >= 0 ? score + StageBonus(score, stageNum) : NaN
}

function _10PercentRoundUp(score) { return Math.ceil(score * 0.09999999999999999) }
function _20PercentRoundUp(score) { return Math.ceil(score * 0.19999999999999999) }
function _30PercentRoundUp(score) { return Math.ceil(score * 0.29999999999999999) }

