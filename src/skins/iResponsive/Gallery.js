import template from './templates/gallery.tmpl';

import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';
import Dropdown  from '../../core/gallery/Dropdown';
import localize from   '../../core/localize';

import AppSettings from '../../core/AppSettings';


export default class Gallery {
	constructor (parentElement, options = {}) {

		this.parentElement = parentElement;

		this.renderedTemplate = template;


		this.el = document.createElement('div');
		this.el.className= 'gallery';
		this.el.innerHTML = this.renderedTemplate;


		//TODO improve adding gallery
		const designer = this.parentElement.querySelector('.designer');
		this.parentElement.insertBefore(this.el, designer);

		this.galleryManager = new GalleryManager();


		this.showGalleries();

		localize(this.el, AppSettings.Language);

		this.onClose = options.onClose || (() => {});
		this.onSelectImage = options.onSelectImage || (() => {});

		this.el.querySelector('#btn-back').onclick = () => {
			// return back
			this.onClose();
		};
	}

	showGalleries() {

		const onGalleryImageSelected = (id) => {
			//console.log('selected image', id);
			const image = this.galleryManager.getSelectedGallery().find( item => item.Id === +id);
			this.onSelectImage(image.Id);
		};
		const galleryContainer = this.el.querySelector('.gallery--container');

		const gallery = new SimpleGallery(galleryContainer, {
			showImageAsChild: true,
			dragable: true,
			onImageSelected: id => onGalleryImageSelected(id)
		});

		const gallerySelector = this.el.querySelector('#gallery-selector');
		const galleries = this.galleryManager.getStandardImages().map( gallery => ({id: gallery.Id, name: gallery.Name}));
		const selector = new Dropdown(gallerySelector, galleries, {onItemSelected : (id)=> {
				this.galleryManager.selectedGalleryId = id;
				gallery.loadImages( this.galleryManager.getSelectedGallery());
			}});

	}


}

