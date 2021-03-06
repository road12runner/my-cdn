import CanvasObject from './CanvasObject';
import {roundRect, isInside, allInside, doPolygonsIntersect} from './canvas-helper';
import {CANVAS_ACTIONS} from './canvasActionTypes';

import {STOCK_IMAGE, CUSTOM_IMAGE, CARD} from './itemTypes'

class Card extends CanvasObject {
	constructor(ctx, options = {}) {
		super();
		this.ctx = ctx;
		
		this.layerType = STOCK_IMAGE;
		this.type = CARD;
		this.coverageArea = options.coverageArea;
		
		this.template = options.templateArea;
		
		
		//origin point center of image  relates to center of template (center of canvas)
		this.originPoint = {
			x: 0,
			y: 0
		};
		this.imageOpacity = options.imageOpacity || 0.4;
		
		this.width = this.coverageArea.width + 40;
		this.height = this.coverageArea.height + 40;
		
		
		this.locked = false;
		this.selected = true;
		this.imageLoaded = false;
		this.rotation = 0;
		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';
		
		if (options.image) {
			this.setImage(options.image.id, options.image.url);
		}
		
	}

	reset() {
		this.locked = false;
		this.rotation = 0;
		this.originPoint = {
			x: 0,
			y: 0
		};
		this.width = this.coverageArea.width + 40;
		this.height = this.coverageArea.height + 40;
		this.testCoverage();

	}

	setSpecialEffect(specialEffectName, intensity, url) {
		const specialEffectImage = new Image();
		specialEffectImage.crossOrigin = 'Anonymous';
		specialEffectImage.src = url;
		specialEffectImage.onload = () => {
			this.specialEffectName = specialEffectName;
			this.specialEffectIntensity  = intensity;
			this.specialEffectImage = specialEffectImage;
		}
	}

	removeSpecialEffects() {
		this.specialEffectImage = null;
		this.specialEffectIntensity = 0;
		this.specialEffectName = '';

	}


	setImage(id, url, imageType  = STOCK_IMAGE) {

		this.reset();

		this.id = id;
		this.layerType = imageType;

		this.specialEffectImage = null;


		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.src = url;

		return new Promise( resolve => {
			img.onload = () => {
				this.image = img;
				// always in center on canvas
				this.originPoint = {
					x: 0,
					y: 0
				};

				resolve(this.image)
			};

		});
	}
	
	render(ctx) {
		if (!this.image) {
			return;
		}
		
		const canvasCenter = {
			x: ctx.canvas.width / 2,
			y: ctx.canvas.height / 2
		};
		

		const renderedImage = this.specialEffectImage || this.image;


		ctx.save();
		ctx.translate(this.originPoint.x + canvasCenter.x, this.originPoint.y + canvasCenter.y);
		
		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}
		
		// draw image with opacity
		ctx.globalAlpha = this.imageOpacity;
		if (this.flipped) {
			ctx.scale(-1, 1);
		}
		ctx.drawImage(renderedImage, -this.width / 2, -this.height / 2, this.width, this.height);
		
		if (this.flipped) {
			// flip back whole canvas
			ctx.scale(-1, 1);
		}
		
		
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
		
		roundRect(ctx, canvasCenter.x - this.coverageArea.width / 2, canvasCenter.y - this.coverageArea.height / 2, this.coverageArea.width, this.coverageArea.height);
		ctx.clip();
		
		ctx.translate(canvasCenter.x + this.originPoint.x, canvasCenter.y + this.originPoint.y);
		
		if (this.rotation !== 0) {
			ctx.rotate(this.rotation * Math.PI / 180);
		}
		
		if (this.flipped) {
			ctx.scale(-1, 1);
		}
		
		
		ctx.drawImage(renderedImage, -this.width / 2, -this.height / 2, this.width, this.height);
		
		// flip back whole canvas
		if (this.flipped) {
			ctx.scale(-1, 1);
		}
		
		ctx.restore();
		
		
		//ctx.drawImage(this.template.image, canvasCenter.x - this.template.width /2, canvasCenter.y - this.template.height /2, this.template.width, this.template.height);
		
