import template from './templates/designer.tmpl';

import Canvas from '../../core/canvas/Canvas';
import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';

import AppSettings from '../../core/AppSettings';

import {GALLERY_LOADED} from '../../core/eventTypes';

import {clearElement} from '../../core/utils';

import * as api from '../../core/net/api';


class Designer {
	constructor(parentElement) {

		this.parentElement = parentElement;

		this.renderedTemplate = template;

		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.designer');

		// waiting until galleries as loaded
		//TODO redo with  event listener
		console.log('drawing canvas');

		this.galleryManager = new GalleryManager();


		this.canvas = new Canvas('#ssg-canvas', {
			imageId: this.galleryManager.galleries[0].images[0].Id,
			imageUrl: this.galleryManager.galleries[0].images[0].LargeImage,
			onCardCoverage: e => this.handleTestCoverage(e),
			touchDevice: AppSettings.isTouchDevice(),
			//margin: 100,
			scale: 2,
			isResponsible: true
		});




		console.log(AppSettings);

		this.showClipArts();

		this.handleControls();


			// setTimeout( () => {
			// 	this.renderPreview();
			// }, 1000);


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

		const imageId = +id;
		const image = this.galleryManager.getImageById(imageId);
		console.log('clipart', id, image);
		this.canvas.addImageItem(imageId, image.LargeImage);
	}



	
	handleControls() {
		const DEFAULT_MOVEMENT = 2;
		this.el.querySelector('#btn-up').addEventListener('click', ()=> {
			this.canvas.moveUp(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-down').addEventListener('click', ()=> {
			this.canvas.moveDown(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-left').addEventListener('click', ()=> {
			this.canvas.moveLeft(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-right').addEventListener('click', ()=> {
			this.canvas.moveRight(DEFAULT_MOVEMENT);
		});


		this.el.querySelector('#btn-rotate-left').addEventListener('click', ()=> {
			this.canvas.rotate(-DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-rotate-right').addEventListener('click', ()=> {
			this.canvas.rotate(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-flip').addEventListener('click', ()=> {
			this.canvas.flip();
		});

		this.el.querySelector('#btn-submit').addEventListener('click', () => this.submit());

		this.el.querySelector('#btn-preview').addEventListener('click', ()=> {
			this.renderPreview();
		});


		this.el.querySelector('#btn-text').onclick = () => {
			this.canvas.addTextItem('test', 'text');
		}

	}

	renderPreview() {
		const previewEl = this.parentElement.querySelector('.preview-container');

		const {width, height} =  previewEl.getBoundingClientRect();

		const img = Canvas.getPreviewImage(this.canvas, width, height);
		//console.log(img);

		// const config = this.canvas.getConfiguration();
		// const previewCanvas = new Canvas(null, {
		// 	preview: true,
		// 	config,
		// });
		//
		//
		// const previewImgUrl = previewCanvas.getSnapshot();
		// console.log('previewImage', previewImgUrl);
		// const previewImage = new Image();
		const previewImage = new Image();
		previewImage.src = img;
		previewImage.onload = () => {
			clearElement(previewEl);
			previewEl.appendChild(previewImage);
		};







	}


	submit() {
		this.canvas.submit();

	}

	
	
}

export  default Designer;