import template from './templates/data-capture.tmpl';

import localize from   '../../core/localize';

import AppSettings from '../../core/AppSettings';

import  DataCaptureHelper  from '../../core/dataCapture/DataCaptureHelper';

import {clearElement} from '../../core/utils';

export default class DataCapture {
	constructor (parentElement, datacaptureFields = [], options = {}) {

		this.parentElement = parentElement;
		this.datacaptureFields = datacaptureFields;
		this.renderedTemplate = template;


		this.el = document.createElement('div');
		this.el.className= 'data-capture';
		this.el.innerHTML = this.renderedTemplate;


		//TODO improve adding gallery
		const designer = this.parentElement.querySelector('.designer');
		this.parentElement.insertBefore(this.el, designer);


		localize(this.el, AppSettings.Language);

		this.onClose = options.onClose || (() => {});
		this.onNext = options.onNext || (() => {});

		this.el.querySelector('#btn-back').onclick = () => {
			this.parentElement.removeChild(this.el);
			this.onClose();
		};


		this.btnNextButton = this.el.querySelector('#btn-next');


		this.btnNextButton.onclick = () => {
			// return back

			const errors = this.helper.getValidationMessages(AppSettings.isTouchDevice());
			console.log('validate', errors);
			this.showErrors(errors);

			// if (errors.length > 0) {
			// 	this.btnNextButton.setAttribute('disabled', true)
			// } else {
			// 	this.btnNextButton.removeAttribute('disabled');
			//
			// 	// get values
			//
			// }


			if (errors.length === 0) {
				//get values
				const values = this.helper.getValues(false);
				this.parentElement.removeChild(this.el);
				this.onNext(values);
			}
		};


		this.renderContainer(this.el.querySelector('#datacapture-container'), this.datacaptureFields);


	}


	showErrors(errors) {
		const errorContainer = this.el.querySelector('.error--container');
		clearElement(errorContainer);

		if (errors) {
			const ul = document.createElement('ul');
			errorContainer.appendChild(ul);

			for( const error of errors) {
				const el = document.createElement('li');
				el.className = 'error--message';
				el.innerHTML = error;
				ul.appendChild(el);
			}
		}
	}



	renderContainer(el, items) {
		const langData = AppSettings.Language;

		var templateMessages = {
			checkbox: {invalid: langData.DataCapture.ErrorCheckbox},
			regexp: {
				invalid: langData.DataCapture.ErrorBadRegExp,
				numericOnly: langData.DataCapture.ErrorBadFormat
			},
			input: {length: langData.DataCapture.ErrorBadLength},
			email: {
				invalid: langData.DataCapture.ErrorInvalidEmail,
				mandatory: langData.DataCapture.ErrorEnterEmail,
				label: langData.DataCapture.EnterEmail,
				confirmlabel: langData.DataCapture.ConfirmEmail,
				nomatch: langData.DataCapture.ErrorEmailDoesNotMatch
			},
			mandatory: langData.DataCapture.ErrorEmptyField,
			competition: {label: langData.DataCapture.VerifyTab.CompOnly}
		};

		this.helper = new DataCaptureHelper(el, items, templateMessages, AppSettings.isTouchDevice());
	}

}

