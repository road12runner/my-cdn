import { roundRect } from './canvas-helper';

class Card {
	constructor (options = {}) {

		this.templateSize = options.templateSize || {x: 0, y: 0, height: 153, width: 241};
		if (options.scale) {
			const ratio = this.templateSize.width / this.templateSize.height;
			this.templateSize.width *= options.scale;
			this.templateSize.height *= ratio;
		}

		this.originPoint = options.canvasCenter;
		this.imageOpacity = options.imageOpacity || 0.4;
		this.templateSize.x = this.originPoint.x - this.templateSize.width / 2;
		this.templateSize.y = this.originPoint.y - this.templateSize.height / 2;

		this.imageSize = options.imagesSize || {
			x: this.templateSize.x - 20,
			y: this.templateSize.y - 20,
			width: this.templateSize.width + 40,
			height: this.templateSize.height + 40
		};

		this.width = this.templateSize.width + 40;
		this.height = this.templateSize.height + 40;

		this.template = new Image();
		this.template.crossOrigin = 'Anonymous';
		this.template.src = options.templateUrl;
		this.template.onload = () => {
			this.templateLoaded = true;
		};

		this.hoverCorners = {
			leftTop: false,
			rightTop: false,
			leftBottom: false,
			rightBottom: false,
			rotatePoint: false
		};

		console.log('template', this.templateSize);

		this.locked = false;
		this.selected = true;
		this.imageLoaded = false;
		this.rotation = 0;
		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

	}

	setImage (url) {
		this.img = new Image();
		this.img.crossOrigin = 'Anonymous';
		this.img.src = url;
		this.img.onload = () => {
			this.imageLoaded = true;
		};
	}

	render (ctx) {
		if (!this.imageLoaded && !this.templateLoaded) {
			return;
		}

		ctx.save();
		ctx.translate(this.originPoint.x, this.originPoint.y);
		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}

		// draw image with opacity
		ctx.globalAlpha = this.imageOpacity;
		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.globalAlpha = 1;


		if (this.selected && !this.locked) {
			// draw border
			ctx.strokeStyle = this.borderColor;
			roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 2);

			// draw left top corner

			ctx.beginPath();
			ctx.arc(-this.width / 2, -this.height / 2, 5, 0, 2 * Math.PI);
			ctx.fillStyle = this.hoverCorners.leftTop ? this.borderColor : 'white';
			ctx.fill();
			ctx.stroke();

			// draw right top corner
			ctx.beginPath();
			ctx.arc(this.width / 2, -this.height / 2, 5, 0, 2 * Math.PI);
			ctx.fillStyle = this.hoverCorners.rightTop ? this.borderColor : 'white';
			ctx.fill();
			ctx.stroke();

			//draw left bottom corner
			ctx.beginPath();
			ctx.fillStyle = this.hoverCorners.leftBottom ? this.borderColor : 'white';
			ctx.arc(-this.width / 2, this.height / 2, 5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();

			//draw right bottom corner
			ctx.beginPath();
			ctx.arc(this.width / 2, this.height / 2, 5, 0, 2 * Math.PI);
			ctx.fillStyle = this.hoverCorners.rightBottom ? this.borderColor : 'white';
			ctx.fill();
			ctx.stroke();

			// //draw rotation point
			// ctx.beginPath();
			// ctx.moveTo(0, -this.height / 2);
			// ctx.lineTo(0, -this.height / 2 - 30);
			// ctx.stroke();
			//
			// ctx.beginPath();
			// ctx.arc(0, -this.height / 2 - 30, 5, 0, 2 * Math.PI);
			// ctx.fillStyle = this.hoverCorners.rotatePoint ? this.borderColor : 'white';
			// ctx.fill();
			// ctx.stroke();

		}


		ctx.restore();

		//draw card template
		ctx.drawImage(this.template, this.templateSize.x, this.templateSize.y, this.templateSize.width, this.templateSize.height);
		roundRect(ctx, this.templateSize.x, this.templateSize.y, this.templateSize.width, this.templateSize.height);

	}

}

export default Card;