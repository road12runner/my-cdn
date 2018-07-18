import Designer from './Designer';

import template from './templates/main-container.tmpl';

class MainContainer {
	constructor (designerSettings, parentElement) {
		// TODO add rendering
		this.renderedTemplate = template;
		this.parentElement = parentElement;
		this.designerSettings = designerSettings;
	}

	// show main container
	show() {
		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.main-container');

		// show designer page
		const designer = new Designer(this.designerSettings, this.el);
		designer.show();

	}

	hide() {

	}
}

export default MainContainer;