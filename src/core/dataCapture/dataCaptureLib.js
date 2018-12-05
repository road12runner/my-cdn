const  parseLink = (str) => {

	var link = str.indexOf("[link]");
	var aTag = str;
	var labelStr = str;

	if(link >= 0){

		var link2 = str.indexOf("[link]", link + 6);
		var pipe = str.indexOf("|");

		if(pipe > 0 ){
			aTag = "<a target='_blank' href='" + str.slice(pipe+1,link2) + "' >" + str.slice(link+6,pipe) + "</a>";
		}

		labelStr = str.slice(0,link) + aTag + str.slice(link2+6);
	}

	return labelStr;

};


export function _getPassthroughField(name){

	if (typeof passthrough !== 'undefined'){

		return (name.toLowerCase() in passthrough) ? passthrough[name.toLowerCase()] : "";

	} else {

		return "";
	}
}


export function _numericOnly(e){
	// backspace, delete, tab, escape, enter and .
	if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
		// Ctrl+A
		(e.keyCode == 65 && e.ctrlKey === true) ||
		// home, end, left, right
		(e.keyCode >= 35 && e.keyCode <= 39)) {

		return;
	}
	// Ensure that it is a number and stop the keypress
	if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
		e.preventDefault();
	}
}

export function _convertToMax(length) {
	return (Math.pow(10, length) - 1);
}


export const getSelected = (e) =>{
	const select = this.childNodes[0];
	return select.options[select.selectedIndex].value;
};

export const getCheckedString = (e) => {

	return this.checked ? "True" : "False";
};

function hasTextValue(e){
	return this.value;
}

export function _numericRegExp(e){
	var reg = new RegExp('^[0-9]+$');
	return reg.test(this.value);
}

export function _regexOnly(e){
	var reg = new RegExp(this.regexp, "i");
	return reg.test(this.value);
}



export const  createLabel = (name, required) => {

	var _name = parseLink(name);
	var label = document.createElement('span');
	label.className = 'data-capture-label';
	label.innerHTML = _name;
	if (required) {
		label.classList.add('required-field');
	}
	return label;
};



export const  createDropDown = (data = {}) => {

	const dropdown = document.createElement('select');
	dropdown.className = " ssg-dropdown";
	if (data.index()) {
		dropdown.setAttribute("tabindex", data.index);
	}

	const divElement = document.createElement('div');
	divElement.className = " ssg-select";

	for(let i = 0; i < data.Options.length; i++){

		const opt = makeOptionDomElement(data.Options[i]);

		dropdown.appendChild(opt);
	}

	const pass = _getPassthroughField(data.Key);

	if (pass !== ''){
		dropdown.validPassthrough = false;
		for(let i=0; i < dropdown.options.length; i++){
			if(dropdown.options[i].value === pass){
				dropdown.selectedIndex = i;
				divElement.validPassthrough = true;
				break;
			}
		}
	}

	divElement.appendChild(dropdown);
	divElement.isValid = divElement.getValue = _getSelected;
	return divElement;
};

export const createCheckBox = (data ={}) => {
	var checkbox = document.createElement('input');
	checkbox.type = "checkbox";
	checkbox.validationMessages = {};
	if (data.index) {
		checkbox.setAttribute("tabindex", data.index);
	}



	const def = data.Default ? data.Default : '';
	const pass = _getPassthroughField(data.Key);
	const val = pass !== "" ? pass : def;
	if (val === "true"){
		checkbox.checked = true;
		checkbox.validPassthrough = true;
	}
	else if (val !== "false") {
		checkbox.validPassthrough = false;
	}

	checkbox.isValid = function() { return !this.mandatory || (this.checked && this.mandatory); };
	checkbox.getValue = _getCheckedString;
	checkbox.validationMessages.invalid = checkbox.validationMessages.mandatory = templateMessages.checkbox.invalid || "_invalid_checkbox"; // "Please tick the check box"
	return checkbox;
};

