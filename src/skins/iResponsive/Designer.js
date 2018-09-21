import template from './templates/designer.tmpl';

import Canvas from '../../core/canvas/Canvas';
import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';
import Upload from '../../core/lib/Upload';

import AppSettings from '../../core/AppSettings';

import { GALLERY_LOADED } from '../../core/eventTypes';

import { clearElement } from '../../core/utils';

import * as api from '../../core/net/api';
import { LAYER_TYPE } from '../../core/constants';
import { DOODLE, STOCK_IMAGE, CUSTOM_IMAGE } from '../../core/canvas/itemTypes';


import SpecialEffects, {SPECIAL_EFFECTS_INTENSITY} from '../../core/canvas/SpecialEffects'


//TODO get rig of jquery
import jQuery from 'jquery';

window.$ = window.jQuery = jQuery;

import '../../core/lib/spectrum.scss';

import '../../core/lib/color-picker';

class Designer {
	constructor (parentElement) {

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

	handleTestCoverage (result) {

		const errorContainer = this.el.querySelector('#error-message');
		errorContainer.innerHTML = result ? '' : ' out of border ';

	}

	show () {

	}

	showClipArts () {
		const clipartContainer = this.el.querySelector('.cliparts');
		let cliparts = [];
		this.galleryManager.getClipArts().forEach(item => {
			cliparts = cliparts.concat(item.images);
		});

		const gallery = new SimpleGallery(clipartContainer, {
			images: cliparts,
			showImageAsChild: true,
			dragable: true,
			onImageSelected: id => this.clipartSelected(id)
		});

		console.log(clipartContainer, cliparts);
	}

	clipartSelected (id) {

		const imageId = +id;
		const image = this.galleryManager.getImageById(imageId);
		console.log('clipart', id, image);
		this.canvas.addImageItem(imageId, image.LargeImage);
	}

	handleControls () {
		const DEFAULT_MOVEMENT = 2;
		this.el.querySelector('#btn-up').addEventListener('click', () => {
			this.canvas.moveUp(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-down').addEventListener('click', () => {
			this.canvas.moveDown(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-left').addEventListener('click', () => {
			this.canvas.moveLeft(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-right').addEventListener('click', () => {
			this.canvas.moveRight(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-rotate-left').addEventListener('click', () => {
			this.canvas.rotate(-DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-rotate-right').addEventListener('click', () => {
			this.canvas.rotate(DEFAULT_MOVEMENT);
		});

		this.el.querySelector('#btn-flip').addEventListener('click', () => {
			this.canvas.flip();
		});

		this.el.querySelector('#btn-submit').addEventListener('click', () => this.submit());

		this.el.querySelector('#btn-preview').addEventListener('click', () => {
			this.renderPreview();
		});

		this.el.querySelector('#btn-text').onclick = () => {
			const text = this.el.querySelector('#text-field').value;
			this.canvas.addTextItem('test', text);
		};

		this.el.querySelector('#btn-text-bold').onclick = () => {
			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === 'Text') {
				const font = obj.getFontStyle();
				font.bold = !font.bold;
				obj.setFontStyle(font);
			}

		};

		this.el.querySelector('#btn-text-italic').onclick = () => {
			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === 'Text') {
				const font = obj.getFontStyle();
				font.italic = !font.italic;
				obj.setFontStyle(font);
			}
		};

		this.el.querySelector('#btn-text-shadow').onclick = () => {
			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === 'Text') {
				const font = obj.getFontStyle();
				font.shadow = !font.shadow;
				obj.setFontStyle(font);
			}
		};

		this.el.querySelector('#btn-text-stroke').onclick = () => {

			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === 'Text') {
				const font = obj.getFontStyle();
				font.stroke = !font.stroke;
				obj.setFontStyle(font);
			}

		};

		this.el.querySelector('#text-field').oninput = (e) => {
			//this.canvas.setText(e.target.value);
			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === 'Text') {
				obj.setText(e.target.value);
			}

		};

		$('#text-color').spectrum({
			containerClassName: 'awesome',
			move: (color) => {

				const obj = this.canvas.getSelectedObject();
				if (obj && obj.type === 'Text') {
					const font = obj.getFontStyle();
					font.color = color.toHexString();
					obj.setFontStyle(font);
				}

			}
		});

		var doodleColor = '#ffffff';
		$('#doodle-color').spectrum({
			color: doodleColor,
			containerClassName: 'awesome',
			move: (color) => {

				doodleColor = color.toHexString();

				const obj = this.canvas.getSelectedObject();
				if (obj && obj.type === DOODLE) {
					obj.setLineColor(doodleColor);
				}

			}
		});

		this.el.querySelector('#btn-add-doodle').onclick = () => {
			this.canvas.addDoodleItem({
				lineWidth: this.el.querySelector('#doodle-line-width').value,
				lineColor: doodleColor
			});
		};

		this.el.querySelector('#btn-doodle-clear').onclick = () => {
			const obj = this.canvas.getSelectedObject();
			if (DOODLE === obj.type) {
				obj.clear();
			}
		};

		this.el.querySelector('#btn-doodle-undo').onclick = () => {
			const obj = this.canvas.getSelectedObject();
			if (DOODLE === obj.type) {
				obj.undo();
			}
		};

		this.el.querySelector('#doodle-line-width').oninput = (e) => {
			const obj = this.canvas.getSelectedObject();
			if (obj && obj.type === DOODLE) {
				obj.setLineWidth(+e.target.value);
			}
		};

		const input = this.el.querySelector('#file-upload');

		const onComplete = (res) => {
			console.log(res);

			const {Id, Url} = res.result;
			const obj = this.canvas.getSelectedObject();

			obj.setImage(Id, Url, CUSTOM_IMAGE);

		};

		const onProgress = (res) => {
			console.log('progress', res)
		};

		const upload = new Upload(api.getImageUploadUrl(AppSettings.handoverKey, AppSettings.clientId, LAYER_TYPE.CARD),
			input,
			{
				autoUpload: true,
				callbacks: {
					onComplete,
					onProgress
				}
			});


		this.el.querySelector('#btn-reset').onclick = () =>  {
			const obj = this.canvas.getSelectedObject();
			if (obj) {
				obj.reset();
			}
		};

		this.el.querySelector('#btn-filters').onclick = () => {
			console.log('filters');
			this.filterIntensity = SPECIAL_EFFECTS_INTENSITY.LOW;
			this.renderFilters(this.filterIntensity);
		};

		this.el.querySelector('#btn-filters-intensity-low').onclick = () => {
			this.filterIntensity = SPECIAL_EFFECTS_INTENSITY.LOW;
		};

		this.el.querySelector('#btn-filters-intensity-medium').onclick = () => {
			this.filterIntensity = SPECIAL_EFFECTS_INTENSITY.MEDIUM;
		};

		this.el.querySelector('#btn-filters-intensity-high').onclick = () => {
			this.filterIntensity = SPECIAL_EFFECTS_INTENSITY.HIGH;
		};
	}

	renderFilters(filterIntensity) {
		const obj = this.canvas.getSelectedObject();
		console.log('image', obj.image);


		const getSpecialEffects = () => {

			return new Promise( resolve => {
				if (this.specialEffectsApp) {
					resolve(this.specialEffectsApp);
				} else {
					this.specialEffectsApp = new SpecialEffects();
					this.specialEffectsApp.loadEffects(AppSettings.designerSettings.SpecialEffects.Effects).then( () => resolve(this.specialEffectsApp));
				}
			})

		};


		getSpecialEffects().then( app => {
			// app.process(obj.image, this.filterIntensity).then( res => {
			// 	console.log('after process', res);
			// });

			app.process(obj.image, this.filterIntensity);

		});


		// const specEffects = new SpecialEffects( obj.image, effects, this.filterIntensity);
		// specEffects.loadFilters(effects).then( );
	}





	renderPreview () {
		const previewEl = this.parentElement.querySelector('.preview-container');

		//const {width, height} =  previewEl.getBoundingClientRect();

		//AppSettings.designerSettings.Desktop.Printer.Size
		const {Width, Height} = AppSettings.designerSettings.Printer.Size;

		const img = this.canvas.getPreviewImage(Width, Height);
		const previewImage = new Image();
		previewImage.src = img;
		previewImage.onload = () => {
			clearElement(previewEl);
			previewEl.appendChild(previewImage);
		};
	}

	submit () {
		this.canvas.submit();

	}

}

export default Designer;