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

		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.designer');

		// waiting until galleries as loaded
		//TODO redo with  event listener
		document.addEventListener(GALLERY_LOADED, () => {
			console.log('drawing canvas');

			this.galleryManager = new GalleryManager();


			this.canvas = new Canvas(this.designerSettins, '#ssg-canvas', {
				image: this.galleryManager.galleries[0].images[0].LargeImage,
				onCardCoverage: e => this.handleTestCoverage(e),
				touchDevice: AppSettings.isTouchDevice()
			});

			console.log(AppSettings);

			this.showClipArts();
		});

	}


	handleTestCoverage(result) {

		const errorContainer = this.el.querySelector('#error-message');
		errorContainer.innerHTML = result ? '': ' out of border ';

	}

	show() {

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
			dragable: true,
			onImageSelected:  id => this.clipartSelected(id)
		});



		console.log(clipartContainer, cliparts);
	}


	clipartSelected(id) {

		const image = this.galleryManager.getImageById(+id);
		console.log('clipart', id, image);
		this.canvas.addImageItem(id, image.LargeImage);
	}
	
	
	
	
}

export  default Designer;