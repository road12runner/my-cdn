import template from './templates/designer.tmpl';

import Canvas from '../../core/canvas/Canvas';
import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';
import Dropdown  from '../../core/gallery/Dropdown';

import localize from   '../../core/localize';

import Gallery from './Gallery';
import FacebookGallery from './FacebookGallery';
import Preview from './Preview';
import DataCapture from './DataCapture';
import TextControl from './components/TextControl';
import DoodleControl from './components/DoodleControl';

import Upload from '../../core/lib/Upload';

import AppSettings from '../../core/AppSettings';

import { GALLERY_LOADED } from '../../core/eventTypes';

import { clearElement } from '../../core/utils';

import {facebookAuth, getFacebookToken} from '../../core/net/facebookApi';

import * as api from '../../core/net/api';
import { LAYER_TYPE,SPECIAL_EFFECTS_INTENSITY } from '../../core/constants';
import { DOODLE, STOCK_IMAGE, CUSTOM_IMAGE, TEXT, LOGO, CARD, IMAGE } from '../../core/canvas/itemTypes';


import SpecialEffects from '../../core/canvas/SpecialEffects'
import IntensityButton from './components/InternsityButton';
import Loader from './Loader';


const AVAILABLE_FEATURES = {
	FACEBOOK: 'FACEBOOK',
	FILTERS: 'FILTERS',
	EMOJI: 'EMOJI',
	LOGO: 'LOGO',
	TEXT: 'TEXT',
	DOODLE: 'DOODLE'
};



//TODO get rig of jquery
import jQuery from 'jquery';

window.$ = window.jQuery = jQuery;

import '../../core/lib/spectrum.scss';

import '../../core/lib/color-picker';
import ImageItem from '../../core/canvas/ImageItem';

class Designer {
	constructor (parentElement) {

		this.parentElement = parentElement;

		this.renderedTemplate = template;

		this.parentElement.innerHTML = this.renderedTemplate;
		this.el = this.parentElement.querySelector('.designer');

		this.loader = new Loader(this.el);

		this.activeFeature = null;

		this.loader.show();


		this.galleryManager = new GalleryManager();

		this.canvas = new Canvas('#ssg-canvas', {
			imageId: this.galleryManager.galleries[0].images[0].Id,
			imageUrl: this.galleryManager.galleries[0].images[0].LargeImage,
			onCardCoverage: e => this.handleTestCoverage(e),
			touchDevice: AppSettings.isTouchDevice(),
			margin: 30,
			//scale: 2,
			isResponsible: true,
			onLoaded : () => {
				this.loader.hide();
				this.handleLockedImage(this.galleryManager.galleries[0].images[0].Locked);
				AppSettings.isCustomImage = false;
			}
		});





		this.errorMessages = {
			coverage: AppSettings.Language.errorCoverage,
			locked: AppSettings.Language.errorLocked
		};

		console.log(AppSettings);
		this.btnNext = this.el.querySelector('#btn-next');

		this.handleControls();

		this.showGalleries();

		this.renderCardUploader();

		localize(this.el, AppSettings.Language);


		if (getFacebookToken()) {
			this.showFacebookView();
		}


		this.featuresContainer = this.el.querySelector('.features-items-container');
	}



	showFacebookView() {

		this.hideDesignerView();
		const gallery = new FacebookGallery(this.parentElement, {onClose : () => {
				this.showDesignerView();
			}, onSelectImage: async (imageUrl) =>  {

				this.showDesignerView();

				// upload image to PCS
				this.loader.show();

				try {
					const result = await api.uploadImageByUrl(AppSettings.handoverKey, AppSettings.clientId, imageUrl, api.CustomImageType.Facebook);
					await this.canvas.setCardImage(result.Id, result.Url);
					this.canvas.card.locked = false;
					this.handleLockedImage(false);
					this.loader.hide();
					AppSettings.isCustomImage = true;
				} catch (err) {
					//TODO show error if any
					this.loader.hide();
				}

			}});



	}

