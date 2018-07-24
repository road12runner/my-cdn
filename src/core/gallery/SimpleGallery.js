/**
 * Simple Gallery container - render list of buttons contain images
 * input parameters:
 * el - parent container where images displayed
 * options:
 *  - imageClassName:  class name for each button - 'gallery-image' is default
 *  - onImageSelected: callback when button is clicked - return  image id
 *  - imageType: identifies which url  to be displayed: Large, Review etc
 *  - showImageAsChild: show image as a child of button, otherwise  it's shown as button background
 *  - dragable: tells if image can be dragged. Works only with  showImageAsChild option
 */
class SimpleGallery {

	constructor (el, options = {}) {
		this.options = options;
		this.el = el;
		this.imageClassName = options.imageClassName || 'gallery-image';
		this.onImageSelected = options.onImageSelected || function () {};
		this.imageType = options.imageType || 'Review';
		this.showImageAsChild = options.showImageAsChild;
		this.dragable = options.dragable;

		if (options.images) {
			this.loadImages(options.images);
		}

	}

	loadImages (images) {
		this.clear(this.el);

		const length = this.options.maxSize ? Math.min(options.maxSize, images.length) : images.length;

		for (const image of images) {
			const button = document.createElement('button');
			button.className = this.imageClassName;
			button.setAttribute('id', image.Id);
			button.setAttribute('data-image-locked', image.Locked);


			if (image.Name) {
				button.setAttribute('title', image.Name);
				button.setAttribute('aria-label', image.Name);
			}

			const imageUrl = (this.imageType === 'Large') ? image.LargeImage : image.ReviewImage || image.LargeImage;
			if (this.showImageAsChild) {
				button.innerHTML = '<div class="clipart-loading"></div>';
				// put image inside of button
				this.loadImage(button, imageUrl);
				button.addEventListener('click', e => {
					this.onImageSelected(e.currentTarget.id);
				});

			} else {
				// show image as button background
				button.style.backgroundImage = `url(${imageUrl})`;
				button.addEventListener('click', e => {
					this.onImageSelected(e.target.id);
				});
			}

			button.addEventListener('keydown', e => {
					if (e && (e.key === 'Enter' || e.key === ' ')) {
					// trigger by enter or space
					this.onImageSelected(e.target.id);
				}
			});

			this.el.appendChild(button);

		}
	};

	loadImage (button, imageUrl) {
		const img = new Image();
		img.src = imageUrl;
		if (this.dragable) {
			img.setAttribute('dragable', true);
			img.addEventListener('dragstart', e => {
				e.dataTransfer.setData("text", e.target.parentElement.id)
			});
		}

		img.onload = () => {
			this.clear(button);
			button.appendChild(img);
		}
	}

	clear (el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	}

}



export default SimpleGallery;