import template from './templates/not-supported.tmpl';
import localize from   '../../core/localize';
import AppSettings from '../../core/AppSettings';

export default class NotSupported {
	constructor (parentElement) {

		this.parentElement = parentElement;

		this.renderedTemplate = template;


		this.el = document.createElement('div');
		this.el.className= 'not-supported';
		this.el.innerHTML = template;


		//TODO improve adding gallery
		const designer = this.parentElement.querySelector('.designer');
		this.parentElement.insertBefore(this.el, designer);


		localize(this.el, AppSettings.Language);

	}
}


