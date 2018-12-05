import AppSettings from '../AppSettings';

const CLIPART_IMAGE_TYPE = 'Clip Art';
const STANDARD_IMAGE_TYPE = 'Standard';

import * as api from '../../core/net/api';
import {GALLERY_LOADED} from '../../core/eventTypes';

let singletonInstance = null;

class  GalleryManager {


	constructor () {
		if (!singletonInstance) {
			// If null, set singletonInstance to this Class
			singletonInstance = this;
			this.isClipArtEnabled = false;
		}

		return singletonInstance;
	}


	loadGalleries(galleryUrl) {

		return new Promise( (resolve, reject) => {

			api.getDataByUrl(galleryUrl).then( data => {
				if (!data) {
					return;
				}

				let count = 0;

				this.galleries = data;


				for(const gallery of this.galleries) {

					if (gallery.ImageType === CLIPART_IMAGE_TYPE) {
						this.isClipArtEnabled = true;
					}

					api.getDataByUrl(gallery.Url).then(data => {
						gallery.images = data.Images;
						console.log(gallery);

						count++;


						if (count === this.galleries.length) {
							// all galleries has been loaded
							if (!this.selectedGalleryId) {
								const  standartGalleries = this.getStandardImages();
								if (standartGalleries.length > 0) {
									this.selectedGalleryId = standartGalleries[0].Id;
								}
							}
							console.log('galleries', this.galleries);

							resolve();
						}
					});
				}

			});

		});

	}


	hasCliparts(){
		return this.isClipArtEnabled;
	}


	getClipArts() {
		return this.galleries.filter( el => el.ImageType === CLIPART_IMAGE_TYPE);
	};

	getStandardImages() {
		return this.galleries.filter( el => el.ImageType === STANDARD_IMAGE_TYPE);
	};

	getSelectedGallery() {
		let images = [];
		if (this.selectedGalleryId) {

			// find selected gallery
			const selectedGallery = this.galleries.find( el => el.Id === this.selectedGalleryId);
			if (selectedGallery) {
				images  = selectedGallery.images;
				if (selectedGallery.Locked) {
					images.forEach( img => img.Locked = true);
				}
			}
		}
		return images;
	}


	getImageById(id) {
		let image = null;
		for (const gallery of this.galleries) {
			image = gallery.images.find( img => {
				return img.Id === id
			});
			if (image) {
				break;
			}
		}

		return image;
	}


	addCustomImage( imageId, imageUrl) {

		// check if custom gallery exists
		let customGallery = this.galleries.find( gallery => gallery.id === 0);
		if (!customGallery) {
			customGallery = {Id: 1, Locked: false, Name: AppSettings.Language.myImages, images:[], ImageType :STANDARD_IMAGE_TYPE};
			this.galleries.unshift(customGallery);
		}

		customGallery.images.push( {Id: imageId, LargeImage: imageUrl, Locked: false} );
		this.selectedGalleryId = 0;

	}

}


export default  GalleryManager;