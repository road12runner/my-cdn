import CanvasObject from './CanvasObject';
import { roundRect, allInside } from './canvas-helper';



class CardItem  extends CanvasObject{
	constructor(id, url, options = {}) {
		super();

		this.coverageArea = options.coverageArea;
		console.log(this.coverageArea);

		this.width = options.width || 50;
		this.height = options.height = 40;
		this.rotation = 0;

		const bleeding = options.bleeding || 5;

		this.originPoint = {
			x: this.coverageArea.x + this.width /2 + bleeding,
			y: this.coverageArea.y + this.height /2 + bleeding,
		} ;

		this.selected = true;
		this.setImage(url);

		this.borderColor = options.borderColor || 'rgb(49, 183, 219)';
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




		ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
		ctx.restore();

		// show item itself
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

		return allInside(vertices, this.coverageArea);
	}



}
export default CardItem;