export const  createTextField = (data = {})  => {
	const inputfield = document.createElement('input');
	const hasLengthCap = data.Length != null && data.Length !== 0;
	const def = data.Default !== "" ? data.Default : "";
	const pass = _getPassthroughField(data.Key);
	const val = pass !== "" ? pass : def;

	inputfield.validPassthrough = pass !== "";

	inputfield.className = "ssg-textbox";
	inputfield.validationMessages = {};
	if (data.index) {
		inputfield.setAttribute("tabindex", data.index);
	}

	inputfield.type = "text";

	switch (data.Type){

		case "Numeric":
			inputfield.onkeydown = _numericOnly;
			inputfield.onpaste = _preventDefault;
			inputfield.value = val;
			inputfield.isValid = _numericRegExp;
			inputfield.validationMessages.invalid = String.format(templateMessages.regexp.numericOnly, data.Label); // "The field '"+ data.Label +"' is numeric only."
			inputfield.type = "number";
			break;
		case "RegExp":
			var validationMessage = templateMessages.regexp.custom ? templateMessages.regexp.custom[data.Key] : templateMessages.regexp.invalid;
			inputfield.value = pass;
			inputfield.regexp = def; // regex is always this default val because its hacking the system a little
			inputfield.isValid = _regexOnly;
			inputfield.onpaste = _preventDefault;
			inputfield.validationMessages.invalid = String.format(validationMessage, data.Label); // "The field '"+ data.Label +"' is not valid."
			break;
		default:
			inputfield.value = val;
	}


	if (hasLengthCap){
		inputfield.maxLength = data.Length;
		//inputfield.onkeypress = _capLength;
		//inputfield.validationMessages.length = String.format(templateMessages.input.length, data.Label, data.Length); //"The field '"+ data.Label +"' must be exactly "+ data.Length +" characters long.";
	}


	inputfield.getValue = hasTextValue;
	//inputfield.validationMessages.mandatory  = String.format(templateMessages.mandatory, data.Label); // "Please complete the field '"+ data.Label+ "'.";


	return inputfield;
};


function createElement(object) {
	var element;

	switch (object.Type){

		case "DropDown":
			element = createDropDown(object);
			break;
		case "CheckBox":
			element = createCheckBox(object);
			break;
		default:
			element = createTextField(object);
			break;
	}

	if (!object.AllowUserEdit && element.validPassthrough){
		element.disabled = true;
		if (object.Type==="DropDown") {
			element.className+=" disabledDD";
			element.childNodes[0].disabled = true;
		}
	}

	if (object.Mandatory)
		element.mandatory = true;

	element.setAttribute("id",object.Key);
	element.className +=" dcElement";
	element.label = object.Label;
	element.returnOnHandback = object.HandbackValue;

	// store incase we dont actually want to render on the page
	//dcElements.push(element);

	return element;
}

function createValidationDiv(req, hideInitialValidationContent = false) {

	var divValidation = document.createElement('div');
	divValidation.className = "validation";

	if (!hideInitialValidationContent) {
		divValidation.innerHTML = (req)?  "*" : "";
	}

	return divValidation;
}

export const  makeOptionDomElement =  (option) => {
	var el = document.createElement('option');
	el.innerHTML = option.Key;
	el.value = option.Value;

	if (option.Default)
		el.selected = true;
	return el;
};


export const  createDivFieldset = (object) => {
	const div = document.createElement('div');
	div.className = 'data-capture-item';
	div.appendChild(createLabel(object.Label, object.Mandatory));
	div.appendChild(createElement(object));
	div.appendChild(createValidationDiv(object.Mandatory));
	return div;
};


function _createSingleColumnFieldset(tr, object){

	if (object.Type === "CheckBox") {

		var tdElement = document.createElement('td');
		tdElement.className = "tdElement";
		tdElement.appendChild(_createElement(object));
		tdElement.appendChild(_createLabel(object.Label, object.Mandatory));
		tr.appendChild(tdElement);

		var valDiv = _createValidationDiv();
		tdElement.appendChild(valDiv);
		tdElement.colSpan = "3";

	} else {

		var tdLabel = document.createElement('td');
		tdLabel.className = "tdLabel";
		var tdElement = document.createElement('td');
		tdElement.className = "tdElement";

		tdLabel.appendChild(_createLabel(object.Label, object.Mandatory));
		tdElement.appendChild(_createElement(object));

		tr.appendChild(tdLabel);
		tr.appendChild(tdElement);

		var valDiv = _createValidationDiv(object.mandatory);
		var tdValidation = document.createElement('td');

		tdValidation.appendChild(valDiv);
		tdValidation.className = "tdValidation";
		tr.appendChild(tdValidation);
	}
}


