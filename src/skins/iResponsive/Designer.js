import template from './templates/designer.tmpl';

import Canvas from '../../core/canvas/Canvas';
import GalleryManager from '../../core/gallery/GaleryManager';
import AppSettings from './AppSettings';

import {GALLERY_LOADED} from '../../core/eventTypes';
class Designer {
	constructor(designerSettings, parentElement) {
		this.designerSettins = designerSettings;

		this.parentElement = parentElement;

		this.renderedTemplate = template;

		// waiting until galleries as loaded
		document.addEventListener(GALLERY_LOADED, () => {
			console.log('drawing canvas');

			const galleryManager = new GalleryManager();


			this.canvas = new Canvas(this.designerSettins, '#ssg-canvas');
			this.canvas.setImage(galleryManager.galleries[0].images[0].LargeImage);

			console.log(galleryManager);
			console.log(AppSettings);
		});

	}

	show() {
		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.designer');
	}
}

export  default Designer;