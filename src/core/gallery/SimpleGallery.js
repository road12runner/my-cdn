/**
 * Simple Gallery container - render list of images
 * input parameters:
 * el - parent container where images displayed
 * options:
 *  - imageClassName:  class name for each button - 'gallery-image' is default
 *  - onImageSelected: callback when button is clicked - return  image id
 *  - imageType: identifies which url  to be displayed: Large, Review etc
 *  - dragable: tells if image can be dragged
 */

import {clearElement} from '../utils';

class SimpleGallery {

	constructor (el, options = {}) {
		this.options = options;
		this.el = el;
		this.imageClassName = options.imageClassName || 'gallery-image';
		this.onImageSelected = options.onImageSelected || function () {};
		this.imageType = options.imageType || 'Review';
		this.dragable = options.dragable;

		if (options.images) {
			this.loadImages(options.images);
		}

	}

	loadImages (images) {
		clearElement(this.el);

		const length = this.options.maxSize ? Math.min(options.maxSize, images.length) : images.length;

		for (const image of images) {

			const img  = new Image();
			img.setAttribute('role', 'button');
			img.setAttribute('tabIndex', 0);
			img.setAttribute('id', image.Id);
			img.setAttribute('data-image-locked', image.Locked);
			img.classList.add(this.imageClassName);

			if (this.dragable) {
				img.setAttribute('draggable', true);
				img.addEventListener('dragstart', e => {
					const data = {
						id: e.target.id,
						url: e.target.src
					};
					e.dataTransfer.setData('text', JSON.stringify(data));
				});
			}

			if (image.Name) {
				img.setAttribute('alt', image.Name);
			}

			const imageUrl = (this.imageType === 'Large') ? image.LargeImage : image.ReviewImage || image.LargeImage;
			img.src = imageUrl;
			img.addEventListener('click', e => {
				this.onImageSelected(e.target.id);
			});
			img.addEventListener('keydown', e => {
					if (e && (e.key === 'Enter' || e.key === ' ')) {
					// trigger by enter or space
					this.onImageSelected(e.target.id);
				}
			});

			this.el.appendChild(img);
		}
	};
}



export default SimpleGallery;