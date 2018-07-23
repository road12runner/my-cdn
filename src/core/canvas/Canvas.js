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
		// create a pinch and rotate recognizer
		// these require 2 pointers
		const pinch = new Hammer.Pinch();
		const rotate = new Hammer.Rotate();
		const pan = new Hammer.Pan();

		// we want to detect both the same time
		pinch.recognizeWith(rotate);

		// add to the Manager
		mc.add([pinch, rotate, pan]);

		
		// setTimeout( () => {
		// 	//this.card.scale(1.5);
		// }, 3000);

		mc.on("pinch", ev => {
			
			
			// if (ev.type === 'pinch') {
			//
			// 	//document.querySelector('#log').innerHTML += ev.scale +" ";
			//
			// 	// if (!ev || !ev.scale) {
			// 	// 	debugger;
			// 	// }
			//
			// 	this.card.scale(ev.scale);
			// }
			// document.querySelector('#log').innerHTML += ev.scale +" ";
			// this.card.scale(e.scale);
//			document.querySelector('#log').innerHTML += ev.type +" ";
			// if (ev.type === 'pinch') {
			// 	document.querySelector('#log').innerHTML += ev.scale +" ";
			// } else if (ev.type === 'rotate') {
			// 	document.querySelector('#log').innerHTML += ev.rotation +" ";
			// }

			//myElement.textContent += ev.type +" ";
		});
		
		let currentRotation = 0, lastRotation, startRotation;
		mc.on('rotatestart', e => {
			lastRotation = currentRotation;
			startRotation = Math.round(e.rotation);
			//document.querySelector('#log').innerHTML +=  " rotation start: "  +  startRotation;
		});
		
		mc.on('rotateend', e=> {
			lastRotation = currentRotation;
			//document.querySelector('#log').innerHTML +=  " rotation end: "  +  lastRotation;
		});
		
		mc.on('rotatemove', e =>{
			const diff = Math.round(e.rotation) - startRotation;
			currentRotation = lastRotation - diff;
			
			this.card.rotate(diff);
		});
		
		
		
		let currentScale;
		mc.on('pinchstart', e => {
			currentScale = e.scale;
			//document.querySelector('#log').innerHTML +=  " pinch start: "  +  startScale;
		});

		mc.on('pinchend', e=> {
			//lastScale = currentScale;
			//document.querySelector('#log').innerHTML +=  " pinch end: "  +  lastScale;
		});

		mc.on('pinchmove', e =>{
			const diff = e.scale - currentScale;
			//document.querySelector('#log').innerHTML +=  " pinch: "  +  diff;
			this.card.scale( 1+ diff / 4); // put coefficient for scaling
			currentScale = e.scale;
		});

		
		mc.on('pan', e => {
			this.card.move({
				x: e.deltaX / 10,
				y: e.deltaY /10
			});
		});

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