	handleTestCoverage (result) {


		const selectedObject = this.canvas.getSelectedObject();

		if (selectedObject.type === CARD && selectedObject.locked) {
			return;
		}

		const errorContainer = this.el.querySelector('#error-message');
		errorContainer.innerHTML = result ? '' : this.errorMessages.coverage;
		if (!result) {


			if (selectedObject.type === CARD || selectedObject.type === TEXT || selectedObject.type === IMAGE) {

				switch (AppSettings.designerSettings.Coverage.Image.Type) {
					case 'Error':
						errorContainer.classList.add('show');
						this.btnNext.setAttribute('disabled', 'disabled');
						break;
					case 'Warning':
						errorContainer.classList.add('show');
						break;
					default:
				}

			}
		} else {
			errorContainer.classList.remove('show');
			this.btnNext.removeAttribute('disabled');
		}
	}


	showClipArts () {
		//hide all previously opened features
		this.hideAllFeatures();

		if(this.activeFeature === AVAILABLE_FEATURES.EMOJI) {
			this.activeFeature = null;
			return;
		}


		this.activeFeature = AVAILABLE_FEATURES.EMOJI;


		let clipartContainer = this.featuresContainer.querySelector('.cliparts-container');
		if (!clipartContainer) {
			clipartContainer = document.createElement('div');
			clipartContainer.className = 'cliparts-container feature';

			let cliparts = [];
			this.galleryManager.getClipArts().forEach(item => {
				cliparts = cliparts.concat(item.images);
			});

			new SimpleGallery(clipartContainer, {
				images: cliparts,
				showImageAsChild: true,
				dragable: true,
				onImageSelected: id => this.clipartSelected(id)
			});


			clipartContainer.style.width = 54* cliparts.length + 'px';

			this.featuresContainer.appendChild(clipartContainer);
		} else {
			clipartContainer.classList.remove('hidden');
		}
	}



	showFilters() {

		this.hideAllFeatures();
		if (this.activeFeature === AVAILABLE_FEATURES.FILTERS) {
			this.activeFeature = null;
			return;
		}

		this.activeFeature = AVAILABLE_FEATURES.FILTERS;

		if (!this.intensity) {
			this.intensity = SPECIAL_EFFECTS_INTENSITY.LOW;
		}

		let effectsContainer = this.el.querySelector('.effects-container');
		if (!effectsContainer) {
			effectsContainer = document.createElement('div');
			effectsContainer.className = 'effects-container feature';
			this.featuresContainer.appendChild(effectsContainer);


			//render intensity button
			new IntensityButton(effectsContainer, {
				onIntensityChanged:  (intensity) => {

					this.loader.show();
					this.intensity = intensity;

					const effectList = this.el.querySelector('.effect-list');

					clearElement(effectList);

					setTimeout(()=>{
						this.renderFilters(this.intensity,() => this.loader.hide());
					}, 500);

				}
			});

			const effectListContainer = document.createElement('div');
			effectListContainer.className = 'effect-list';
			effectsContainer.appendChild(effectListContainer);

			this.loader.show();
			setTimeout(()=>{
				this.renderFilters(this.intensity,() => this.loader.hide());
				this.filtersRendered = true;
			}, 500);

		} else {
			effectsContainer.classList.remove('hidden');

			if (!this.filtersRendered) {
				this.loader.show();
				setTimeout(()=>{
					this.renderFilters(this.intensity,() => this.loader.hide());
					this.filtersRendered = true;
				}, 500);
			}
		}

	}

	hideFeatureContainer() {
		// hide feature item
		this.hideAllFeatures();
		this.activeFeature = null;

		//hide feature buttons
		this.featuresContainer.classList.remove('features-active');

	}


	hideAllFeatures() {
		this.featuresContainer.querySelectorAll('.feature').forEach( item => item.classList.add('hidden'));
	}


	changeImage(id) {

		const image = this.galleryManager.getSelectedGallery().find( item => item.Id === id);
		if (image) {

			this.loader.show();
			this.canvas.card.setImage(+id, image.LargeImage).then( ()=>  this.loader.hide() );

			this.handleLockedImage(image.Locked);
		}

		if (this.galleryManager.selectedGalleryId === 1) {
			AppSettings.isCustomImage = true;
		} else {
			AppSettings.isCustomImage = false;
		}

		this.filtersRendered = false;
	}



