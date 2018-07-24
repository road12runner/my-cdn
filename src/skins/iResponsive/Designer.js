import template from './templates/designer.tmpl';

import Canvas from '../../core/canvas/Canvas';
import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';

import AppSettings from '../../core/AppSettings';

import {GALLERY_LOADED} from '../../core/eventTypes';
class Designer {
	constructor(designerSettings, parentElement) {
		this.designerSettins = designerSettings;

		this.parentElement = parentElement;

		this.renderedTemplate = template;

		// waiting until galleries as loaded
		document.addEventListener(GALLERY_LOADED, () => {
			console.log('drawing canvas');

			this.galleryManager = new GalleryManager();


			this.canvas = new Canvas(this.designerSettins, '#ssg-canvas');
			this.canvas.setImage(this.galleryManager.galleries[0].images[0].LargeImage);

			console.log(AppSettings);

			this.showClipArts();
		});

	}

	show() {
		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.designer');

	}


	showClipArts() {
		const clipartContainer = this.el.querySelector('.cliparts');
		let cliparts = [];
		this.galleryManager.getClipArts().forEach( item => {
			cliparts = cliparts.concat(item.images);
		});


		const gallery = new SimpleGallery(clipartContainer, {
			images: cliparts,
			showImageAsChild: true,
			dragable: true
		});



		console.log(clipartContainer, cliparts);
	}

}

export  default Designer;