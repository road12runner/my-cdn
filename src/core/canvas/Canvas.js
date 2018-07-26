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
		let width = (designerSettings.Desktop.Right - designerSettings.Desktop.Left) || 241;
		let height = (designerSettings.Desktop.Bottom - designerSettings.Desktop.Top) || 153;


		if (options.scale) {
			const ratio = width / height;
			width *= options.scale;
			height *= ratio;
		}



		this.templateArea = {
			x: canvasCenter.x - width /2,
			y: canvasCenter.y - height /2,
			width,
			height
		};

		this.card = new Card({
			canvasCenter,
			templateArea : this.templateArea,
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
		
		const tap= new Hammer.Tap({ event: 'singletap' });
		
		// we want to detect both the same time
		pinch.recognizeWith(rotate);

		// add to the Manager
		mc.add([pinch, rotate, pan, tap]);


		mc.on('rotatestart', e => this.getSelectedObject().startRotate(e.rotation));
		mc.on('rotateend', e => {
			this.getSelectedObject().endRotate();
			this.removeItems();
		});
		mc.on('rotatemove', e => {
			const obj = this.getSelectedObject();
			obj.doRotate(e.rotation);
			this.testCoverage();
		});
		mc.on('pinchstart', e => this.getSelectedObject().startZoom());
		mc.on('pinchend', e => {
			this.getSelectedObject().endZoom();
			this.removeItems();
		});
		mc.on('pinchmove', e =>{
			const obj = this.getSelectedObject();
			obj.doZoom(e.scale);
			this.testCoverage();
		});
		mc.on('panstart', e => {
			this.getSelectedObject().startMove()
		});
		mc.on('panmove', e => {
			const obj = this.getSelectedObject();
			obj.doMove({x: e.deltaX, y: e.deltaY});
			this.testCoverage();
			
		});
		mc.on('panend', e => {
			this.getSelectedObject().endMove()
			this.removeItems();
		});
		mc.on('singletap', e => {
			
			function getPos(e) {
				const rect = e.target.getBoundingClientRect();
				const eventPos = e.center;
				
				return {
					x: eventPos.x - rect.left,
					y: eventPos.y - rect.top
				};
			}
			
			const pos = getPos(e);
			this.findSelectedObject(pos);
		});

	}

	drawCard() {

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.card.render(this.ctx);
		this.items.forEach( item => item.render(this.ctx));

		window.requestAnimationFrame(() => this.drawCard());

	}

	startEvent(e) {
		const pos = getEventPosition(event);
		this.findSelectedObject(pos).click(pos);
		
	}

	findSelectedObject(pos) {
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
			return selectedObject;
			
		} else {
			
			// select card and pass the click event
			this.card.selected = true;
			return this.card;
			
		}
		
	}
	
	
	

	getSelectedObject() {
		return this.card.selected ? this.card : this.items.find( item => item.selected === true);
	}

	keepEvent(e) {
		const pos = getEventPosition(e);

		const selectedObj = this.getSelectedObject();
		selectedObj.hover(pos);
		this.testCoverage(selectedObj);
	}
	
	
	testCoverage() {



		// check errorCoverage property in all objects
		const result = !this.card.errorCoverage && this.items.filter( i => i.errorCoverage === true).length === 0;

		// if result is different from previous check perform callback
		if (result !== this.testCardCoverageResult) {
			this.handleCardCoverage(result);
			this.testCardCoverageResult = result;
		}
		
	}

	finishEvent (e) {
		const selectedObj = this.getSelectedObject();
		selectedObj.done();

		this.removeItems();
	}
	
	removeItems() {
		// remove items that out of template area
		const items  = this.items.filter( i => i.removed !== true);
		if (items.length != this.items.length) {
			// make card selected
			this.card.selected = true;
			this.items = items;
		}
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
			const pos = getEventPosition(e);
			console.log('image id', imageId, imageUrl, getEventPosition(e));
			const  cardItem =  this.addImageItem(imageId, imageUrl, {initialPosition: pos});
			cardItem.originPoint = getEventPosition(e);


		}
	}

	addImageItem(id, url, options ={}) {


		const itemArea = this.designerSettings.Coverage.Logo;


		// remove previously selected object
		this.card.selected = false;
		this.items.forEach( item => item.selected = false );

		const canvasCenter = {
			x: this.ctx.canvas.width / 2,
			y: this.ctx.canvas.height / 2,
		};



		const coverageArea = {
			x: canvasCenter.x - this.templateArea.width /2 + itemArea.Left,
			y: canvasCenter.y - this.templateArea.height /2 + itemArea.Top,
			width:  itemArea.Right  - itemArea.Left,
			height: itemArea.Bottom - itemArea.Top
		};



		const cardItem = new CardItem(id, url, {
			coverageArea,
			templateArea: this.templateArea,
			initialPosition: options.initialPosition
		});
		this.items.push(cardItem);

		this.removeItems();


		return cardItem;

	}


	// itemOutOfArea() {
	// 	this.ctx.font = '12px Arial';
	// 	this.ctx.fillStyle = '#000';
	// 	this.ctx.fillText('Overlap', 10, 10);
	// }

}



export default Canvas;