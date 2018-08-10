import CanvasObject from './CanvasObject';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';


class CardItem  extends CanvasObject{
	constructor(id, url, options = {}) {
		super();



		this.coverageArea = options.coverageArea;
		this.templateArea = options.templateArea;
		this.layerType = 'StockImageLayer';


		this.id = id;

		const bleeding = options.bleeding || 5;

		if (options.config) {


			if (options.preview) {
				// adjust size and position for preview

				// get scale
				const previewScaleX = options.templateArea.width / options.config.cardTemplateArea.width;
				const previewScaleY = options.templateArea.height / options.config.cardTemplateArea.height;
				const offsetX = options.config.cardTemplateArea.x;
				const offsetY = options.config.cardTemplateArea.y;


				this.originPoint = {
					x: (options.config.originPoint.x  - offsetX) * previewScaleX,
					y: (options.config.originPoint.y  - offsetY) * previewScaleY,
				};

				this.width = options.config.width * previewScaleX;
				this.height = options.config.height * previewScaleY;


			} else {

				this.originPoint = options.config.originPoint;
				this.width = options.config.width;
				this.height = options.config.height;

				this.testCoverage();

			}

			// const ratio = options.config.template.width / options.config.template.height;
			// const offsetX = options.config.template.x;
			// const offsetY = options.config.template.y;
			//
			// const previewScaleX =  this.template.width / options.config.template.width;
			// const previewScaleY =  this.template.height / options.config.template.height;
			//
			// this.width = options.config.width * previewScaleX;
			// this.height = options.config.height * previewScaleY;




			this.flip = options.config.flip;
			this.rotation = options.config.rotation;


			this.img =  options.config.image;
			this.imageLoaded = true;
			//this.setImage(options.config.imageUrl);


		} else {
			this.width = options.width || 50;
			this.height = options.height = 50;

			this.originPoint = options.initialPosition || {
				x: this.coverageArea.x + this.width /2 + bleeding,
				y: this.coverageArea.y + this.height /2 + bleeding,
			} ;
			this.selected = true;
			this.rotation = 0;

			this.setImage(url);
			this.testCoverage();

		}



		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;




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
		};
	}


	render(ctx) {
		if (!this.imageLoaded) {
			return;
		}

		// show item coverage area
		if (this.selected) {
			roundRect(ctx, this.coverageArea.x, this.coverageArea.y, this.coverageArea.width, this.coverageArea.height, 2);
		}

		ctx.save();
		ctx.translate(this.originPoint.x, this.originPoint.y);
		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}

		if (this.selected && !this.preview) {
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
				ctx.translate( x, y);
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


		// if (this.removed) {
		// 	ctx.save();
		// 	ctx.translate(this.originPoint.x, this.originPoint.y);
		//
		// 	if (this.rotation !== 0) {
		// 		ctx.rotate(this.rotation * Math.PI / 180);
		// 	}
		//
		// 	ctx.beginPath();
		// 	//ctx.fillStyle = 'rgba(255,0,0, .9)';
		// 	ctx.fillStyle = 'rgba(200,200,200, 1)';
		// 	ctx.lineWidth = 2;
		//
		// 	// ctx.moveTo( - this.width /2, -this.height /2);
		// 	// ctx.lineTo( this.width /2, this.height /2);
		// 	//
		// 	// ctx.moveTo( - this.width /2, this.height /2);
		// 	// ctx.lineTo( this.width /2, -this.height /2);
		//
		// 	ctx.arc(-this.width /2 , -this.height/2 , 10, 0, 2 * Math.PI);
		// 	ctx.fill();
		//
		// 	ctx.beginPath();
		// 	ctx.strokeStyle = 'rgba(0,0,0, 1)';
		//
		// 	const x =  - this.width /2;
		// 	const y = - this.height /2;
		//
		// 	ctx.moveTo(  x - 4, y -4);
		// 	ctx.lineTo(  x + 4, y + 4);
		//
		//
		// 	ctx.moveTo(  x + 4, y - 4);
		// 	ctx.lineTo(  x - 4, y + 4);
		//
		//
		// 	ctx.stroke();
		// 	ctx.restore();
		// }

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


}
export default CardItem;