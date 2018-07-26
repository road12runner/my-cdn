import { CANVAS_ACTIONS } from './canvasActionTypes';
import { isInside } from './canvas-helper';

class CanvasObject {

	constructor () {
		this.originPoint = {
			x: 0,
			y: 0
		};

		this.width = 0;
		this.height = 0;
		this.rotation = 0;

		this.hoverCorners = {
			leftTop: false,
			rightTop: false,
			leftBottom: false,
			rightBottom: false,
			rotatePoint: false
		};


		this.errorCoverage = false;

	}

	getLeftTopCorner () {
		if (this.rotation === 0) {
			return {
				x: this.originPoint.x - this.width / 2,
				y: this.originPoint.y - this.height / 2
			};
		} else {

			const pointOffset = {
				x: -this.width / 2,
				y: -this.height / 2
			};

			const radians = this.rotation * Math.PI / 180;
			const rotatePoint = {
				x: (pointOffset.x) * Math.cos(radians) - (pointOffset.y) * Math.sin(radians),
				y: (pointOffset.x) * Math.sin(radians) + (pointOffset.y) * Math.cos(radians),

			};

			return {
				x: rotatePoint.x + this.originPoint.x,
				y: rotatePoint.y + this.originPoint.y
			};
		}
	}

	getRightTopCorner () {

		if (this.rotation === 0) {
			return {
				x: this.originPoint.x + this.width /2,
				y: this.originPoint.y - this.height /2
			};
		} else {
			const pointOffset = {
				x: this.width / 2,
				y: -this.height / 2
			};
			//
			const radians = this.rotation * Math.PI / 180;
			const rotatePoint = {
				x: (pointOffset.x) * Math.cos(radians) - (pointOffset.y) * Math.sin(radians),
				y: (pointOffset.x) * Math.sin(radians) + (pointOffset.y) * Math.cos(radians)

			};

			return {
				x: rotatePoint.x + this.originPoint.x,
				y: rotatePoint.y + this.originPoint.y
			};
		}
	}

	getLeftBottomCorner () {
		if (this.rotation === 0) {
			return {
				x: this.originPoint.x - this.width /2,
				y: this.originPoint.y + this.height /2
			};
		} else {
			const pointOffset = {
				x: -this.width / 2,
				y: this.height / 2
			};
			//
			// //console.log(pointOffset);
			const radians = this.rotation * Math.PI / 180;
			const rotatePoint = {
				x: (pointOffset.x) * Math.cos(radians) - (pointOffset.y) * Math.sin(radians),
				y: (pointOffset.x) * Math.sin(radians) + (pointOffset.y) * Math.cos(radians)

			};

			return {
				x: rotatePoint.x + this.originPoint.x,
				y: rotatePoint.y + this.originPoint.y
			};
		}
	}

	getRightBottomCorner() {

		if (this.rotation === 0) {
			return {
				x: this.originPoint.x + this.width /2,
				y: this.originPoint.y + this.height /2
			};
		} else {
			const pointOffset = {
				x: this.width / 2,
				y: this.height / 2
			};

			const radians = this.rotation * Math.PI / 180;
			const rotatePoint = {
				x: (pointOffset.x) * Math.cos(radians) - (pointOffset.y) * Math.sin(radians),
				y: (pointOffset.x) * Math.sin(radians) + (pointOffset.y) * Math.cos(radians)

			};

			return {
				x: rotatePoint.x + this.originPoint.x,
				y: rotatePoint.y + this.originPoint.y
			};
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
			this.offset = {
				x: pos.x - this.originPoint.x,
				y: pos.y - this.originPoint.y
			} ;

		} else {
			done();
		}

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

			this.testCoverage();

		} else if (this.action === CANVAS_ACTIONS.MOVING) {

			this.originPoint.x =  pos.x - this.offset.x;
			this.originPoint.y =  pos.y - this.offset.y;

			this.testCoverage();
		}
	}

	// done with event
	done () {
		this.action = CANVAS_ACTIONS.NOTHING;
		this.savedRotation = null;
		this.savedOrigPoing = null;
		this.savedSize = null;
		this.offset = null;

	}



	rotate (angle) {
		this.rotation = angle;

		this.testCoverage();
	}

	scale (val) {
		const ratio = this.width / this.height;
		this.width *= val;
		this.height = this.width / ratio;

		this.testCoverage();

	}

	move(pos) {
		this.originPoint.x += pos.x;
		this.originPoint.y += pos.y;

		this.testCoverage();
	}



	startMove() {
		this.savedOrigPoing = Object.assign({}, this.originPoint);
	}

	doMove(pos) {
		if (this.savedOrigPoing) {
			this.originPoint = {
				x: this.savedOrigPoing.x + pos.x,
				y: this.savedOrigPoing.y + pos.y
			}

			this.testCoverage();
		}
	}

	endMove() {
		this.done();
	}


	startRotate(angle) {
		this.savedRotation = angle;
	}

	doRotate(angle) {
		if (this.savedRotation !== null ) {
			this.rotation -= (this.savedRotation - angle);
			this.savedRotation = angle;

			this.testCoverage();
		}
	}

	endRotate() {
		this.done();
	}
	startZoom() {
		this.savedSize = {
			width: this.width,
			height: this.height
		}
	}

	doZoom(scale) {
		if (this.savedSize) {
			this.width = this.savedSize.width * scale;
			this.height = this.savedSize.height * scale;

			this.testCoverage();
		}
	}

	endZoom() {
		this.done();
	}



}

export default CanvasObject;