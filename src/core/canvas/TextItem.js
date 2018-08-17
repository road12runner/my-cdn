import CanvasObject from './CanvasObject';
import { CANVAS_ACTIONS } from './canvasActionTypes';
import { roundRect, allInside } from './canvas-helper';

import RedCros from '../../img/red-cross.png';

class TextItem extends CanvasObject {
	constructor (id, text, ctx, options = {}) {
		super();

		this.ctx = ctx;

		this.coverageArea = options.coverageArea;
		this.templateArea = options.allowedArea;
		this.layerType = 'TextLayer';

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

		const bleeding = options.bleeding || 5;

		this.width = options.width || options.coverageArea.width;
		this.height = options.height || this.fontStyle.height || options.coverageArea.height;

		this.originPoint = options.initialPosition || {
			x: this.coverageArea.x + this.width / 2,
			y: this.coverageArea.y + this.height / 2,
		};
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

	setCanvasFont (ctx, fontStyle) {
		const {height, name, color} = fontStyle;
		let font = `${height}px ${name}`;
		if (fontStyle.bold) {
			font = 'bold ' + font;
		}
		if (fontStyle.italic) {
			font = 'italic '  + font;
		}

		ctx.font = font;
		ctx.textAlign = 'center';

	}


	adjustFontHeightToWidth (text, fontStyle, width, ctx) {

		for (let height = this.height; height > 0; height -= 0.1) {
			fontStyle.height = height;
			this.setCanvasFont(ctx, fontStyle);
			const textWidth = ctx.measureText(text).width;
			console.log('textWidth', textWidth);
			if (textWidth <= width) {
				this.fontStyle.height = height;
				break;
			}
		}

	}

	setText (text) {
		this.text = text;

		this.adjustFontHeightToWidth(text, this.fontStyle, this.width, this.ctx);
	}

	setFontStyle(fontStyle) {
		this.fontStyle = fontStyle;
		this.adjustFontHeightToWidth(this.text, this.fontStyle, this.width, this.ctx);
	}

	getFontStyle(){
		return {...this.fontStyle};
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


		this.setCanvasFont(ctx, this.fontStyle);

		if (this.fontStyle.shadow) {
			ctx.fillStyle = 'rgba( 0,0,0,.4)';
			ctx.fillText(this.text, 3, this.height / 2 - 1 , this.width);
		}

		if (this.fontStyle.stroke) {

			ctx.beginPath();
			ctx.strokeStyle = this.fontStyle.color;
			ctx.strokeText(this.text, 0, this.height / 2 - 2, this.width);

		} else {

			ctx.beginPath();
			ctx.fillStyle = this.fontStyle.color;
			ctx.fillText(this.text, 0, this.height / 2 - 2, this.width);
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
			this.adjustFontHeightToWidth(this.text, this.fontStyle, this.width, this.ctx);
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

	getConfiguration () {
		const config = super.getConfiguration();
		config.image = this.img;
		return config;
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

}

export default TextItem;