//import * as  dcLib  from './dataCaptureLib';

import AppSettings from '../AppSettings';

export default class DataCaptureHelper {

	constructor (parentElement, dataCaptureItems, templateMessages, isMobile, opts = {}){

		this.dataCaptureItems = dataCaptureItems;
		this.parentElement = parentElement;

		const fieldsContainer = document.createElement("div");
		fieldsContainer.className = 'fields-container';
		this.parentElement.appendChild(fieldsContainer);


		this.dcElements = [];

		const _isSingleColumn = opts.isSingleColumn || false;
		const _hideInitialValidationContent = opts.hideInitialValidationContent || false;

		const passthrough =  [];

		templateMessages = templateMessages || {
			checkbox: { invalid: '' },
			regexp: { invalid: '' ,
				numericOnly: ''
			},
			input: { length: '' },
			email: { invalid: '',
				mandatory: '',
				label: '',
				confirmlabel: '',
				nomatch: ''
			},
			mandatory: '',
			competition: { label: '' }
		};


		const format = function() {
			var s = arguments[0];
			if (s != null && (typeof s != 'undefined')){
				for (var i = 0; i < arguments.length - 1; i++) {
					var reg = new RegExp("\\{" + i + "\\}", "gm");
					s = s.replace(reg, arguments[i + 1]);
				}
			}

			return s;
		};



		function _getPassthroughField(name){

			if (typeof passthrough !== 'undefined'){

				return (name.toLowerCase() in passthrough) ? passthrough[name.toLowerCase()] : "";

			} else {

				return "";
			}
		}

		var createDropDown = function(data) {

			const dropdown = document.createElement('select');
			dropdown.className = 'ssg-dropdown';
			if (data.index) {
				dropdown.setAttribute("tabindex", data.index);
			}


			const divElement = document.createElement('div');
			divElement.className = "ssg-select";

			for(let i = 0; i < data.Options.length; i++){
				const opt = _makeOptionDomElement(data.Options[i]);
				dropdown.appendChild(opt);
			}

			const pass = _getPassthroughField(data.Key);

			if (pass!=""){

				dropdown.validPassthrough = false;

				for(let i = 0; i < dropdown.options.length; i++){

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

		const createCheckBox = function(data) {
			const checkbox = document.createElement('input');
			checkbox.type = "checkbox";
			checkbox.validationMessages = {};

			if (data.index) {
				checkbox.setAttribute("tabindex", data.index);
			}

			const def = data.Default !== "" ? data.Default : "";
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

		const _createTextField = function(data) {
			const inputfield = document.createElement('input');
			const hasLengthCap = data.Length != null && data.Length !== 0;
			const def = data.Default !== "" ? data.Default : "";
			const pass = _getPassthroughField(data.Key);
			const val = pass !== "" ? pass : def;

			inputfield.validPassthrough = pass !== "";


			inputfield.className = "textbox1";
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
					inputfield.validationMessages.invalid = format(templateMessages.regexp.numericOnly, data.Label); // "The field '"+ data.Label +"' is numeric only."
					inputfield.type = "number";
					break;
				case "RegExp":
					var validationMessage = templateMessages.regexp.custom ? templateMessages.regexp.custom[data.Key] : templateMessages.regexp.invalid;
					inputfield.value = pass;
					inputfield.regexp = def; // regex is always this default val because its hacking the system a little
					inputfield.isValid = _regexOnly;
					inputfield.onpaste = _preventDefault;
					inputfield.validationMessages.invalid = format(validationMessage, data.Label); // "The field '"+ data.Label +"' is not valid."
					break;
				default:
					inputfield.value = val;
			}


			if (hasLengthCap){
				inputfield.maxLength = data.Length;
				//inputfield.onkeypress = _capLength;
				inputfield.validationMessages.length = format(templateMessages.input.length, data.Label, data.Length); //"The field '"+ data.Label +"' must be exactly "+ data.Length +" characters long.";
			}


			inputfield.getValue = _hasTextValue;
			inputfield.validationMessages.mandatory  = format(templateMessages.mandatory, data.Label); // "Please complete the field '"+ data.Label+ "'.";


			return inputfield;
		};

		function _numericOnly(e){
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

		function _convertToMax(length)
		{
			return (Math.pow(10, length) - 1);
		}

		function _preventDefault(e){
			e.preventDefault();
		}

		function _getSelected(e){
			var select = this.childNodes[0];
			return select.options[select.selectedIndex].value;
		}

		function _getCheckedString(e){

			return this.checked ? "True" : "False";
		}

		function _hasTextValue(e){

			return this.value;
		}

		function _numericRegExp(e){
			var reg = new RegExp('^[0-9]+$');
			return reg.test(this.value);
		}

		function _regexOnly(e){
			var reg = new RegExp(this.regexp, "i");
			return reg.test(this.value);
		}

		function _createLabel(name, required) {

			var _name = parseLink(name);

			var label = document.createElement('span');
			label.className = 'data-capture-label';
			label.innerHTML = _name;
			if (required) {
				$(label).addClass('required-field');
			}
			return label;
		}

		/*Converts str contained within [link] tokens to anchor tag. Parses str in formats:-
			Click [link] here|http://www.myurl.com [link] to open
			[link] Click here|http://www.myurl.com [link]
		*/
		function parseLink(str){

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

		}

		function _createValidationDiv(req) {

			var divValidation = document.createElement('div');
			divValidation.className = "validation";

			if (!_hideInitialValidationContent) {
				divValidation.innerHTML = (req)?  "*" : "";
			}

			return divValidation;
		}

		const _createElement = (object)  => {
			var element;

			switch (object.Type){

				case "DropDown":
					element = createDropDown(object);
					break;
				case "CheckBox":
					element = createCheckBox(object);
					break;
				default:
					element = _createTextField(object);
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

			this.dcElements.push(element);

			return element;
		}








		function _makeOptionDomElement(option) {
			var el = document.createElement('option');
			el.innerHTML = option.Key;
			el.value = option.Value;

			if (option.Default)
				el.selected = true;
			return el;
		}


		function _createDivFieldset(object){

			var div = document.createElement('div');
			div.className = 'data-capture-item';
			div.appendChild(_createLabel(object.Label, object.Mandatory));
			div.appendChild(_createElement(object));
			div.appendChild(_createValidationDiv(object.Mandatory));
			return div;
		}


		//entry point
		const visibleFields =  dataCaptureItems.filter( item => item.Display);
		this.hiddenFields = dataCaptureItems.filter( item => item.HandbackValue).map( item => {
			const pass = _getPassthroughField(item.Key);
			if (pass!=="") item.Default = pass;
			return item;
		});


		for ( const field of visibleFields) {
			fieldsContainer.appendChild(_createDivFieldset(field) );
		}


	}


	getValidationMessages (isMobile){

		return this.validateFields(typeof isMobile !== 'undefined' && isMobile);

	};



	getValues (isPassthrough) {

		const values = {};

		const elementCollection = this.dcElements;

		for (let i = 0; i < elementCollection.length; i++){

			const el = elementCollection[i];

			const val = el.getValue();

			const flag = isPassthrough ? el.returnOnHandback : true;

			if (flag) {

				values[el.getAttribute("id")] = val;
			}
		}

		for (let i = 0; i < this.hiddenFields.length; i++){

			// regexp cant have a default value because of the dumb hack
			values[this.hiddenFields[i].Key] = this.hiddenFields[i].Type === 'RegExp' ? '' : this.hiddenFields[i].Default;
		}




		if (AppSettings.client.CustomDataCapture) {
			for( const captureItem of AppSettings.client.CustomDataCapture) {
				const key = captureItem.Key;
				captureItem.Value = values[key];
			}
		}

		console.log('client', AppSettings.client);

		return values;
	};


	validateFields (isMobile) {
		this.removeAllValidationWarnings();

		const elementCollection = this.dcElements;

		const messages = [];

		for (let i = 0; i < elementCollection.length; i++){

			const el = elementCollection[i];
			if (!el.disabled){

				const validationField = el.parentNode.querySelector(".validation");

				if (el.mandatory && el.getValue() === ""){
					el.classList.add('invalid');
					messages.push(el.validationMessages.mandatory);
				}

				if (el.getValue() !== "" && el.maxlength != null && el.value.length < el.maxlength){
					el.classList.add('invalid');
					messages.push(el.validationMessages.length);
				}

				if (el.getValue() !== "" && el.isValid != null && !el.isValid()){
					el.classList.add('invalid');
					messages.push(el.validationMessages.invalid);
				}

			}

		}

		return messages;
	};


	removeAllValidationWarnings () {
		for( const el of this.dcElements) {
			el.classList.remove('invalid');
		}

	}



}





