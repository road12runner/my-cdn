import Card from './Card';
import CardItem  from './CardItem';
import AppSettings from '../AppSettings';

import {getEventPosition} from './canvas-helper'
import  Hammer from 'hammerjs';


class Canvas {

	constructor (canvasElement, options = {}) {


		console.log('AppSettings', AppSettings);

		this.canvas = canvasElement ? document.querySelector(canvasElement) : document.createElement('canvas');
		if (!this.canvas.id) {
			this.canvas.id = 'ssg-temp-canvas';
			//document.body.appendChild(this.canvas);
		}


		this.ctx = this.canvas.getContext('2d');


		if (options.preview) {
			// get template image size
			const {width, height} = options.config.card.template.image;
			console.log(width, height);
			this.canvas.setAttribute('width', `${width}`);
			this.canvas.setAttribute('height', `${height}`);

		} else {

			if (options.width) {
				this.canvas.setAttribute('width', `${options.width}`);
			}
			if (options.height) {
				this.canvas.setAttribute('height', `${options.height}`);
			}
		}


		this.canvas.onresize = () => {
			console.log('canvas resizing...');
		};


		this.preview = options.preview;

		this.handleCardCoverage = options.onCardCoverage || function() {};

		let templateWidth =  (AppSettings.designerSettings.Desktop.Right - AppSettings.designerSettings.Desktop.Left) || 241;
		let templateHeight = (AppSettings.designerSettings.Desktop.Bottom - AppSettings.designerSettings.Desktop.Top) || 153;

		if (options.scale) {
			const ratio = templateWidth / templateWidth;
			templateWidth *= options.scale;
			templateWidth *= ratio;
		}

		this.items = [];


		if (options.preview) {
			//fit template area to whole available size
			console.log('config', options.config);

			this.templateArea = {
				x: 0,
				y: 0,
				width: this.canvas.width,
				height :this.canvas.height,
			};
		} else {

			const canvasCenter =  {
				x: this.canvas.width / 2,
				y: this.canvas.height / 2
			};

			this.templateArea = {
				x: canvasCenter.x - templateWidth /2,
				y: canvasCenter.y - templateHeight /2,
				width: templateWidth,
				height: templateHeight,
			};

		}

		this.card = new Card({
			templateArea : this.templateArea,
			templateUrl: AppSettings.designerSettings.DesignTemplate.UrlLarge,
			preview: options.preview,
			config: options.config ? options.config.card : null,
		});





		if (options.config && options.config.items.length > 0) {
			console.log('add items', options.config.items);

			this.items = options.config.items.map( i => {
				i.cardTemplateArea = options.config.card.template;
				return new CardItem( i.id, i.imageUrl, {preview: true, config: i, templateArea: this.templateArea});
			});


		}

		if (!options.preview) {
			if (options.touchDevice) {
				this.setTouchEvents();
			} else {
				// mouse events
				this.canvas.addEventListener('mousedown', e => this.startEvent(e));
				this.canvas.addEventListener('mousemove', e => this.keepEvent(e));
				this.canvas.addEventListener('mouseup', e => this.finishEvent(e));
			}

			// drag drop events
			this.canvas.addEventListener('dragover', e => this.dragOver(e));
			this.canvas.addEventListener('drop', e => this.drop(e));

			window.requestAnimationFrame(() => this.drawCard());
		} else {
			this.drawCard();
		}



		if (options.imageId && options.imageUrl) {
			this.setImage(options.imageId, options.imageUrl);
		}



		this.testCardCoverageResult = false;



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
			this.getSelectedObject().endMove();
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

		if (!this.preview) {
			window.requestAnimationFrame(() => this.drawCard());
		}


	}

	startEvent(e) {
		const pos = getEventPosition(e);
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

	setImage(imageId, imageUrl) {
		this.card.setImage(imageId, imageUrl);
	}


	dragOver(e) {
		e.preventDefault();
	}

	drop(e) {
		e.preventDefault();

		const data = JSON.parse(e.dataTransfer.getData('text'));



		const imageId = +data.id;
		const imageUrl  = data.url;
		if (imageId) {
			const pos = getEventPosition(e);
			console.log('image id', imageId, imageUrl, getEventPosition(e));
			const  cardItem =  this.addImageItem(imageId, imageUrl, {initialPosition: pos});
			cardItem.originPoint = getEventPosition(e);
		}
	}

	addImageItem(id, url, options ={}) {


		const itemArea = AppSettings.designerSettings.Coverage.Logo;


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


	moveUp(val) {
		this.getSelectedObject().moveUp(val);
	}

	moveDown(val) {
		this.getSelectedObject().moveDown(val);
	}

	moveLeft(val) {
		this.getSelectedObject().moveLeft(val);
	}


	moveRight(val) {
		this.getSelectedObject().moveRight(val);
	}


	rotate(val) {
		this.getSelectedObject().rotate(val);
	}

	flip() {
		this.getSelectedObject().flip();
	}


	getConfiguration(){

		const items =this.items.map(i => i.getConfiguration());
		const card = this.card.getConfiguration();
		return {
			card,
			items
		}
	}

	getSnapshot() {
		return this.canvas.toDataURL();
	}

}



export default Canvas;