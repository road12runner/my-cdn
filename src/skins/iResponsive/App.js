import * as api from '../../core/net/api';

import designerTemplate from './templates/designer.tmpl';

import MainContainer  from './MainContainer';
import GalleryManager from '../../core/gallery/GaleryManager';
import AppSettings from '../../core/AppSettings';


class App {
	
	constructor({settings, handoverKey, rootElement}) {

		this.settings = settings;
		AppSettings.handoverKey = handoverKey;
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

		const that = this;

		//load designer
		async function loadDesigner() {
			const response = await api.getDesigner(AppSettings.handoverKey);
			if (!response) {
				//TODO handle bad response
				return;
			}

			AppSettings.designerSettings = response;
			console.log('designerSettings', AppSettings.designerSettings);

			if (that.options.orientation) {
				AppSettings.designerSettings.Orientation.Type = this.options.orientation;
			}

			if (that.options.languageId) {
				AppSettings.designerSettings.Language = this.options.languageId;
			}


			if (AppSettings.designerSettings.Galleries.Enabled === true && AppSettings.designerSettings.Galleries.URL) {
			}

			return response;
		}



		async function loadGalleries() {
			console.log('load galleries');
			const galleryManager = new GalleryManager();
			return await galleryManager.loadGalleries(AppSettings.designerSettings.Galleries.URL);
		}

		//create client
		async function createClient() {
			const client = await api.createClient(AppSettings.handoverKey, {LanguageId: AppSettings.designerSettings.Language});
			AppSettings.client = client;
			AppSettings.clientId = client.CardImageId;
			console.log('client info', AppSettings.client);
			return client;
		}

		//load language data
		async function loadLanguage() {
			const res = await api.getLanguage(AppSettings.handoverKey, AppSettings.designerSettings.Language);
			console.log('language', res);
			AppSettings.Language = res || {};
			AppSettings.Language.LanguageId = AppSettings.designerSettings.Language;
			return res;
		}


		// call chain of requests
		loadDesigner().then(createClient).then(loadGalleries).then(loadLanguage).then( () => {
			console.log('show maincontainer');
			const mainContainer = new MainContainer(this.rootElement);
			mainContainer.show();
		})


	}

	

	handlerError(error) {
		if (this.settings.callbacks && this.settings.callbacks.onError) {
			this.settings.callbacks.onError(error);
		}
		
		throw  new Error(error)
		
	}


	handleResize() {
		// const {width, height} = this.rootElement.getBoundingClientRect();
		// console.log('Resize', width, height);

	}
	
	
}


export default App;