import App from './App';

import './styles/main.scss';

export function designer (settings = {}) {

	this.settings = settings;
	const me = document.querySelector('script[data-name="aam-designer"]');
	let bootstrap = false;
	this.handoverKey =  settings.handoverKey;
	if (me) {

		//extract handover key attribute in script tag if not define in settings
		if (!this.handoverKey) {
			this.handoverKey = me.getAttribute('data-handoverkey') || null;
		}


		//if we're bootstraping
		const bootstrapAttr = me.getAttribute('data-bootstrap');
		bootstrap = bootstrapAttr && bootstrapAttr.toLowerCase() === 'true';
	}

	this.rootElement = settings.el ? findRootElementByName() : findRootElementByDefault();

	// terminate designer if rootElement has not  been found
	if (!this.rootElement) {
		//root element is not found - cannot proceed
		const rootElementName = settings.el || '#amm-designer';
		handlerError(`Designer element ${rootElementName} doesn't exist`);
	}

	// extract handover key from  rootElement if not defined before
	if (!this.handoverKey)  {
		this.handoverKey = this.rootElement.getAttribute('data-handoverkey');
		// terminate designer if handover key has not  been found
		if (!this.handoverKey) {
			handlerError('Please provide handoverkey');
		}
	}

	const app = new App(this);


	if (bootstrap) {
		start();
	}


	function handlerError(error) {
		if (settings.callbacks && settings.callbacks.onError) {
			settings.callbacks.onError(error);
		}

		throw  new Error(error)

	}




	this.start = function() {
		console.log('start designer');
		app.start();
	};

	this.hide = function() {
		this.rootElement.style.display = 'none';
	};

	this.show = function() {
		this.rootElement.style.display = 'block';
	};

	this.close = function() {
	};



	function findRootElementByName (name) {
		return document.querySelector(`#${name}`);
	}

	function findRootElementByDefault () {
		return document.querySelector('#aam-designer') || document.querySelector('.aam-designer-init');
	}


	return this;
}

//window.aam = aam;