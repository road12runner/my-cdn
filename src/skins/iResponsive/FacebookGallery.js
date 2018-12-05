import template from './templates/gallery.tmpl';

import GalleryManager from '../../core/gallery/GaleryManager';
import SimpleGallery from '../../core/gallery/SimpleGallery';
import Dropdown  from '../../core/gallery/Dropdown';
import localize from   '../../core/localize';

import AppSettings from '../../core/AppSettings';
import FacebookHelper from '../../core/net/FacebookHelper';
import Loader from './Loader';


export default class FacebookGallery {
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

		this.loader = new Loader(this.el);

		this.showGalleries();


		localize(this.el, AppSettings.Language);


		this.onClose = options.onClose || (() => {});
		this.onSelectImage = options.onSelectImage || (() => {});


		this.el.querySelector('#btn-back').onclick = () => {
			this.parentElement.removeChild(this.el);
			// return back
			this.onClose();
		};
	}


	showError() {

		const errorMsg = document.createElement('div');
		errorMsg.className = 'error-container';
		errorMsg.innerText = AppSettings.Language.facebookGalleryWarning;
		this.el.appendChild(errorMsg);
	}

	async showGalleries() {

		this.loader.show();
		const facebookHelper = new FacebookHelper();

		try {
			this.faceBookAlbums = await facebookHelper.getImages();
		} catch (err) {
			this.loader.hide();
			this.showError();
		}

		this.faceBookAlbums.forEach( (album, idx) => {
			album.Id = idx;
		});


		this.loader.hide();


		const onGalleryImageSelected = (id) => {
			this.parentElement.removeChild(this.el);

			const album = this.faceBookAlbums.find( album => album.Id === this.selectedFacebookAlbumId);
			if (album) {
				const image = album.images.find( image => image.Id === id);
				if (image) {
					this.onSelectImage(image.LargeImage);
				}
			}
		};

		const galleryContainer = this.el.querySelector('.gallery--container');

		const gallery = new SimpleGallery(galleryContainer, {
			showImageAsChild: true,
			dragable: true,
			onImageSelected: id => onGalleryImageSelected(id)
		});

		const gallerySelector = this.el.querySelector('#gallery-selector');
		const galleries = this.faceBookAlbums.map( gallery => ({id: gallery.Id, name: gallery.Name}));
		const selector = new Dropdown(gallerySelector, galleries, {onItemSelected : (id)=> {
				this.selectedFacebookAlbumId = id;
				const images = (this.faceBookAlbums.find( album => album.Id === id).images || []).filter( image => image !== undefined);
				gallery.loadImages(images);

			}});
	}


}

