class App {
	
	constructor(settings= {}) {
		this.settings = settings;
		settings.el = null;
		console.log('settings', this.settings);
		this.parseSettings(settings);
		
		$(this.rootElement).html('designer placeholder');
	}
	
	parseSettings(settings) {
		
		let rootElementName = settings.el;
		this.rootElement = settings.el ? this.findRootElementByName(settings.el) : this.findRootElementByDefault();
		if (!this.rootElement) {
			const rootElementName = settings.el || 'aam-designer';
			this.handlerError(`${rootElementName} is not defined`);
			return;
		}
		
		console.log('rootElement', this.rooElement);
		
		
	}
	
	findRootElementByName(name) {
		return $(`#${name}`)[0];
	}
	
	
	findRootElementByDefault() {
		return $('#aam-designer')[0] || $('.aam-designer-init')[0];
	}
	
	
	handlerError(error) {
		if (this.settings.callbacks && settings.callbacks.onError) {
			settings.callbacks.onError(error);
		}
		
		throw  new Error(error)
		
	}
	
	
}


export default App;