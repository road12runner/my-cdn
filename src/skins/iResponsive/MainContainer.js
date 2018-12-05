import BrowserCheck  from '../../core/lib/BrowserCheck';
import Designer from './Designer';
import Gallery from './Gallery';
import NotSupported from './NotSupported';
import template from './templates/main-container.tmpl';

class MainContainer {
	constructor (parentElement) {
		this.renderedTemplate = template;
		this.parentElement = parentElement;


		this.designer = {};
	}

	// show main container
	show() {
		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.main-container');


		if (new BrowserCheck().isVersionSupported({ios: 9, android: 4.4, ie: 11}) !== true) {
			new NotSupported(this.el);

		} else {
			// show designer page
			this.designer = new Designer(this.el, {
				onShowGallery: () => this.showGallery()
			});
			//this.designer.show();

		}


	}



	showGallery() {
		this.designer.hide();
		 const gallery = new Gallery(this.el);
	}

	hide() {

	}
}

export default MainContainer;