		// ctx.beginPath();
		// ctx.fillStyle= '#000';
		// ctx.arc(this.originPoint.x, this.originPoint.y, 5, 0, 2 * Math.PI);
		// ctx.fill();
		
	}
	
	testCoverage() {

		const bleedBox = {
			top: -this.coverageArea.height / 2,
			left: -this.coverageArea.width / 2,
			right: this.coverageArea.width / 2,
			bottom: this.coverageArea.height / 2
		};
		const vertices = [this.getLeftTopCorner(), this.getRightTopCorner(), this.getRightBottomCorner(), this.getLeftBottomCorner()];
		
		const r1 = allInside();
		const r2 = noOverlap();
		const r3 = linesIntersect();
		
		this.errorCoverage = r1 || r2 || r3;
		return this.errorCoverage;
		
		function linesIntersect() {
			const imageLines = verticesToLines(vertices);
			
			const templateLines = verticesToLines([
				{x: Math.round(bleedBox.left), y: Math.round(bleedBox.bottom)},
				{x: Math.round(bleedBox.left), y: Math.round(bleedBox.top)},
				{x: Math.round(bleedBox.right), y: Math.round(bleedBox.top)},
				{x: Math.round(bleedBox.right), y: Math.round(bleedBox.bottom)}
			]);
			
			for (let i = 0; i < imageLines.length; i++) {
				for (let j = 0; j < templateLines.length; j++) {
					if (lineIntersect(imageLines[i].p1.x,
						imageLines[i].p1.y,
						imageLines[i].p2.x,
						imageLines[i].p2.y,
						templateLines[j].p1.x,
						templateLines[j].p1.y,
						templateLines[j].p2.x,
						templateLines[j].p2.y
					)
					) {
						return true;
					}
				}
			}
			
			return false;
		}
		
		function noOverlap() {
			return (vertices[0].y < bleedBox.top
				&& vertices[1].y < bleedBox.top
				&& vertices[2].y < bleedBox.top
				&& vertices[3].y < bleedBox.top)
				||
				(vertices[0].y > bleedBox.bottom
					&& vertices[1].y > bleedBox.bottom
					&& vertices[2].y > bleedBox.bottom
					&& vertices[3].y > bleedBox.bottom)
				||
				(vertices[0].x < bleedBox.left
					&& vertices[1].x < bleedBox.left
					&& vertices[2].x < bleedBox.left
					&& vertices[3].x < bleedBox.left)
				||
				(vertices[0].x > bleedBox.right
					&& vertices[1].x > bleedBox.right
					&& vertices[2].x > bleedBox.right
					&& vertices[3].x > bleedBox.right);
		}
		
		function allInside() {
			return vertices[0].y > bleedBox.top
				&& vertices[1].y > bleedBox.top
				&& vertices[2].y > bleedBox.top
				&& vertices[3].y > bleedBox.top
				&& vertices[0].x > bleedBox.left
				&& vertices[1].x > bleedBox.left
				&& vertices[2].x > bleedBox.left
				&& vertices[3].x > bleedBox.left
				&& vertices[0].x < bleedBox.right
				&& vertices[1].x < bleedBox.right
				&& vertices[2].x < bleedBox.right
				&& vertices[3].x < bleedBox.right
				&& vertices[0].y < bleedBox.bottom
				&& vertices[1].y < bleedBox.bottom
				&& vertices[2].y < bleedBox.bottom
				&& vertices[3].y < bleedBox.bottom;
		}
		
		function verticesToLines(vertices) {
			const lines = [];
			
			for (let i = 0; i < vertices.length; i++) {
				let next = i + 1;
				if (next === vertices.length) {
					next = 0;
				}
				lines.push({p1: vertices[i], p2: vertices[next]});
			}
			
			return lines;
		}
		
		function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
			const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
			if (isNaN(x) || isNaN(y)) {
				return false;
			} else {
				if (x1 >= x2) {
					if (!(x2 <= x && x <= x1)) {
						return false;
					}
				} else {
					if (!(x1 <= x && x <= x2)) {
						return false;
					}
				}
				if (y1 >= y2) {
					if (!(y2 <= y && y <= y1)) {
						return false;
					}
				} else {
					if (!(y1 <= y && y <= y2)) {
						return false;
					}
				}
				if (x3 >= x4) {
					if (!(x4 <= x && x <= x3)) {
						return false;
					}
				} else {
					if (!(x3 <= x && x <= x4)) {
						return false;
					}
				}
				if (y3 >= y4) {
					if (!(y4 <= y && y <= y3)) {
						return false;
					}
				} else {
					if (!(y3 <= y && y <= y4)) {
						return false;
					}
				}
			}
			return true;
		}
		
	}
	
	// getConfiguration () {
	// 	const config = super.getConfiguration();
	// 	config.template = this.template;
	// 	config.image = this.img;
	//
	// 	return config;
	// }
	
	handleResize(scale) {
		
		this.coverageArea.width *= scale;
		this.coverageArea.height *= scale;
		
		const imageRatio = this.width / this.height;
		this.width *= scale;
		this.height = this.width / imageRatio;
		
		this.originPoint = {
			x: this.originPoint.x * scale,
			y: this.originPoint.y * scale
		};
		
		
	}
	
	// render image for preview
	preview(scale, ctx) {

		const {width, height} = ctx.canvas;
		
		const canvasCenter = {
			x: width / 2,
			y: height / 2
		};
		

		
		// clone card object
		const card = {
			image: this.specialEffectImage || this.image,
			width: this.width * scale.width,
			height: this.height * scale.height,
			rotation: this.rotation,
			flipped: this.flipped,
			originPoint: this.originPoint
		};
		
		
		ctx.save();
		ctx.translate(card.originPoint.x + canvasCenter.x, card.originPoint.y + canvasCenter.y);
		
		if (card.rotation !== 0) {
			ctx.rotate(card.rotation * Math.PI / 180);
		}
		if (card.flipped) {
			ctx.scale(-1, 1);
		}
		
		
		ctx.drawImage(card.image, -card.width / 2, -card.height / 2, card.width, card.height);
		
		
		ctx.restore();

	}
	
}

export default Card;

//todo remove points for touch mode