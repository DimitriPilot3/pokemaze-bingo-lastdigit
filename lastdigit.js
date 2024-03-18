var lastdigit = 1;
var premium = false;

const form = document.querySelector('form');
const update = function(e) {
	//e.preventDefault();
	if (form.premium.value == "")
		return false;

	lastdigit = form.digit.value;
	premium = form.premium.value == "y";
	console.log(lastdigit);
	return true;
};

form.addEventListener("change", function() { if (form.checkValidity()) form.requestSubmit(); });
form.addEventListener("submit", update);