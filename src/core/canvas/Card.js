import CanvasObject from './CanvasObject';
import { roundRect, isInside } from './canvas-helper';
import {CANVAS_ACTIONS} from './canvasActionTypes';
class Card  extends  CanvasObject{
	constructor (options = {}) {
		super();

		this.template = options.templateSize || {x: 0, y: 0, height: 153, width: 241};
		if (options.scale) {
			const ratio = this.template.width / this.template.height;
			this.template.width *= options.scale;
			this.template.height *= ratio;
		}

		this.originPoint = options.canvasCenter;
		this.imageOpacity = options.imageOpacity || 0.4;
		this.template.x = this.originPoint.x - this.template.width / 2;
		this.template.y = this.originPoint.y - this.template.height / 2;
		this.action = CANVAS_ACTIONS.NOTHING;

		this.width = this.template.width + 40;
		this.height = this.template.height + 40;

		const templateImage = new Image();
		templateImage.crossOrigin = 'Anonymous';
		templateImage.src = options.templateUrl;
		templateImage.onload = () => {
			this.template.loaded = true;
			this.template.image = templateImage;

			console.log(this.template);

		};



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
		if (!this.imageLoaded || !this.template.loaded) {
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



		}


		ctx.restore();
		ctx.save();

		ctx.beginPath();


		roundRect(ctx, this.template.x, this.template.y, this.template.width, this.template.height);
		ctx.clip();

		ctx.translate(this.originPoint.x, this.originPoint.y);

		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}

		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();

		ctx.drawImage(this.template.image, this.template.x, this.template.y, this.template.width, this.template.height);

		if (this.mousePos) {
			ctx.beginPath();
			ctx.arc(this.mousePos.x, this.mousePos.y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.stroke();
		}

		if (this.originPoint) {
			ctx.beginPath();
			ctx.arc(this.originPoint.x, this.originPoint.y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = 'pink';
			ctx.fill();
			ctx.stroke();
		}


	}






	testCoverage() {
		function getCoordinates (obj) {
			if (obj.getLeftTopCorner) {
				return {
					leftTop: obj.getLeftTopCorner(),
					rightTop: obj.getRightTopCorner(),
					leftBottom: obj.getLeftBottomCorner(),
					rightBottom: obj.getRightBottomCorner()
				};
			} else {
				return {
					leftTop: {x: obj.x, y: obj.y},
					rightTop: {x: obj.x + obj.width, y: obj.y},
					leftBottom: {x: obj.x, y: obj.y + obj.height},
					rightBottom: {x: obj.x + obj.width, y: obj.y + obj.height},
				};

			}
		}


		const innerPoints = getCoordinates(this.template);
		const outerPoints = getCoordinates(this);

		const result = innerPoints.leftTop.x >= outerPoints.leftTop.x
			&& innerPoints.leftTop.x <= outerPoints.rightTop.x
			&& innerPoints.rightTop.x >= outerPoints.leftTop.x
			&& innerPoints.rightTop.x <= outerPoints.rightTop.x
			&& innerPoints.leftTop.y >= outerPoints.leftTop.y
			&& innerPoints.leftTop.y <= outerPoints.leftBottom.y
			&& innerPoints.leftBottom.y >= outerPoints.leftTop.y
			&& innerPoints.leftBottom.y <= outerPoints.leftBottom.y;

		return result;
	}





}

export default Card;


//todo remove points for touch mode