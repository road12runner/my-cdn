class CanvasObject {

	constructor () {
		this.originPoint = {
			x: 0,
			y: 0
		};

		this.width = 0;
		this.height = 0;
		this.rotation = 0;

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

}

export default CanvasObject;