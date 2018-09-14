import CanvasObject from './CanvasObject';
import { roundRect, hexToRgb } from './canvas-helper';
import * as api from '../net/api';
import AppSettings from '../AppSettings';
import {DOODLE} from './itemTypes'

const DEFAULT_LINE_WIDTH = 10;
const DEFAULT_LINE_COLOR = '#ffffff';

const scalePoints = (points, scaleX, scaleY) => {
	return points.map(point => {
		return {
			x: point.x * scaleX,
			y: point.y * scaleY
		};
	});
};


class DoodleItem extends CanvasObject {
	constructor (options = {}) {
		super();

		this.coverageArea = options.coverageArea;
		this.allowedArea = options.allowedArea;

		this.width = this.coverageArea.width || 50;
		this.height = this.coverageArea.height || 50;

		this.layerType = 'CustomImageLayer';
		this.type = DOODLE;


		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;

		this.originPoint = {
			x: this.coverageArea.x + this.coverageArea.width / 2,
			y: this.coverageArea.y + this.coverageArea.height / 2
		};

		this.selected = true;

		//doodle stuff
		this.points = [];
		this.lines = [];
		this.isDrawing = false;

		this.currentColor = options.lineColor || DEFAULT_LINE_COLOR;
		this.currentLineWidth = options.lineWidth || DEFAULT_LINE_WIDTH;
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

		if (this.lines.length == 0 && this.points.length === 0) {
			// show the hint
			ctx.fillStyle = '#fff';
			ctx.font = '20px Comic Sans Serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'center';
			ctx.fillText('Draw here', 0, 0, this.coverageArea.width, this.coverageArea.width);
		} else {

			this.drawLines(ctx, this.lines);
			this.drawPoints(this.currentColor, this.currentLineWidth, this.points, ctx);

		}

		ctx.restore();

		if (this.touchPos) {
			ctx.beginPath();
			ctx.fillStyle = 'pink';
			ctx.arc(this.touchPos.x, this.touchPos.y, 5, 0, 2 * Math.PI);
			ctx.fill();
		}

	}

	drawLines (ctx, lines) {
		if (lines.length > 0) {
			for (const line of lines) {
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

		ctx.lineWidth = lineWidth;
		ctx.lineJoin = ctx.lineCap = 'round';
		ctx.shadowBlur = 2;

		ctx.strokeStyle = color;

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

	click () {
		this.isDrawing = true;
	}

	hover (pos) {
		if (this.isDrawing) {
			const {x, y, width, height} = this.coverageArea;

			// can draw only withing coverage area
			if (pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height) {
				this.points.push({
					x: pos.x - this.originPoint.x,
					y: pos.y - this.originPoint.y
				});

			}
		}
	}

	done () {
		this.isDrawing = false;
		this.lines.push({color: this.currentColor, lineWidth: this.currentLineWidth, points: this.points.slice(0)});
		this.points.length = 0;
	}

	startTouch(pos) {
		this.click();
	}

	keepTouch(pos) {
		this.hover(pos);
	}

	endTouch() {
		this.done();
		//this.touchPos = null;
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
		// const vertices = [this.getLeftBottomCorner(),
		// 	this.getRightTopCorner(),
		// 	this.getLeftTopCorner(),
		// 	this.getRightBottomCorner()];
		// this.errorCoverage = !allInside(vertices, this.coverageArea);
		//
		// const OFFSET = 5;
		// this.removed = this.originPoint.x + this.width / 2 < this.allowedArea.x - OFFSET
		// 	|| this.originPoint.x - this.width / 2 > this.allowedArea.x + this.allowedArea.width + OFFSET
		// 	|| this.originPoint.y + this.height / 2 < this.allowedArea.y - OFFSET
		// 	|| this.originPoint.y - this.height / 2 > this.allowedArea.y + this.allowedArea.height + OFFSET;
		//
		// return this.errorCoverage;
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


		this.lines = this.lines.map(line => {
			return {
				color: line.color,
				lineWidth: line.lineWidth * scale,
				points: scalePoints(line.points, scale, scale)
			};
		});

		this.points = scalePoints(this.points, scale);

	}

	preview (scale, ctx) {

		const {width, height} = ctx.canvas;

		const canvasCenter = {
			x: width / 2,
			y: height / 2
		};

		const item = {
			width: this.width * scale.width,
			height: this.height * scale.height,
			currentColor: this.currentColor,
			currentLineWidth: this.currentLineWidth,
			originPoint: {
				x: this.originPoint.x * scale.width,
				y: this.originPoint.y * scale.height
			}
		};
		item.lines = this.lines.map(line => {
			return {
				color: line.color,
				lineWidth: line.lineWidth * scale.width,
				points: scalePoints(line.points, scale.width, scale.height)
			};
		});


		ctx.save();
		ctx.translate(item.originPoint.x + canvasCenter.x, item.originPoint.y + canvasCenter.y);
		this.drawLines(ctx, item.lines);
		ctx.restore();

	}

	undo () {
		this.lines.splice(-1, 1);
	}

	clear () {
		this.lines.length = 0;
	}

	setLineWidth (val) {
		this.currentLineWidth = val;
	}

	setLineColor (val) {
		this.currentColor = val;
	}


	getCustomImage(size, scale) {


		const doodleCanvas = document.createElement('canvas');
		const doodleCanvasContext = doodleCanvas.getContext('2d');

		doodleCanvas.width = size.width;
		doodleCanvas.height = size.height;

		// render text on actual card size
		this.preview(scale, doodleCanvasContext);

		const area = {
			x: 0 ,
			y: 0,
			width:  this.coverageArea.width * scale.width,
			height: this.coverageArea.height * scale.height
		};


		console.log('area', area);


		// crop image to actual size
		const croppedCanvas = document.createElement('canvas');
		const croppedContext = croppedCanvas.getContext('2d');

		croppedCanvas.width = area.width;
		croppedCanvas.height = area.height;

		croppedContext.drawImage(doodleCanvas, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);


		return new Promise( resolve => croppedCanvas.toBlob( data => resolve(data)) );


	}


	async uploadCustomImage(size, scale) {

		const imageData = this.getCustomImage(size, scale);
		if (imageData) {

			const res = await api.uploadCustomImage(AppSettings.handoverKey, AppSettings.clientId, 1, imageData);

			if (res) {
				console.log('res', res);
				this.imageId = res.Id;
			}
		}

	}

}

export default DoodleItem;