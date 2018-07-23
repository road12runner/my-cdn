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

		this.hoverCorners = {
			leftTop: false,
			rightTop: false,
			leftBottom: false,
			rightBottom: false,
			rotatePoint: false
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

	}

	hover(pos) {
		if (!this.selected || this.locked) {
			return;
		}

		if (this.action === CANVAS_ACTIONS.NOTHING) {
			this.hoverCorners.leftTop = isInside(pos, this.getLeftTopCorner());
			this.hoverCorners.rightTop = isInside(pos, this.getRightTopCorner());
			this.hoverCorners.leftBottom = isInside(pos, this.getLeftBottomCorner());
			this.hoverCorners.rightBottom = isInside(pos, this.getRightBottomCorner());
		} else if (this.action === CANVAS_ACTIONS.SCALING_ROTATION ) {

			const centerPoint = this.originPoint;

			const _getDifference = function(tup1, tup2) {
				return {
					x : tup1.x - tup2.x,
					y : tup1.y - tup2.y
				};
			};

			const _getAngle = function(tup1, tup2) {
				const dxBYdy = _getDifference(tup1, tup2);
				return Math.atan2(dxBYdy.y, dxBYdy.x);
			};

			const _getDeltaAngle = function(center, startPos, currentPos) {

				if(center && startPos) {
					return _getAngle(center, currentPos) - _getAngle(center, startPos);
				} else {
					return 0;
				}
			};

			const _toScaler = function(tup1, tup2) {
				const diff = _getDifference(tup1, tup2);
				return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
			};

			const alpha = Math.atan( this.height / this.width);

			this.rotation = _getDeltaAngle(centerPoint, this.mousePos, pos) * 180 / Math.PI;

			const ratio = this.width / this.height;
			this.width = _toScaler(pos, centerPoint) * 2 * Math.cos(alpha);
			this.height = this.width / ratio;

		} else if (this.action === CANVAS_ACTIONS.MOVING) {

			const deltaX = pos.x - this.mousePos.x;
			const deltaY = pos.y - this.mousePos.y;
			this.originPoint.x +=  deltaX;
			this.originPoint.y +=  deltaY;
			this.mousePos = pos;
		}
	}

	click(pos) {

		const cardArea = {
			x: this.originPoint.x - this.width /2,
			y: this.originPoint.y - this.height /2,
			width: this.originPoint.x + this.width /2,
			height: this.originPoint.y + this.height /2,
		};

		if (this.hoverCorners.leftTop
			|| this.hoverCorners.leftBottom
			|| this.hoverCorners.rightTop
			|| this.hoverCorners.rightBottom) {
			this.action = CANVAS_ACTIONS.SCALING_ROTATION;
			this.mousePos = pos;
		} else if (pos.x >= cardArea.x && pos.x <= cardArea.width
			&& pos.y >= cardArea.y && pos.y <= cardArea.height) {
			this.action = CANVAS_ACTIONS.MOVING;
			this.mousePos = pos;
		} else {
			this.action = CANVAS_ACTIONS.NOTHING;
		}

	}

	// done with event
	done () {
		this.action = CANVAS_ACTIONS.NOTHING;
	}
	
	rotate (angle) {
		//document.querySelector('#log').innerHTML +=  " rotation: "  +  angle;
		this.rotation = angle;
	}
	
	scale (val) {
		const ratio = this.width / this.height;
		document.querySelector('#log').innerHTML +=  " scale: "  +  val;

		this.width *= val;
		this.height = this.width / ratio;
		
	}
	
	move(pos) {
		this.originPoint.x += pos.x;
		this.originPoint.y += pox.y;
	}


}

export default Card;