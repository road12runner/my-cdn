import CanvasObject from './CanvasObject';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';

class ImageItem extends CanvasObject {
	constructor (ctx, image, options = {}) {
		super();
		this.ctx = ctx;

		this.coverageArea = options.coverageArea;
		this.allowedArea = options.allowedArea;

		this.width = options.width || 50;
		this.height = options.height || 50;

		this.layerType = 'StockImageLayer';

		this.id = image.id;

		const bleeding = options.bleeding || 5;

		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;

		this.setImage(image.url);

		// remove icon (red cross shown when item mouved out from allowedArea)
		const removedIcon = new Image();
		removedIcon.src = RedCros;
		removedIcon.onload = () => {
			this.removedIcon = removedIcon;
		};

	}

	setImage (url) {
		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.src = url;
		img.onload = () => {
			this.image = img;
			this.selected = true;
			this.originPoint = {
				x: this.coverageArea.x + this.width / 2,
				y: this.coverageArea.y + this.height / 2
			};
		};
	}

	render (ctx) {
		if (!this.image) {
			return;
		}

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width / 2,
			y: height / 2
		};

		// show item coverage area
		if (this.selected) {
			ctx.save();
			ctx.translate(canvasCenter.x, canvasCenter.y);
			roundRect(ctx, this.coverageArea.x, this.coverageArea.y, this.coverageArea.width, this.coverageArea.height, 2);
			ctx.restore();
		}

		ctx.save();
		ctx.translate(this.originPoint.x + canvasCenter.x, this.originPoint.y + canvasCenter.y);
		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}

		if (this.selected) {
			ctx.strokeStyle = this.borderColor;

			// show coverage area
			roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 2);

			// show border of item
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

		}

		if (this.flipped) {
			ctx.scale(-1, 1);
		}

		ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);

		if (this.flipped) {
			ctx.scale(-1, 1);
		}


		ctx.restore();

		if (this.removed && this.removedIcon) {

			ctx.save();

			const {x, y} = this.originPoint;
			ctx.translate(x + canvasCenter.x, y + canvasCenter.y);
			if (this.rotation !== 0) {
				ctx.rotate(this.rotation * Math.PI / 180);
			}

			ctx.beginPath();
			ctx.fillStyle = 'rgba(100,100,100, 1)';
			ctx.arc(-this.width / 2, -this.height / 2, 10, 0, 2 * Math.PI);
			ctx.fill();

			ctx.drawImage(this.removedIcon, -this.width / 2 - 5, -this.height / 2 - 5, 10, 10);

			ctx.restore();
		}

	}

	hitTest (pos) {
		return (pos.x >= this.originPoint.x - this.width / 2
			&& pos.x <= this.originPoint.x + this.width / 2
			&& pos.y >= this.originPoint.y - this.height / 2
			&& pos.y <= this.originPoint.y + this.height / 2)
			|| (this.hoverCorners.leftTop
				|| this.hoverCorners.leftBottom
				|| this.hoverCorners.rightTop
				|| this.hoverCorners.rightBottom
				|| this.hoverCorners.rotatePoint
			);

	}

	testCoverage () {
		const vertices = [this.getLeftBottomCorner(),
			this.getRightTopCorner(),
			this.getLeftTopCorner(),
			this.getRightBottomCorner()];
		this.errorCoverage = !allInside(vertices, this.coverageArea);

		const OFFSET = 5;
		this.removed = this.originPoint.x + this.width / 2 < this.allowedArea.x - OFFSET
			|| this.originPoint.x - this.width / 2 > this.allowedArea.x + this.allowedArea.width + OFFSET
			|| this.originPoint.y + this.height / 2 < this.allowedArea.y - OFFSET
			|| this.originPoint.y - this.height / 2 > this.allowedArea.y + this.allowedArea.height + OFFSET;

		return this.errorCoverage;
	}

	// getConfiguration () {
	// 	const config = super.getConfiguration();
	// 	config.image = this.img;
	// 	return config;
	// }

	handleResize (scale) {
		const ratio = this.width / this.height;
		this.width *= scale;
		this.height = this.width / ratio;

		this.originPoint = {
			x: this.originPoint.x * scale,
			y: this.originPoint.y * scale
		};

		this.coverageArea.x *= scale;
		this.coverageArea.y *= scale;
		this.coverageArea.width *= scale;
		this.coverageArea.height *= scale;

	}

	static preview (itemObject, scale, ctx) {

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width / 2,
			y: height / 2
		};

		const item = {
			image: itemObject.image,
			width: itemObject.width * scale.width,
			height: itemObject.height * scale.height,
			rotation: itemObject.rotation,
			flipped: itemObject.flipped,
			originPoint: {
				x: itemObject.originPoint.x * scale.width,
				y: itemObject.originPoint.y * scale.height
			}
		};

		ctx.save();
		ctx.translate(item.originPoint.x + canvasCenter.x, item.originPoint.y + canvasCenter.y);
		if (item.rotation !== 0) {
			ctx.rotate(item.rotation * Math.PI / 180);
		}

		if (item.flipped) {
			ctx.scale(-1, 1);
		}

		ctx.drawImage(item.image, -item.width / 2, -item.height / 2, item.width, item.height);
		ctx.restore();

	}

}

export default ImageItem;