	showGalleries() {

		const galleryContainer = this.el.querySelector('.toolbox--image-selection--gallery--container');

		const gallery = new SimpleGallery(galleryContainer, {
			showImageAsChild: true,
			dragable: true,
			onImageSelected: id => this.changeImage(+id)
		});

		const gallerySelector = this.el.querySelector('#gallery-selector');
		const galleries = this.galleryManager.getStandardImages().map(gallery => ({
			id: gallery.Id,
			name: gallery.Name,
			locked: gallery.Locked
		}));
		const selector = new Dropdown(gallerySelector, galleries, {
			onItemSelected: (id) => {

				const selectedGallery = galleries.find( gallery => gallery.id === id);
				if (selectedGallery) {
					this.galleryManager.selectedGalleryId = id;
					const images = this.galleryManager.getSelectedGallery();
					gallery.loadImages(images);
				}

			}
		});

	}

	handleLockedImage(isLocked) {
		this.canvas.card.locked = isLocked;

		const errorContainer = this.el.querySelector('#error-message');
		errorContainer.innerHTML = isLocked ? this.errorMessages.locked : '' ;
		if (isLocked) {
			errorContainer.classList.add('show');
		} else {
			errorContainer.classList.remove('show');
		}

		if (isLocked) {
			this.el.querySelector('.controls--container').classList.add('locked');
			this.el.querySelector('.small-side--container').classList.add('locked');

		} else {
			this.el.querySelector('.controls--container').classList.remove('locked');
			this.el.querySelector('.small-side--container').classList.remove('locked');
		}


		this.btnNext.removeAttribute('disabled');

	}



	async showDataCapture() {

		// request data
		this.loader.show();

		const dataCaptureResponse = await api.performGetRequest(AppSettings.designerSettings.DataCapture.Url);
		this.hideDesignerView();
		this.loader.hide();

		new DataCapture(this.parentElement, dataCaptureResponse, {
			onClose: () => {
				this.showDesignerView()
			}, onNext: ( data) => {
				if (data) {
					this.showDesignerView();
					this.submit();
				}
			}
		});

	}

	showPreview() {
		const {Width, Height} = AppSettings.designerSettings.Printer.Size;
		const img = this.canvas.getPreviewImage(Width, Height);
		const previewImage = new Image();
		previewImage.src = img;
		previewImage.onload = () => {
			new Preview(this.parentElement, previewImage, {onClose: () => this.showDesignerView(), onNext: ()=> {
					if (AppSettings.isDataCaptureEnabled()) {
						this.showDataCapture();
					} else {
						this.showDesignerView();
						this.submit();
					}
				}});
		};

	}


	showTextFeature() {
		this.hideAllFeatures();
		if (this.activeFeature === AVAILABLE_FEATURES.TEXT) {
			this.activeFeature = null;
			return;
		}

		this.activeFeature = AVAILABLE_FEATURES.TEXT;


		let textFeature = this.el.querySelector('.text-feature');
		if (!textFeature) {
			textFeature = new TextControl(this.featuresContainer, this.canvas);

		} else {
			textFeature.classList.remove('hidden');
		}

	}

	showDoodleFeature() {
		this.hideAllFeatures();
		if (this.activeFeature === AVAILABLE_FEATURES.DOODLE) {
			this.activeFeature = null;
			return;
		}

		this.activeFeature = AVAILABLE_FEATURES.DOODLE;


		let doodleFeature = this.el.querySelector('.doodle-feature');
		if (!doodleFeature) {
			doodleFeature = new DoodleControl(this.featuresContainer, this.canvas);

		} else {
			doodleFeature.classList.remove('hidden');
		}

	}




	showLogoFeature() {

		const onComplete =  async (res) => {
			const img = await this.canvas.addImageItem(res.result.Id, res.result.Url);
			this.loader.hide();
		};

		const onProgress = ({percentComplete}) => {
		};

		const input = this.el.querySelector('#logo-file');
		new Upload(api.getImageUploadUrl(AppSettings.handoverKey, AppSettings.clientId, LAYER_TYPE.LOGO),
			input,
			{
				autoUpload: true,
				callbacks: {
					onComplete,
					onProgress
				}
			});

		this.loader.show();
		input.click();

	}


