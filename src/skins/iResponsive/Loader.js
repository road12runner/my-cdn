import template from './templates/loader.tmpl';

const findLoader = (list) =>{
	for( const item of list) {
		if ('DIV' === item.nodeName && 'loader' === item.className) {
			return item;
		}
	}
};


export  default class Loader  {
	constructor (parentElement) {
		this.parentElement = parentElement;

	}

	show() {

		const el = document.createElement('div');
		el.className = 'loader';
		el.innerHTML = template;

		if (!findLoader(this.parentElement.childNodes)) {
			this.parentElement.insertBefore(el, this.parentElement.childNodes[0]);
		}

	}
	hide() {
		const el = findLoader(this.parentElement.childNodes);
		if (el) {
			this.parentElement.removeChild(el);
		}
	}
}