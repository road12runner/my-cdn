import * as facebookApi  from './facebookApi';
import AppSettings from '../AppSettings';


export default class FacebookHelper {

	constructor (options = {}) {
		this.maxSize = options.maxSize || {Height: 1000, Width: 10000};
		this.minSize = options.minSize || {Height: 672, Width: 1050};

		this.facebookCategories = [];
		this.onErrorHandler = options.onError || function (error) {};


		this.token = '';
		this.userId = '';


	}


	isEligibleImage (img) {
		return img.height < this.maxSize.Height && img.height > this.minSize.Height && img.width < this.maxSize.Width && img.width > this.minSize.Width;
	}


	async getFacebookUserId (data) {

		const result = await facebookApi.getFacebookUserId(data);
		console.log('getFacebookUserId', result);
		if (result) {
			return result;
		} else {
			this.onErrorHandler({error: 'failed to get user id'});
		}
	}


	async getFacebookUserPhotos (data) {

		const result = await facebookApi.getImages(data);
		console.log('getFacebookUserPhotos', result.paging);

		let userPhotos = this.findEligiblePhotos(result.data);
		if (result.paging.next) {
			const newPhotos = this.getNextPhotos(result.paging.next, []);
			userPhotos = userPhotos.concat(newPhotos.data);
		}
		return userPhotos;

	}

	async getNextPhotos (nextUrl, photosList) {

		const newPhotos = await facebookApi.getData(nextUrl);
		photosList = photosList.concat(this.findEligiblePhotos(newPhotos.data));
		if (newPhotos.paging.next) {
			this.getNextPhotos(newPhotos.paging.next, photosList);
		} else {
			return photosList;
		}

	}

	async getFacebookUserAlbums (fata) {
		return await  facebookApi.getCategories(data);
	}

	findEligiblePhotos (photos) {
		const result = [];
		if (photos && photos.length > 0) {

			for (let i = 0; i < photos.length; i++) {
				const eligibleImage = this.findEligibleImage(photos[i].images);
				if (eligibleImage) {
					result.push({Id: photos[i].id, LargeImage: eligibleImage.source});
				}

			}
		}
		return result;
	}

	findEligibleImage (images) {
		if (images && images.length > 0) {
			for (let i = 0; i < images.length; i++) {
				if (this.isEligibleImage(images[i])) {
					return images[i];
				}
			}
		}
	}


	async getImages() {
		let images = [];

		const token = AppSettings.FacebookData.token;
		let userId = AppSettings.FacebookData.id;

		userId = await this.getFacebookUserId({token, id: userId});
		console.log('new user id', userId);
		if (!userId) {
			return images;
		}

		const albums = await facebookApi.getCategories({userId, token});
		console.log('user albums', albums);
		if (albums && albums.data && albums.data.length > 0) {
			var count = 0;

			for (const album of albums.data) {
				const photos = await this.getFacebookUserPhotos({token, categoryId: album.id});

				if (photos.length > 0) {
					const fbAlbum = {
						Id: count,
						facebookAlbumId: album.id,
						Name: album.name,
						images: photos
					};
					images.push(fbAlbum);
					// facebookCategories.push(fbAlbum);
					// if (count === albums.data.length) {
					// 	cb(facebookCategories);
					// }
				}

			}

		}

		return images;
	}
}
// define(['jquery', 'models/ViewData'],
//
// 	function ($, viewData) {
//
//
//
//
// 		return function (App, opts, cb) {
//
//
//
//
//
//
// 			function init(cb) {
// 				_getFacebookUserId(fbData, function (fbUserCredentials) {
//
// 					// all albums
// 					_getFacebookUserAlbums(fbUserCredentials, function (albums) {
//
// 						if (albums && albums.data && albums.data.length > 0) {
// 							var count = 0;
// 							albums.data.forEach(function (album) {
//
// 								_getFacebookUserPhotos({token: fbData.token, id: album.id}, function (photos) {
// 									count++;
// 									if (photos.length > 0) {
// 										var fbAlbum = {
// 											Id: count,
// 											facebookAlbumId: album.id,
// 											Name: album.name,
// 											images: photos
// 										};
// 										facebookCategories.push(fbAlbum);
// 										if (count === albums.data.length) {
// 											cb(facebookCategories);
// 										}
// 									}
// 								});
// 							});
// 						}
// 					});
//
// 				}, function () {
// 					cb({});
// 				});
//
//
//
// 			}
//
// 			init(cb);
//
// 		};
//
// 	}
// );
//

