import AppSettings from '../AppSettings';
import * as api from '../net/api';

import CanvasObject from './CanvasObject';
import { CANVAS_ACTIONS } from './canvasActionTypes';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';

import '../../core/lib/canvasToBlob';
import {TEXT} from './itemTypes';
function convertFont (fontStyle = {}) {
	const {height, name} = fontStyle;
	let font = `${height}px ${name}`;
	if (fontStyle.bold) {
		font = 'bold ' + font;
	}
	if (fontStyle.italic) {
		font = 'italic ' + font;
	}

	return font;

}
function measureTextWidth (text, fontStyle, canvasContext) {

	canvasContext.font = convertFont(fontStyle);
	canvasContext.textAlign = 'left';
	return canvasContext.measureText(text).width;
}

class TextItem extends CanvasObject {
	constructor (id, text, ctx, options = {}) {
		super();

		this.ctx = ctx;

		this.bleeding = options.bleeding || 3;
		this.baseLine = 10;

		this.coverageArea = options.coverageArea;
		this.templateArea = options.allowedArea;
		this.layerType = 'CustomImageLayer';
		this.type = TEXT;

		this.fontStyle = options.fontStyle || {
			name: 'Comic Sans MS',
			height: 30,
			color: 'red',
			stroke: false,
			bold: false,
			italic: false,
			shadow: false
		};

		this.id = id;

		this.maxWidth = options.coverageArea.width;
		//this.width = options.width ||  - bleeding * 2;
		//this.height = options.height || this.fontStyle.height || options.coverageArea.height - bleeding * 2;
		this.height =  this.fontStyle.height + this.baseLine;

		this.selected = true;
		this.rotation = 0;

		this.setText(text);
		this.testCoverage();

		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';

		this.removed = false;

		const removedIcon = new Image();
		removedIcon.src = RedCros;
		removedIcon.onload = () => {
			this.removedIcon = removedIcon;
		};

	}

	// static setCanvasFont (ctx, fontStyle) {
	// 	const {height, name, color} = fontStyle;
	// 	let font = `${height}px ${name}`;
	// 	if (fontStyle.bold) {
	// 		font = 'bold ' + font;
	// 	}
	// 	if (fontStyle.italic) {
	// 		font = 'italic ' + font;
	// 	}
	//
	// 	ctx.font = font;
	// 	ctx.textAlign = 'center';
	//
	// }
	//
	// static adjustFontHeightToWidth (text, fontStyle, width, height, ctx) {
	//
	// 	const maxHeight = height;
	//
	// 	for (let height = maxHeight; height > 0; height -= 0.1) {
	// 		fontStyle.height = height;
	// 		this.setCanvasFont(ctx, fontStyle);
	// 		const textWidth = ctx.measureText(text).width;
	// 		if (textWidth <= width) {
	// 			return height;
	// 		}
	// 	}
	//
	// 	return maxHeight;
	//
	// }

	setText (text) {
		this.text = text;
		this.width = measureTextWidth(text, this.fontStyle, this.ctx);

		this.originPoint = {
			x: this.coverageArea.x + this.width / 2 + this.bleeding,
			y: this.coverageArea.y + this.height / 2 + this.bleeding,
		};

	}

	setFontStyle (fontStyle) {
		this.fontStyle = fontStyle;
		this.width = measureTextWidth(this.text, this.fontStyle, this.ctx);
		this.height = fontStyle.height + this.baseLine;
	}

	getFontStyle () {
		return Object.assign({}, this.fontStyle);
	}

	render (ctx) {
		if (!this.text) {
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

		// ctx.beginPath();
		// ctx.fillStyle = 'pink';
		// ctx.arc(this.originPoint.x + canvasCenter.x, this.originPoint.y + canvasCenter.y, 5, 0, 2 * Math.PI);
		// ctx.fill();


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

		ctx.font = convertFont(this.fontStyle);
		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';

		if (this.fontStyle.shadow) {
			ctx.fillStyle = 'rgba( 0,0,0,.4)';
			ctx.fillText(this.text,  -this.width /2 + 3, this.height / 2 - 1, this.width, this.maxWidth);
		}

		if (this.fontStyle.stroke) {

			ctx.beginPath();
			ctx.strokeStyle = this.fontStyle.color;
			ctx.strokeText(this.text, -this.width /2 , this.height / 2 - 2, this.width, this.maxWidth);

		} else {

			ctx.beginPath();
			ctx.fillStyle = this.fontStyle.color;
			ctx.fillText(this.text, -this.width /2 , this.height / 2 - 2, this.width, this.maxWidth);
		}

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
			ctx.fillStyle = 'rgba(200,200,200, 1)';
			ctx.arc(-this.width / 2, -this.height / 2, 10, 0, 2 * Math.PI);
			ctx.fill();

			ctx.drawImage(this.removedIcon, -this.width / 2 - 5, -this.height / 2 - 5, 10, 10);

			ctx.restore();

		}

	}

