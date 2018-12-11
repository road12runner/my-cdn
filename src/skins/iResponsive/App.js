import * as api from '../../core/net/api';


import MainContainer  from './MainContainer';
import GalleryManager from '../../core/gallery/GaleryManager';
import AppSettings from '../../core/AppSettings';
import Error from './Error';

const  DESKTOP_WIDTH_BREAKPOINT = 600;




class App {
	
	constructor({settings, handoverKey, rootElement}) {

		console.log('settings', settings);

		this.settings = settings;
		this.rootElement = rootElement;
		this.options = settings.options || {};

		AppSettings.handoverKey = handoverKey;
		AppSettings.environment = this.options.env || 'dev';
		//this.parseSettings(settings);
		
		//$(this.rootElement).html('designer placeholder');



	}


	start() {
		console.log('start App');
		this.handleResize();
		this.rootElement.innerHTML = 'Loading...';
		window.addEventListener('resize', (e) => this.handleResize(e));

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
				AppSettings.designerSettings.Language = that.options.languageId;
			}

			return response;
		}



		async function loadGalleries() {
			if (!AppSettings.designerSettings.Galleries.URL) {
				return;
			}
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
			AppSettings.Language = res || {};
			AppSettings.Language.LanguageId = AppSettings.designerSettings.Language;
			return res;
		}


		// call chain of requests
		loadDesigner().then(createClient).then(loadGalleries).then(loadLanguage).then( () => {

			if (AppSettings.isTouchDevice()) {
				this.rootElement.classList.add('mobile');
			}

			const mainContainer = new MainContainer(this.rootElement);
			mainContainer.show();
		}, error => {
			console.log('error', error);
			new Error(this.rootElement);
		})


	}

	

	handlerError(error) {
		if (this.settings.callbacks && this.settings.callbacks.onError) {
			this.settings.callbacks.onError(error);
		}
		
		throw  new Error(error)
		
	}


	handleResize() {

		if (AppSettings.isTouchDevice() === true) {
			return;
		}

		const {width, height} = this.rootElement.getBoundingClientRect();
		console.log('Resize', width, height);
		if (width <= DESKTOP_WIDTH_BREAKPOINT) {
			this.rootElement.classList.add('small-desktop');
			this.rootElement.classList.remove('desktop');
		} else {
			this.rootElement.classList.remove('small-desktop');
			this.rootElement.classList.add('desktop');
		}

	}
	
	
}


export default App;