	renderCardUploader() {
		//todo add custom  image gallery  when new user image is uploaded
		const uploadInfo = this.el.querySelector('.toolbox--image-selection--upload--info');


		const onComplete =  async (res) => {

			uploadInfo.innerHTML = '';

			const img = await this.canvas.setCardImage(res.result.Id, res.result.Url);
			this.galleryManager.addCustomImage(res.result.Id, res.result.Url);
			this.showGalleries();
			this.handleLockedImage(false);
			AppSettings.isCustomImage = true;
			uploadInfo.innerHTML = 'Identifying...';

			this.filtersRendered = false;
			this.loader.hide();

		};

		const onProgress = ({percentComplete}) => {
			if (percentComplete) {
				uploadInfo.innerHTML = `Uploading... ${percentComplete}`;
			}

		};

		const input = this.el.querySelector('#file-upload');
		new Upload(api.getImageUploadUrl(AppSettings.handoverKey, AppSettings.clientId, LAYER_TYPE.CARD),
			input,
			{
				autoUpload: true,
				callbacks: {
					onComplete,
					onProgress
				}
			});


		this.el.querySelector('#btn-card-image-upload').onclick = () => {
			this.loader.show();
			uploadInfo.innerHTML = 'Uploading...';
			input.click();
		};


		this.el.querySelector('#small-btn-upload').onclick = () => {
			input.click();
		}

	}

	clipartSelected (id) {
		const imageId = +id;
		const image = this.galleryManager.getImageById(imageId);
		this.canvas.addImageItem(imageId, image.LargeImage);
	}

