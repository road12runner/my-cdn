import Card from './Card';
import {getEventPosition} from './canvas-helper'
import  Hammer from 'hammerjs';

class Canvas {

	constructor (designerSettings, canvasElement, options = {}) {

		console.log('hammer', Hammer);

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



		// mouse events
		this.canvas.addEventListener('mousedown', e => this.startEvent(e));
		this.canvas.addEventListener('mousemove', e => this.keepEvent(e));
		this.canvas.addEventListener('mouseup', e => this.finishEvent(e));


		const mc = new Hammer.Manager(this.canvas);
// // create a pinch and rotate recognizer
// // these require 2 pointers
// 		var pinch = new Hammer.Pinch();
// 		var rotate = new Hammer.Rotate();
//
// // we want to detect both the same time
// 		pinch.recognizeWith(rotate);
//
// // add to the Manager
// 		mc.add([pinch, rotate]);
//
//
// 		mc.on("pinch rotate", function(ev) {
// 			myElement.textContent += ev.type +" ";
// 		});

		window.requestAnimationFrame(() => this.drawCard());

	}


	drawCard() {

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.card.render(this.ctx);


		window.requestAnimationFrame(() => this.drawCard());

	}

	startEvent(e) {

		//TODO find selected item on card if any


		const pos = getEventPosition(event);
		this.card.selected = true;
		this.card.click(pos)

	}


	keepEvent(e) {
		const pos = getEventPosition(e);
		this.card.hover(pos);
	}

	finishEvent (e) {

		this.card.done();
	}

	setImage(imageUrl) {
		this.card.setImage(imageUrl);
	}





}


export default Canvas;