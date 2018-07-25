import Card from './Card';
import CardItem  from './CardItem';

import {getEventPosition} from './canvas-helper'
import  Hammer from 'hammerjs';

class Canvas {

	constructor (designerSettings, canvasElement, options = {}) {


		this.designerSettings = designerSettings;

		this.canvas = document.querySelector(canvasElement);
		this.ctx = this.canvas.getContext('2d');

		if (options.width) {
			this.canvas.setAttribute('width', `${options.width}`);
		}
		if (options.height) {
			this.canvas.setAttribute('height', `${options.height}`);
		}


		this.handleCardCoverage = options.onCardCoverage || function() {};

		const canvasCenter = {
			x: this.ctx.canvas.width / 2,
			y: this.ctx.canvas.height / 2,
		};


		this.templateSize = {
			x: designerSettings.Desktop.Top,
			y: designerSettings.Desktop.Left,
			width: designerSettings.Desktop.Right - designerSettings.Desktop.Left,
			height: designerSettings.Desktop.Bottom - designerSettings.Desktop.Top

		};

		this.card = new Card({
			canvasCenter,
			templateSize : this.templateSize,
			templateUrl: designerSettings.DesignTemplate.UrlLarge
		});

		this.items = [];

		if (options.touchDevice) {
			this.setTouchEvents();
		} else {
			// mouse events
			this.canvas.addEventListener('mousedown', e => this.startEvent(e));
			this.canvas.addEventListener('mousemove', e => this.keepEvent(e));
			this.canvas.addEventListener('mouseup', e => this.finishEvent(e));

		}

		// dragg drop events
		this.canvas.addEventListener('dragover', e => this.dragOver(e));
		this.canvas.addEventListener('drop', e => this.drop(e));

		if (options.image) {
			this.setImage(options.image);
		}



		this.testCardCoverageResult = false;

		window.requestAnimationFrame(() => this.drawCard());

	}


	setTouchEvents() {
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


		mc.on('rotatestart', e => this.getSelectedObject().startRotate(e.rotation));
		mc.on('rotateend', e => this.getSelectedObject().endRotate());
		mc.on('rotatemove', e => this.getSelectedObject().doRotate(e.rotation));
		mc.on('pinchstart', e => this.getSelectedObject().startZoom());
		mc.on('pinchend', e=> this.getSelectedObject().endZoom());
		mc.on('pinchmove', e =>this.getSelectedObject().doZoom(e.scale));
		mc.on('panstart', e => this.getSelectedObject().startMove());
		mc.on('panmove', e => this.getSelectedObject().doMove({x: e.deltaX, y: e.deltaY}));
		mc.on('panend', e => this.getSelectedObject().endMove());



		//let currentScale;
		// mc.on('pinchstart', e => {
		// 	this.getSelectedObject().startZoom();
		// 	currentScale = e.scale;
		// });
		//
		// mc.on('pinchend', e=> this.getSelectedObject().endZoom());
		//
		// mc.on('pinchmove', e =>{
		// 	//const diff = e.scale - currentScale;
		// 	this.card.doZoom(e.scale);
		// 	//currentScale = e.scale;
		// });


	}

	drawCard() {

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.card.render(this.ctx);
		this.items.forEach( item => item.render(this.ctx));

		window.requestAnimationFrame(() => this.drawCard());

	}

	startEvent(e) {
		const pos = getEventPosition(event);
		// check if events happens in already selected item
		let selectedObject = null;
		let selectedItems = this.items.filter( item => item.selected === true && item.hitTest(pos));
		if (selectedItems.length === 1) {
			selectedObject = selectedItems[0];
		} else {

			for (const item of this.items) {
				if ( !selectedObject && item.hitTest(pos)) {
					item.selected = true;
					selectedObject = item;
				} else {
					item.selected = false;
				}
			}
		}

		if (selectedObject) {
			// found an item - remove selection from card and delegate click event to selected item
			this.card.selected = false;
			selectedObject.click(pos);

		} else {

			// select card and pass the click event
			this.card.selected = true;
			this.card.click(pos);

		}


	}



	getSelectedObject() {
		return this.card.selected ? this.card : this.items.find( item => item.selected === true);
	}

	keepEvent(e) {
		const pos = getEventPosition(e);

		const selectedObj = this.getSelectedObject();
		selectedObj.hover(pos);
		const result = selectedObj.testCoverage();
		if (result !== this.testCardCoverageResult) {
			this.handleCardCoverage(result);
			this.testCardCoverageResult = result;
		}
	}

	finishEvent (e) {
		console.log('mouseup');
		const selectedObj = this.getSelectedObject();
		selectedObj.done();
	}

	setImage(imageUrl) {
		this.card.setImage(imageUrl);

	}


	dragOver(e) {
		e.preventDefault();
	}

	drop(e) {
		e.preventDefault();
		const imageId = +e.dataTransfer.getData("image-id");
		const imageUrl  = e.dataTransfer.getData("image-url");
		if (imageId) {
			console.log('image id', imageId, imageUrl, getEventPosition(e));
			const  cardItem =  this.addImageItem(imageId, imageUrl);
			cardItem.originPoint = getEventPosition(e);


		}
	}

	addImageItem(id, url) {


		const itemArea = this.designerSettings.Coverage.Logo;


		// remove previously selected object
		this.card.selected = false;
		this.items.forEach( item => item.selected = false );

		const canvasCenter = {
			x: this.ctx.canvas.width / 2,
			y: this.ctx.canvas.height / 2,
		};



		const coverageArea = {
			x: canvasCenter.x - this.templateSize.width /2 + itemArea.Left,
			y: canvasCenter.y - this.templateSize.height /2 + itemArea.Top,
			width:  itemArea.Right  - itemArea.Left,
			height: itemArea.Bottom - itemArea.Top
		};

		const cardItem = new CardItem(id, url, {
			coverageArea,
			onOutOfArea: () => this.handleOutOfArea()
		});
		this.items.push(cardItem);

		return cardItem;

	}


	// itemOutOfArea() {
	// 	this.ctx.font = '12px Arial';
	// 	this.ctx.fillStyle = '#000';
	// 	this.ctx.fillText('Overlap', 10, 10);
	// }

}



export default Canvas;