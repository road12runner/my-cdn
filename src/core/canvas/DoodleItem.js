import CanvasObject from './CanvasObject';
import { roundRect, allInside, hexToRgb } from './canvas-helper';

import RedCros from '../../img/red-cross.png';

const DEFAULT_LINE_WIDTH = 10;
const DEFAULT_LINE_COLOR = '#ffffff';

class DoodleItem extends CanvasObject {
	constructor (ctx, options = {}) {
		super();
		this.ctx = ctx;

		this.coverageArea = options.coverageArea;
		this.allowedArea = options.allowedArea;

		this.width = this.coverageArea.width || 50;
		this.height = this.coverageArea.height || 50;

		this.layerType = 'CustomImageLayer';

		const bleeding = options.bleeding || 5;

		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;


		// remove icon (red cross shown when item moved out from allowedArea)
		const removedIcon = new Image();
		removedIcon.src = RedCros;
		removedIcon.onload = () => {
			this.removedIcon = removedIcon;
		};

		this.originPoint = {
			x: this.coverageArea.x + this.coverageArea.width / 2,
			y: this.coverageArea.y + this.coverageArea.height / 2
		};


		this.selected = true;


		//doodle stuff
		this.points = [];
		this.lines = [];
		this.isDrawing = false;
		this.isDrawingMode = true;

		this.currentColor = DEFAULT_LINE_COLOR;
		this.currentLineWidth = DEFAULT_LINE_WIDTH;
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
		// if (this.rotation !== 0) {
		// 	ctx.rotate(this.rotation * Math.PI / 180);
		// }

		if (this.selected && this.isDrawingMode === false) {
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


		if (this.lines.length == 0 && this.points.length === 0) {
			// show the hint
			ctx.fillStyle = '#fff';
			ctx.font = '20px Comic Sans Serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'center';
			ctx.fillText('Draw here',  0, 0, this.coverageArea.width, this.coverageArea.width);
		} else {

			this.drawLines(ctx);
			this.drawPoints(this.currentColor, this.currentLineWidth, this.points, ctx);

			// draw buttons
			// ctx.restore();
			// ctx.translate(canvasCenter.x + this.coverageArea.x, canvasCenter.y + this.coverageArea.y);
			roundRect(ctx, -this.coverageArea.width/2, -this.coverageArea.height, 20, 20, 3);
			// ctx.beginPath();
			//
			//
			// ctx.fillStyle = 'rgba(100,100,100, 1)';
			// ctx.arc(-this.coverageArea.width/2, -this.coverageArea.height /2, 10, 0, 2 * Math.PI);
			// ctx.fill();


		}


		 ctx.restore();
		//
		// if (this.removed && this.removedIcon) {
		//
		// 	ctx.save();
		//
		// 	const {x, y} = this.originPoint;
		// 	ctx.translate(x + canvasCenter.x, y + canvasCenter.y);
		// 	if (this.rotation !== 0) {
		// 		ctx.rotate(this.rotation * Math.PI / 180);
		// 	}
		//
		// 	ctx.beginPath();
		// 	ctx.fillStyle = 'rgba(100,100,100, 1)';
		// 	ctx.arc(-this.width / 2, -this.height / 2, 10, 0, 2 * Math.PI);
		// 	ctx.fill();
		//
		// 	ctx.drawImage(this.removedIcon, -this.width / 2 - 5, -this.height / 2 - 5, 10, 10);
		//
		// 	ctx.restore();
		// }

	}

	drawLines (ctx) {
		if (this.lines.length > 0) {
			for (const line of this.lines) {
				this.drawPoints(line.color, line.lineWidth, line.points, ctx);
			}
		}
	}

    drawPoints (color, lineWidth, points, ctx) {
		if (points.length === 0) {
			return;
		}

		let p1 = points[0];
		let p2 = points[1];

	    const midPointBtw = (p1, p2) => {
		    return {
			    x: p1.x + (p2.x - p1.x) / 2,
			    y: p1.y + (p2.y - p1.y) / 2
		    };
	    };

	    ctx.lineWidth = DEFAULT_LINE_WIDTH;
	    ctx.lineJoin = ctx.lineCap = 'round';
	    ctx.shadowBlur = 2;

		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		// define shadows
		const rgb = hexToRgb(color);
		const shadowColor = 'rbga(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ', 0.5)';
		ctx.shadowColor = shadowColor;
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);

		for (let i = 1, len = points.length; i < len; i++) {
			// we pick the point between pi+1 & pi+2 as the
			// end point and p1 as our control point
			var midPoint = midPointBtw(p1, p2);
			ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points[i];
			p2 = points[i + 1];
		}

		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
	}


	click(pos) {
		this.isDrawing = true;
		console.log('click', pos);
	}

	hover(pos) {
		if (this.isDrawing) {
			console.log('hover', pos);
			const {x,y, width, height} = this.coverageArea;

			// can draw only withing coverage area
			if ( pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height) {
				this.points.push({
					x: pos.x - this.originPoint.x,
					y: pos.y  - this.originPoint.y
				});

			}
		}
	}

	done() {
		this.isDrawing = false;
		this.lines.push({color: this.currentColor, lineWidth: this.currentLineWidth, points: this.points.slice(0)});
		this.points.length = 0;
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

	 preview (scale, ctx) {

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width / 2,
			y: height / 2
		};

		const item = {
			image: this.image,
			width: this.width * scale.width,
			height: this.height * scale.height,
			rotation: this.rotation,
			flipped: this.flipped,
			originPoint: {
				x: this.originPoint.x * scale.width,
				y: this.originPoint.y * scale.height
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

export default DoodleItem;