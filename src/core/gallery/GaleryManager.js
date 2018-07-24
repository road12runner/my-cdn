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
			this.selectedGalleryId = 814; //TODO fixed
		}

		return singletonInstance;
	}


	loadGalleries(galleryUrl) {


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
						const event = document.createEvent('Event');
						event.initEvent(GALLERY_LOADED, true, true);
						document.dispatchEvent(event);
					}

				});
			}

		})

	}


	hasCliparts(){
		return this.isClipArtEnabled;
	}


	getClipArts() {
		console.log(this.galleries);
		return this.galleries.filter( el => el.ImageType === CLIPART_IMAGE_TYPE);
	};


	// let imageCategories = [];
	// let selectedCategoryId = null;
	//
	// function init (cb) {
	//
	// 	_loadImageCategories(function () {
	// 			if (cb) {
	// 				cb();
	// 			}
	// 		}
	// 	);
	// }
	//
	// function _loadImageCategories (cb) {
	//
	// 	if (viewData.get('mode') === App.Modes.UploadOnly) {
	// 		return cb(imageCategories);
	// 	}
	//
	// 	if (imageCategories.length > 0) {
	// 		return cb(imageCategories);
	// 	}
	//
	// 	App.Designer.GetCategories(function (cats) {
	//
	// 		imageCategories = cats;
	//
	//
	// 		// check if clipart category exists
	// 		if (cats) {
	// 			let count = 0;
	// 			cats.forEach(function (category) {
	// 				category.GetCategory(function (data) {
	// 					count++;
	// 					category.images = data.Images;
	//
	// 					if (category.ImageType === CLIPART_IMAGE_TYPE) {
	// 						App.Designer.ClipArtEnabled = true;
	// 					}
	//
	// 					if (count === cats.length) {
	//
	// 						// find first standard gallery
	// 						if (!selectedCategoryId) {
	// 							let standardGalleries = _.filter(cats, {ImageType: STANDARD_IMAGE_TYPE, Knockout: false});
	// 							if (standardGalleries.length > 0) {
	// 								that.setSelectedCategory(standardGalleries[0].Id);
	// 							}
	// 						}
	//
	// 						cb(cats);
	// 					}
	// 				});
	// 			});
	// 		}
	// 	});
	// }
	//
	//
	// this.setSelectedCategory = function(id) {
	// 	selectedCategoryId = id;
	// };
	//
	// this.getSelectedCategory = function() {
	// 	return _.find(imageCategories, {Id: selectedCategoryId});
	// };
	//
	// this.getAllStandardCategories = function() {
	// 	return _.chain(imageCategories).filter({ImageType: STANDARD_IMAGE_TYPE, Knockout: false}).sortBy(function(c){
	// 		return c.Order;
	// 	}).value();
	// };
	//
	// this.getClipArtCategories = function() {
	// 	return _.chain(imageCategories).filter({ImageType: CLIPART_IMAGE_TYPE, Knockout: false}).sortBy(function(c){
	// 		return c.Order;
	// 	}).value();
	// };
	//
	// this.addCustomImage = function(id, name, url) {
	// 	var customCategory = _.find(imageCategories, {Id: -1});
	// 	if (!customCategory) {
	// 		customCategory = { Id: -1, Locked : false, Name: viewData.get('languageData').myImages, ImageType: STANDARD_IMAGE_TYPE, Knockout: false, Order: 100, images: []};
	// 		imageCategories.push(customCategory);
	// 	}
	// 	customCategory.images.push({Id: id, Name: name, LargeImage: url, Locked: false});
	// 	that.setSelectedCategory(-1);
	// };
	//
	//
	// init(cb);
	//
	// return this;
}


export default  GalleryManager;