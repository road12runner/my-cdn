import Card from './Card';
class Canvas {

	constructor (designerSettings, canvasElement, options = {}) {
		this.canvas = document.querySelector(canvasElement);
		this.ctx = this.canvas.getContext('2d');

		if (options.width) {
			this.canvas.setAttribute('width', `${options.width}px`);
		}
		if (options.height) {
			this.canvas.setAttribute('height', `${options.height}px`);
		}

		const canvasCenter = {
			x: this.ctx.canvas.width / 2,
			y: this.ctx.canvas.height / 2,
		};


		const templateSize = {
			x: designerSettings.Desktop.Top,
			y: designerSettings.Desktop.Left,
			width: designerSettings.Desktop.Right - designerSettings.Desktop.Left,
			height: designerSettings.Desktop.Bottom - designerSettings.Desktop.Top

		};

		this.card = new Card({
			canvasCenter,
			templateSize,
			templateUrl: designerSettings.DesignTemplate.UrlLarge
		});




		window.requestAnimationFrame(() => this.drawCard());

	}


	drawCard() {

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.card.render(this.ctx);


		window.requestAnimationFrame(() => this.drawCard());

	}

	setImage(imageUrl) {
		this.card.setImage(imageUrl);
	}


}


export default Canvas;