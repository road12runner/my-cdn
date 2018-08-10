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
			margin: 50
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

			// const config = this.canvas.getConfiguration();
			// console.log(config);
			//
			//
			// const previewEl = this.parentElement.querySelector('.preview-container');
			//
			// const {width, height} =  previewEl.getBoundingClientRect();
			//
			// const previewCanvasEL = document.createElement('canvas');
			// previewCanvasEL.id = 'preview-canvas';
			// previewCanvasEL.width = width;
			// previewCanvasEL.height = height;
			// previewEl.appendChild(previewCanvasEL);
			// //
			// //
			// //
			// this.previewCanvas = new Canvas(this.designerSettins, `#${previewCanvasEL.id}`, {
			// 	preview: true,
			// 	config,
			// });
			//
			//
			//
			// const conf = {
			// 	card: {
			// 		flipped : false,
			// 		height : 193,
			// 		id : undefined,
			// 		imageUrl : "https://devserver.serversidegraphics.com/PCS/API/V1/designers/56bb9aca-b2ee-458b-969f-8e8f9335f9f8/Images/5940.Jpg",
			// 		originPoint : {
			// 			x : 200,
			// 			y : 200
			// 		},
			// 		rotation : 0,
			// 		width : 281
			// 	},
			// 	items : []
			// }


			// crop is not good as it should interpolate on big image
			// function crop (canvas, offsetX, offsetY, width, height, destWith, destHeight, callback) {
			// 	// create an in-memory canvas
			// 	var buffer = document.createElement('canvas');
			// 	var b_ctx = buffer.getContext('2d');
			// 	// set its width/height to the required ones
			// 	buffer.width = destWith;
			// 	buffer.height = destHeight;
			// 	// draw the main canvas on our buffer one
			// 	// drawImage(source, source_X, source_Y, source_Width, source_Height,
			// 	//  dest_X, dest_Y, dest_Width, dest_Height)
			// 	b_ctx.drawImage(canvas, offsetX, offsetY, width, height,
			// 		0, 0, buffer.width, buffer.height);
			// 	// now call the callback with the dataURL of our buffer canvas
			// 	callback(buffer.toDataURL());
			// }
			//
			//
			// const canvasEl = this.el.querySelector('#ssg-canvas');
			//
			// crop(canvasEl, this.canvas.templateArea.x, this.canvas.templateArea.y, this.canvas.templateArea.width, this.canvas.templateArea.height, 800, 600, function (dataUrl) {
			// 	previewEl.style.backgroundImage = `url(${dataUrl})`;
			// });


		});



	}

	renderPreview() {
		const previewEl = this.parentElement.querySelector('.preview-container');

		const {width, height} =  previewEl.getBoundingClientRect();

		// const previewCanvasEL = document.createElement('canvas');
		// previewCanvasEL.id = 'preview-canvas';
		// previewCanvasEL.width = width;
		// previewCanvasEL.height = height;
		// previewEl.appendChild(previewCanvasEL);
		//
		//
		//



		// const config = {
		// 	card: {
		// 		flipped : false,
		// 		height : 193,
		// 		id : undefined,
		// 		imageUrl : "https://devserver.serversidegraphics.com/PCS/API/V1/designers/56bb9aca-b2ee-458b-969f-8e8f9335f9f8/Images/5940.Jpg",
		// 		originPoint : {
		// 			x : 200,
		// 			y : 200
		// 		},
		// 		rotation : 0,
		// 		width : 281
		// 	},
		// 	items : []
		// };

		const config = this.canvas.getConfiguration();

		const previewCanvas = new Canvas(null, {
			preview: true,
			config,
		});


		const previewImgUrl = previewCanvas.getSnapshot();
		console.log('previewImage', previewImgUrl);
		const previewImage = new Image();
		previewImage.src = previewImgUrl;
		previewImage.onload = () => {
			clearElement(previewEl);
			previewEl.appendChild(previewImage);
		};







	}


	submit() {


		const layers = [this.canvas.card, ...this.canvas.items];

		let count = 0;
		const cardLayers =[];

		const template = this.canvas.card.template;
		console.log(template);
		layers.forEach( (layer, i) => {

			api.submitLayer(AppSettings.handoverKey, layer.layerType).then( layerConfig => {
				console.log(layerConfig);
				count++;

				const layerCoords = layer.getBoundRect();
				layerConfig.Configuration.Left = Math.floor(layerCoords.left - template.x);
				layerConfig.Configuration.Top = Math.floor(layerCoords.top - template.y);
				layerConfig.Configuration.Right = Math.floor(layerCoords.right - template.x);
				layerConfig.Configuration.Bottom = Math.floor(layerCoords.bottom - template.y);
				layerConfig.Configuration.Rotation = Math.floor(layer.rotation);
				layerConfig.Configuration.Flip = layer.flipped ? 1: 0;


				layerConfig.ImageId = layer.id;
				layerConfig.Order = i;

				cardLayers.push(layerConfig);

				//weird way to wait for all card layer submission
				if (count === layers.length ) {
					console.log('perform  submit request', layerConfig);
					submitCard(cardLayers);
				}
			});

		});






		function submitCard(layers = []) {

			const data = AppSettings.client;
			data.Layers = layers;

			api.submitCard(AppSettings.handoverKey, AppSettings.clientId, data).then( res => {
				console.log('submit response', res);
			})
		}
	}

	
	
}

export  default Designer;