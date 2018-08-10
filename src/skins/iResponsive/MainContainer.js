import Designer from './Designer';

import template from './templates/main-container.tmpl';

class MainContainer {
	constructor (parentElement) {
		// TODO add rendering
		this.renderedTemplate = template;
		this.parentElement = parentElement;
	}

	// show main container
	show() {
		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.main-container');

		// show designer page
		const designer = new Designer(this.el);
		designer.show();

	}

	hide() {

	}
}

export default MainContainer;