	hover (pos) {
		super.hover(pos);
		if (this.action === CANVAS_ACTIONS.SCALING_ROTATION) {
			this.fontStyle.height = this.height - this.baseLine;
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

		this.removed = this.originPoint.x + this.width / 2 < this.templateArea.x - 5
			|| this.originPoint.x - this.width / 2 > this.templateArea.x + this.templateArea.width + 5
			|| this.originPoint.y + this.height / 2 < this.templateArea.y - 5
			|| this.originPoint.y - this.height / 2 > this.templateArea.y + this.templateArea.height + 5;

		return this.errorCoverage;
	}

	handleResize (scale) {
		//const ratio = this.width / this.height;


		this.width *= scale;
		this.fontStyle.height *= scale;

		const newHeight = this.fontStyle.height + this.baseLine * scale;
		const newWidth = measureTextWidth(this.text, this.fontStyle, this.ctx);


		const scaleWidth = this.width / newWidth;
		const scaleHeight = this.height / newHeight;





		// this.width *= scale;
		// this.height = this.width / ratio;

		this.originPoint = {
			x: this.originPoint.x * scale,
			y: this.originPoint.y * scale
		};


		this.width = newWidth;
		this.height = newHeight;

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
			text: this.text,
			fontStyle: {...this.fontStyle},
			width: this.width * scale.width,
			height: this.height * scale.height,
			rotation: this.rotation,
			flipped: this.flipped,
			originPoint: {
				x: this.originPoint.x * scale.width,
				y: this.originPoint.y * scale.height
			},
			maxWidth: this.maxWidth * scale.width
		};

		item.fontStyle.height *= scale.height;
		item.height = item.fontStyle.height + this.baseLine * scale.height;

		ctx.save();
		ctx.translate(item.originPoint.x + canvasCenter.x, item.originPoint.y + canvasCenter.y);
		if (item.rotation !== 0) {
			ctx.rotate(item.rotation * Math.PI / 180);
		}

		if (item.flipped) {
			ctx.scale(-1, 1);
		}

		ctx.font = convertFont(item.fontStyle);

		ctx.textAlign = 'left';
		ctx.textBaseline = 'bottom';

		if (item.fontStyle.shadow) {
			ctx.beginPath();
			ctx.fillStyle = 'rgba( 0,0,0,.4)';
			ctx.fillText(item.text,  -item.width /2 + 3, item.height / 2 - 1, item.width, item.maxWidth);
		}

		if (item.fontStyle.stroke) {

			ctx.beginPath();
			ctx.strokeStyle = item.fontStyle.color;
			ctx.strokeText(item.text, -item.width /2 , item.height / 2 - 2, item.width, item.maxWidth);

		} else {

			ctx.beginPath();
			ctx.fillStyle = item.fontStyle.color;
			ctx.fillText(item.text, -item.width /2 , item.height / 2 - 2, item.width, item.maxWidth);
		}


		ctx.restore();

	}



	getCustomImage(size, scale) {


		const textCanvas = document.createElement('canvas');
		const textCanvasContext = textCanvas.getContext('2d');

		textCanvas.width = size.width;
		textCanvas.height = size.height;

		// render text on actual card size
		this.preview(scale, textCanvasContext);


		const canvasCenter = {
			x: textCanvas.width /2,
			y: textCanvas.height /2,
		};

		// textCanvasContext.beginPath();
		// textCanvasContext.fillStyle = 'pink';
		// textCanvasContext.arc(canvasCenter.x, canvasCenter.y, 5, 0, 2 * Math.PI);
		// textCanvasContext.fill();



		console.log('center', canvasCenter);


		// const areaWidth = this.width * scale.width;
		// const areaHeight = this.height * scale.height;

		// const origin = {
		// 	x: this.originPoint.x * scale.width,
		// 	y: this.originPoint.y * scale.height
		// };



		const  rect = this.getBoundRect(scale);
		console.log('rect', rect);

		const area = {
			x: canvasCenter.x  + rect.left * scale.width,
			y: canvasCenter.y  + rect.top * scale.height,
			width:  (rect.right - rect.left) * scale.width,
			height:(rect.bottom - rect.top) * scale.height
		};


		console.log('area', area);

		// textCanvasContext.strokeStyle = 'pink';
		// textCanvasContext.rect(area.x,area.y,area.width,area.height);
		// textCanvasContext.stroke();



		// crop image to actual size
		const croppedCanvas = document.createElement('canvas');
		const croppedContext = croppedCanvas.getContext('2d');

		croppedCanvas.width = area.width;
		croppedCanvas.height = area.height;

		croppedContext.drawImage(textCanvas, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);


		// const imgData = croppedCanvas.toDataURL();
		// const img = new Image();
		// img.src = imgData;
		// img.onload = () => {
		// 	const previewContainer = document.querySelector('.preview-container');
		// 	previewContainer.appendChild(img);
		// };
		//

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

export default TextItem;