import template from './templates/error.tmpl';
import localize from   '../../core/localize';
import AppSettings from '../../core/AppSettings';

export default class Error {
	constructor (parentElement) {

		parentElement.innerHTML =  template;

		if (AppSettings.Language) {
			localize(parentElement, AppSettings.Language);
		}
	}
}



//todo  pass error message into error container

