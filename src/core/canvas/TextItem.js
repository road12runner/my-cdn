import CanvasObject from './CanvasObject';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';


class TextItem  extends CanvasObject{
	constructor(id, text, ctx, options = {}) {
		super();



		this.coverageArea = options.coverageArea;
		this.templateArea = options.templateArea;
		this.layerType = 'TextLayer';


		this.fontStyle = options.fontStyle || {
			name: 'Comic Sans MS',
			height: 30,
			color: 'red'
		};

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

			this.flip = options.config.flip;
			this.rotation = options.config.rotation;


			this.img =  options.config.image;
			this.imageLoaded = true;
			//this.setImage(options.config.imageUrl);


		} else {
			this.width = options.width || 50;
			this.height = options.height || 50;

			this.originPoint = options.initialPosition || {
				x: this.coverageArea.x + this.width /2 + bleeding,
				y: this.coverageArea.y + this.height /2 + bleeding,
			} ;
			this.selected = true;
			this.rotation = 0;

			this.setText(text);
			this.testCoverage();

		}


		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;


		this.removedIcon = new Image();
		this.removedIcon.src = RedCros;
		this.removedIcon.onload = () => {
			this.removedIconLoaded = true;
		};



		this.width = options.width || options.coverageArea.width;
		this.adjustFontHeightToWidth(this.width, ctx);

		// this.setCanvasFont(ctx);
		// const width = ctx.measureText(this.text).width;
		// console.log(width);
		// this.width = width;
		// this.testCoverage();
	}


	setCanvasFont(ctx, fontStyle) {
		const {height, name, color} = fontStyle;
		ctx.font = `${height}px ${name}`;
		ctx.fillStyle = color;
		ctx.textAlign = "center";

	}

	adjustFontHeightToWidth(width, ctx) {

		for( let  height = this.fontStyle.height; height > 0; height -= 0.1) {
			const fontStyle = {
				name: this.fontStyle.name,
				height
			};
			this.setCanvasFont(ctx, fontStyle);
			const textWidth = ctx.measureText(this.text).width;
			console.log('textWidth', textWidth);
			if (textWidth <= width) {
				this.fontStyle.height = height;
				console.log('width', width);
				break;
			}
		}

	}


	setText (text) {
		this.text = text;
	}


	render(ctx) {
		if (!this.text) {
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


		this.setCanvasFont(ctx, this.fontStyle);
		ctx.fillText(this.text,  0, (this.height  - this.fontStyle.height) / 2);


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


}
export default TextItem;