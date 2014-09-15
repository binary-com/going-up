/*
	This code is sandwiched after jquery and before jquerymobile in order to 
	register action on the mobileinit event.
*/

// disable 'active' link css class.. 
// http://stackoverflow.com/questions/7507099/how-do-you-remove-a-buttons-active-state-with-jquery-mobile
$(document).bind('mobileinit', function () {
	$.mobile.activeBtnClass = 'unused';
});
