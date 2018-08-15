import CanvasObject from './CanvasObject';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';


class ImageItem  extends CanvasObject{
	constructor(id, url, options = {}) {
		super();


		this.coverageArea = options.coverageArea;
		this.templateArea = options.templateArea;
		this.canvasCenter  = options.canvasCenter;
		this.width = options.width || 50;
		this.height = options.height || 50;

		this.layerType = 'StockImageLayer';

		this.id = id;

		const bleeding = options.bleeding || 5;

		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;

		this.setImage(url);

		this.removedIcon = new Image();
		this.removedIcon.src = RedCros;
		this.removedIcon.onload = () => {
			this.removedIconLoaded = true;
		}



	}

	setImage (url) {
		this.img = new Image();
		this.img.crossOrigin = 'Anonymous';
		this.img.src = url;
		this.img.onload = () => {
			this.imageLoaded = true;
			this.selected = true;
			this.originPoint= {
				x: this.coverageArea.x + this.width / 2,
				y: this.coverageArea.y + this.height / 2
			}
		};
	}


	render(ctx) {
		if (!this.imageLoaded) {
			return;
		}

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width /2,
			y: height /2
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

		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();




		if (this.removed ) {

			if (this.removedIconLoaded) {
				ctx.save();

				const {x, y} = this.originPoint;
				ctx.translate( x + this.canvasCenter.x, y + this.canvasCenter.y);
				if (this.rotation !== 0) {
					ctx.rotate(this.rotation * Math.PI / 180);
				}

				ctx.fillStyle = 'rgba(200,200,200, 1)';
				ctx.arc(-this.width /2 , -this.height/2 , 10, 0, 2 * Math.PI);
				ctx.fill();



				ctx.drawImage(this.removedIcon,  -this.width /2 - 5 ,  -this.height /2 - 5,   10,  10);

				ctx.restore();
			}



		}

	}






	hitTest(pos) {
		return ( pos.x >=  this.originPoint.x - this.width /2
			&& pos.x <= this.originPoint.x + this.width /2
			&& pos.y >= this.originPoint.y - this.height /2
			&& pos.y <= this.originPoint.y + this.height /2)
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
		this.errorCoverage =  !allInside(vertices, this.coverageArea);


		this.removed = this.originPoint.x + this.width /2 < this.templateArea.x - 5
			|| this.originPoint.x - this.width /2 > this.templateArea.x + this.templateArea.width +5
			|| this.originPoint.y + this.height /2 < this.templateArea.y -5
			|| this.originPoint.y - this.height /2 > this.templateArea.y + this.templateArea.height +5;

		return this.errorCoverage;
	}


	getConfiguration(){
		const config = super.getConfiguration();
		config.image = this.img;
		return config;
	}


	handleResize(scale) {
		const ratio = this.width / this.height;
		this.width *= scale;
		this.height = this.width / ratio;

		this.originPoint = {
			x : this.originPoint.x * scale,
			y : this.originPoint.y * scale
		};


		this.coverageArea.x  *= scale;
		this.coverageArea.y  *= scale;
		this.coverageArea.width *= scale;
		this.coverageArea.height *= scale;

	}

	static preview(itemObject, scale, ctx) {

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width /2,
			y: height /2
		};

		const item = {
			img : itemObject.img,
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

		ctx.drawImage(item.img, -item.width / 2, -item.height / 2, item.width, item.height);
		ctx.restore();

	}

}
export default ImageItem;