	handleControls () {
		const DEFAULT_MOVEMENT = 2;
		const TOOLBOX_BUTTON_ACTIVE = 'active';

		const galleryButton  = this.el.querySelector('.toolbox--button--gallery');
		const uploadButton = this.el.querySelector('.toolbox--button--upload');

		const galleryContainer = this.el.querySelector('.toolbox--image-selection--gallery');
		const uploadContainer = this.el.querySelector('.toolbox--image-selection--upload');

		galleryButton.onclick= () => {
			galleryButton.classList.add(TOOLBOX_BUTTON_ACTIVE);
			uploadButton.classList.remove(TOOLBOX_BUTTON_ACTIVE);

			galleryContainer.classList.add(TOOLBOX_BUTTON_ACTIVE);
			uploadContainer.classList.remove(TOOLBOX_BUTTON_ACTIVE);
		};


		uploadButton.onclick= () => {
			galleryButton.classList.remove(TOOLBOX_BUTTON_ACTIVE);
			uploadButton.classList.add(TOOLBOX_BUTTON_ACTIVE);

			galleryContainer.classList.remove(TOOLBOX_BUTTON_ACTIVE);
			uploadContainer.classList.add(TOOLBOX_BUTTON_ACTIVE);

		};


		//rotate image
		this.el.querySelector('#btn-rotate-left').onclick = () => {
			this.canvas.rotate(-DEFAULT_MOVEMENT);
		};

		this.el.querySelector('#btn-rotate-right').onclick = () => {
			this.canvas.rotate(DEFAULT_MOVEMENT);
		};


		//flip image
		this.el.querySelector('#btn-flip').onclick = () => {
			this.canvas.flip();
		};
		this.el.querySelector('#small-btn-flip').onclick = () => {
			this.canvas.flip();
		};


		// reset image
		this.el.querySelector('#btn-reset').onclick = () => {
			this.canvas.reset();
		};
		this.el.querySelector('#small-btn-reset').onclick = () => {
			this.canvas.reset();
		};


		const  rangeControl = this.el.querySelector('#scale-control');
		const RANGE_STEP = 5;
		let rangeValue = +rangeControl.value;
		"input change".split(" ").forEach( eventName => {
			rangeControl.addEventListener(eventName, e => {
				scale(+e.target.value);
			},false);
		});

		//scale image
		this.el.querySelector('#btn-scale-decrease').onclick = () => {
			scale( rangeValue - RANGE_STEP);
		};

		this.el.querySelector('#btn-scale-increase').onclick = () => {
			scale( rangeValue + RANGE_STEP);
		};

		const scale = (val) => {
			if (val <= +rangeControl.min || val >= +rangeControl.max) {
				return;
			}

			this.canvas.scale(val / rangeValue);
			rangeValue = val;
			rangeControl.value = rangeValue;
		};




		//show gallery
		this.el.querySelector('#small-btn-gallery').onclick = () => {


			const closeGalleryView = () => {
				this.el.classList.remove('invisible');
				this.parentElement.removeChild(gallery.el);
			};

			this.el.classList.add('invisible');
			const gallery = new Gallery(this.parentElement, {onClose: () => closeGalleryView(), onSelectImage : id => {
					closeGalleryView();
					this.changeImage(id);
				}});
		};




		this.btnNext.onclick = () => {
			this.hideDesignerView();
			this.showPreview();
		};


		const featuresButtonsContainer = this.el.querySelector('.features-buttons-container');


		const toolsButton = this.el.querySelector('#btn-tools');

		if (!AppSettings.isFacebookEnabled()
			&& !AppSettings.isDoodleEnabled()
			&& !AppSettings.isClipArtEnabled()
			&& !AppSettings.isTextViewEnabled()
			&& !AppSettings.isSpecialEffectsEnabled()
			&& !AppSettings.isLogoViewEnabled()) {
			 this.el.removeChild(toolsButton);
		} else {
			toolsButton.onclick = () => {
				featuresButtonsContainer.classList.toggle('features-active');
				this.hideAllFeatures();
			};
		}


		//TODO  remove 1 || - ued  only for testing purpose

		const facebookButton = this.parentElement.querySelector('#facebook');
		if (1 || AppSettings.isFacebookEnabled()) {
			//facebook redirect

			facebookButton.onclick = () => {
				facebookAuth(AppSettings.designerSettings.FacebookAppId);
			};

		} else {
			featuresButtonsContainer.removeChild(facebookButton);
		}


		const filtersButton = this.el.querySelector('#btn-filters');
		if (1 ||AppSettings.isSpecialEffectsEnabled()) {
			filtersButton.onclick =  () =>  this.showFilters();
		} else {
			featuresButtonsContainer.removeChild(filtersButton);
		}


		const clipartsButton = this.el.querySelector('#btn-emoji');
		if (1 ||AppSettings.isClipArtEnabled()) {
			clipartsButton.onclick = () => this.showClipArts();
		} else {
			featuresButtonsContainer.removeChild(clipartsButton);
		}


		const textButton = this.el.querySelector('#btn-text');
		if (1 ||AppSettings.isTextViewEnabled()) {
			textButton.onclick = () => this.showTextFeature();
		} else {
			featuresButtonsContainer.removeChild(textButton);
		}

		const doodleButton = this.el.querySelector('#btn-doodle');
		if (1 ||AppSettings.isDoodleEnabled()) {
			doodleButton.onclick = () => this.showDoodleFeature();
		} else {
			featuresButtonsContainer.removeChild(doodleButton);
		}


		const logoButton = this.el.querySelector('#btn-logo');
		if (1 ||AppSettings.isLogoViewEnabled()) {
			logoButton.onclick = () => this.showLogoFeature();
		} else {
			featuresButtonsContainer.removeChild(logoButton);
		}


	}

	async renderFilters(filterIntensity, cb) {
		const obj = this.canvas.card;

		const effectList = this.el.querySelector('.effect-list');
		clearElement(effectList);

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


		const effects = await getSpecialEffects();
		if (effects) {
			let loadedEffects = 0;
			effects.process(obj.image, filterIntensity, (res) => {
				const img = new Image();
				img.src = res.image;

				img.className = 'special-effect';
				img.id = res.effect.id;
				img.setAttribute('data-effect-name', res.effect.name);
				img.onclick = (e) => {

					const effectName = e.target.getAttribute('data-effect-name');
					obj.setSpecialEffect(effectName,filterIntensity, e.target.src);
				};

				effectList.appendChild(img);
				loadedEffects++;

				if (loadedEffects === effects.effects.length) {
					cb();
				}

			});

		}




	}



	submit () {
		this.canvas.submit();

	}


	showDesignerView() {
		this.el.classList.remove('invisible');
	}


	hideDesignerView() {
		this.el.classList.add('invisible');
	}





}

export default Designer;


// todo extract toolbar as a component
// todo add breakframe functionality
// todo move routing into MainContainer
// todo improve speed of special effects rendering (use already displayed images in refresh)
// todo realtime image check
// todo  apitracker
// todo add environment configuration