import * as api from '../../core/net/api';

import designerTemplate from './templates/designer.tmpl';

import MainContainer  from './MainContainer';
import GalleryManager from '../../core/gallery/GaleryManager';
import AppSettings from '../../core/AppSettings';

class App {
	
	constructor({settings, handoverKey, rootElement}) {

		this.settings = settings;
		this.handoverKey = handoverKey;
		this.rootElement = rootElement;
		this.options = settings.options || {};

		//this.parseSettings(settings);
		
		//$(this.rootElement).html('designer placeholder');
	}



	start() {
		console.log('start App');
		this.rootElement.innerHTML = 'Loading...';
		window.addEventListener('resize', () => this.handleResize());

		const {width, height} = this.rootElement.getBoundingClientRect();

		console.log(width, height);



		api.getDesigner(this.handoverKey).then(response => {
			if (!response) {
				//TODO handle bad response
				return;
			}

			this.Designer = response;
			AppSettings.settings = response;

			console.log('designer', this.Designer);
			if (this.options.orientation) {
				this.Designer.Orientation.Type = this.options.orientation;
			}

			if (this.options.languageId) {
				this.Designer.Language = this.options.languageId;
			}


			if (this.Designer.Galleries.Enabled === true && this.Designer.Galleries.URL) {
				this.galleryManager = new GalleryManager();
				this.galleryManager.loadGalleries(this.Designer.Galleries.URL);
			}

			//const template = document.createElement(designerTemplate);


			//console.log('template', designerTemplate, this);
			//this.rootElement.innerHTML = designerTemplate;
			const mainContainer = new MainContainer(this.Designer, this.rootElement);
			mainContainer.show();

		});
	}

	

	handlerError(error) {
		if (this.settings.callbacks && this.settings.callbacks.onError) {
			this.settings.callbacks.onError(error);
		}
		
		throw  new Error(error)
		
	}


	handleResize() {
		const {width, height} = this.rootElement.getBoundingClientRect();
		console.log('Resize', width, height);

	}
	
	
}


export default App;