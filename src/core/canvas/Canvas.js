import Card from './Card';
import ImageItem from './ImageItem';
import TextItem from './TextItem';

import AppSettings from '../AppSettings';

import { getEventPosition } from './canvas-helper';
import Hammer from 'hammerjs';
import * as api from "../net/api";

class Canvas {

	constructor (canvasElement, options = {}) {

		console.log('AppSettings', AppSettings);

		this.canvas = canvasElement ? document.querySelector(canvasElement) : document.createElement('canvas');
		if (!this.canvas.id) {
			this.canvas.id = 'ssg-temp-canvas';
		}

		this.ctx = this.canvas.getContext('2d');

		let {width, height} = options;
		if (!width || !height) {
			const rect = this.canvas.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
		}

		this.canvas.setAttribute('width', `${width}`);
		this.canvas.setAttribute('height', `${height}`);
		this.canvas.width = width;
		this.canvas.height = height;

		if (options.margin) {
			this.margin = options.margin;
		}

		if (options.isResponsible) {
			window.addEventListener('resize', () => this.handleResize());
		}

		this.handleCardCoverage = options.onCardCoverage || function () {};

		
		this.template = {
			width: (AppSettings.designerSettings.Desktop.Right - AppSettings.designerSettings.Desktop.Left) || 241,
			height: (AppSettings.designerSettings.Desktop.Bottom - AppSettings.designerSettings.Desktop.Top) || 153,
			initialSize :{
				width: (AppSettings.designerSettings.Desktop.Right - AppSettings.designerSettings.Desktop.Left) || 241,
				height: (AppSettings.designerSettings.Desktop.Bottom - AppSettings.designerSettings.Desktop.Top) || 153,
			}
		};
		
		

		// scale template size
		if (options.scale) {
			this.scale = options.scale;
			const ratio = this.template.width / this.template.height;
			this.template.width  *= options.scale;
			this.template.height = this.template.width / ratio;
		} else if (this.margin) { // or put margins
			
			const ratio = this.template.width / this.template.height;
			this.template.width  = this.canvas.width - (2 * this.margin);
			this.template.height = Math.floor(this.template.width / ratio);
		}

		this.items = [];

		const canvasCenter = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2
		};

		

		this.card = new Card(this.ctx, {
			coverageArea: {
				x: canvasCenter.x - this.template.width / 2,
				y: canvasCenter.y - this.template.height / 2,
				width: this.template.width,
				height: this.template.height,
			},
			image : {
				id: options.imageId,
				url: options.imageUrl
			}
		});


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

		// if (options.imageId && options.imageUrl) {
		// 	this.setImage(options.imageId, options.imageUrl);
		// }

		this.testCardCoverageResult = false;

		// load template image
		const img = new Image();
		img.crossOrigin = 'Anonymous';
		img.src = AppSettings.designerSettings.DesignTemplate.UrlLarge;
		img.onload = () => {
			this.template.image = img;
		}
		

	}

	// define touch events
	setTouchEvents () {
		const mc = new Hammer.Manager(this.canvas);
		// create a pinch and rotate recognizer
		// these require 2 pointers
		const pinch = new Hammer.Pinch();
		const rotate = new Hammer.Rotate();
		const pan = new Hammer.Pan();

		const tap = new Hammer.Tap({event: 'singletap'});

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
		mc.on('pinchmove', e => {
			const obj = this.getSelectedObject();
			obj.doZoom(e.scale);
			this.testCoverage();
		});
		mc.on('panstart', e => {
			this.getSelectedObject().startMove();
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

			function getPos (e) {
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

	
	// render images on canvas
	drawCard () {
		
		window.requestAnimationFrame(() => this.drawCard());
		
		
		if (!this.template.image) {
			return;
		}
		
		//clear canvas
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		
		// render card image
		this.card.render(this.ctx);
		
		//render other items (clipart, text, etc)
		this.items.forEach(item => item.render(this.ctx));
		
		//render template
		const x = this.canvas.width /2 - this.template.width /2;
		const y = this.canvas.height /2 - this.template.height /2;
		this.ctx.drawImage(this.template.image, x, y, this.template.width, this.template.height);

	}

	startEvent (e) {
		const pos = getEventPosition(e);
		console.log(pos);
		this.findSelectedObject(pos).click(pos);

	}

	findSelectedObject (pos) {
		// check if events happens in already selected item
		let selectedObject = null;
		let selectedItems = this.items.filter(item => item.selected === true && item.hitTest(pos));
		if (selectedItems.length === 1) {
			selectedObject = selectedItems[0];
		} else {

			for (const item of this.items) {
				if (!selectedObject && item.hitTest(pos)) {
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

	getSelectedObject () {
		return this.card.selected ? this.card : this.items.find(item => item.selected === true);
	}

	keepEvent (e) {
		const pos = getEventPosition(e);

		const selectedObj = this.getSelectedObject();
		selectedObj.hover(pos);
		this.testCoverage(selectedObj);
	}

	testCoverage () {



		// check errorCoverage property in all objects
		const result = !this.card.errorCoverage && this.items.filter(i => i.errorCoverage === true).length === 0;

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

	removeItems () {
		// remove items that out of template area
		const items = this.items.filter(i => i.removed !== true);
		if (items.length != this.items.length) {
			// make card selected
			this.card.selected = true;
			this.items = items;
		}
	}

	setImage (imageId, imageUrl) {
		this.card.setImage(imageId, imageUrl);
	}

	dragOver (e) {
		e.preventDefault();
	}

	drop (e) {
		e.preventDefault();

		const data = JSON.parse(e.dataTransfer.getData('text'));

		const imageId = +data.id;
		const imageUrl = data.url;
		if (imageId) {
			const pos = getEventPosition(e);
			console.log('image id', imageId, imageUrl, getEventPosition(e));
			const cardItem = this.addImageItem(imageId, imageUrl, {initialPosition: pos});
			cardItem.originPoint = getEventPosition(e);
		}
	}

	addImageItem (id, url, options = {}) {

		const itemArea = AppSettings.designerSettings.Coverage.Logo;

		// remove previously selected object
		this.card.selected = false;
		this.items.forEach(item => item.selected = false);

		const canvasScale = this.card.template.width / this.originalTemplateSize.width;

		const canvasCenter = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2
		};

		const templateArea = {
			width: this.card.width,
			height: this.card.height,
			x: -this.card.template.width / 2,
			y: -this.card.template.height / 2
		};

		const coverageArea = {
			x: (templateArea.x + itemArea.Left * canvasScale),
			y: (templateArea.y + itemArea.Top * canvasScale),
			width: ((itemArea.Right - itemArea.Left) * canvasScale),
			height: ((itemArea.Bottom - itemArea.Top) * canvasScale)
		};

		const cardItem = new ImageItem(id, url, {
			coverageArea,
			templateArea,
			canvasCenter,
			initialPosition: options.initialPosition,
			width: 50 * canvasScale,
			height: 50 * canvasScale
		});
		this.items.push(cardItem);

		this.removeItems();

		return cardItem;

	}

	getScale () {
		return this.card.template.width / this.originalTemplateSize.width;
	}

	addTextItem (id, text, options = {}) {


		//TODO add text coverage
		const itemArea = AppSettings.designerSettings.Coverage.Logo;

		// remove previously selected object
		this.card.selected = false;
		this.items.forEach(item => item.selected = false);

		const canvasScale = this.card.template.width / this.originalTemplateSize.width;
		
		const canvasCenter = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2
		};
		
		const templateArea = {
			width: this.card.width,
			height: this.card.height,
			x: -this.card.template.width / 2,
			y: -this.card.template.height / 2
		};
		
		const coverageArea = {
			x: (templateArea.x + itemArea.Left * canvasScale),
			y: (templateArea.y + itemArea.Top * canvasScale),
			width: ((itemArea.Right - itemArea.Left) * canvasScale),
			height: ((itemArea.Bottom - itemArea.Top) * canvasScale)
		};
		
		
		const cardItem = new TextItem('test', 'Hello World', this.ctx, {
			coverageArea,
			templateArea: this.templateArea,
			initialPosition: options.initialPosition,
		});
		this.items.push(cardItem);
		this.removeItems();
		return cardItem;
	}

	moveUp (val) {
		this.getSelectedObject().moveUp(val);
	}

	moveDown (val) {
		this.getSelectedObject().moveDown(val);
	}

	moveLeft (val) {
		this.getSelectedObject().moveLeft(val);
	}

	moveRight (val) {
		this.getSelectedObject().moveRight(val);
	}

	rotate (val) {
		this.getSelectedObject().rotate(val);
	}

	flip () {
		this.getSelectedObject().flip();
	}

	getConfiguration () {

		const canvasScale = this.card.template.width / this.originalTemplateSize.width;

		const items = this.items.map(i => i.getConfiguration(canvasScale));
		const card = this.card.getConfiguration(canvasScale);
		return {
			card,
			items
		};
	}

	getSnapshot () {
		return this.canvas.toDataURL();
	}

	handleResize () {
		const {width, height} = this.canvas.getBoundingClientRect();

		//if (width < this.canvas.width) {
		this.scale = width / this.canvas.width;
		this.canvas.width = width;
		this.canvas.height = height;
		this.card.handleResize(this.scale);
		this.items.forEach(item => item.handleResize(this.scale));

		//}

	}

	// create snapshot of the canvas as as png image
	static getPreviewImage (canvasObject, width, height) {
		console.log(canvasObject, width, height);

		const previewCanvas = document.createElement('canvas');
		previewCanvas.width = width;
		previewCanvas.height = height;
		const previewCanvasContext = previewCanvas.getContext('2d');

		const scale = {
			width: width / canvasObject.card.template.width,
			height: height / canvasObject.card.template.height
		};

		Card.preview(canvasObject.card, previewCanvasContext);
		canvasObject.items.forEach(item => item.constructor.name === 'ImageItem' ? ImageItem.preview(item, scale, previewCanvasContext) : TextItem.preview(item, scale, previewCanvasContext));

		//TODO remove previewCanvas ????
		return previewCanvas.toDataURL();
	}
	
	// submit canvas to the PCS
	submit() {
		
		
		// flat all layers
		const layers = [this.card, ...this.items];
		
		let count = 0;
		const cardLayers =[];
		
		const template = this.card.template;
		console.log(template);
		
		const canvasScale = this.getScale();
		console.log('canvasScale', canvasScale);
		
		const canvasCenter = {
			x: this.canvas.width /2,
			y: this.canvas.height /2
		};
		
		const templateLetTopCorner = {
			x: (canvasCenter.x - this.card.template.width /2) / canvasScale,
			y: (canvasCenter.y - this.card.template.height /2) /canvasScale
		};
		
		
		layers.forEach( (layer, i) => {
			
			api.submitLayer(AppSettings.handoverKey, layer.layerType).then( layerConfig => {
				console.log(layerConfig);
				count++;
				
				// get scaled layer coordinates
				const layerCoords = layer.getBoundRect();
				const layerWidth = (layerCoords.right - layerCoords.left) /canvasScale;
				const layerHeight = (layerCoords.bottom - layerCoords.top) / canvasScale;
				const layerLeftTopCorner = {
					x: (layerCoords.left + canvasCenter.x) /canvasScale - templateLetTopCorner.x,
					y: (layerCoords.top + canvasCenter.y) / canvasScale - templateLetTopCorner.y
				};
				
				const config = {
					Left: Math.floor(layerLeftTopCorner.x),
					Top: Math.floor(layerLeftTopCorner.y),
					Right: Math.floor(layerLeftTopCorner.x + layerWidth),
					Bottom: Math.floor(layerLeftTopCorner.y + layerHeight),
					Rotation: Math.floor(layer.rotation),
					Flip: layer.flipped ? 1: 0
					
				};
				
				// layerConfig.Configuration.Left = Math.floor( (layerCoords.left - template.x) / canvasScale);
				// layerConfig.Configuration.Top = Math.floor( (layerCoords.top - template.y) / canvasScale);
				// layerConfig.Configuration.Right = Math.floor((layerCoords.right - template.x) / canvasScale);
				// layerConfig.Configuration.Bottom = Math.floor(  (layerCoords.bottom - template.y) / canvasScale);
				// layerConfig.Configuration.Rotation = Math.floor(layer.rotation);
				// layerConfig.Configuration.Flip = layer.flipped ? 1: 0;
				
				layerConfig.Configuration = config;
				layerConfig.ImageId = layer.id;
				layerConfig.Order = i;
				
				cardLayers.push(layerConfig);
				
				//weird way to wait for all card layers submission
				if (count === layers.length ) {
					console.log('perform  submit request', layerConfig);
					submitCard(cardLayers);
				}
			});
			
		});
		
		
		
		
		
		
		function submitCard(layers = []) {
			
			const data = AppSettings.client;
			data.Layers = layers;
			
			api.submitCard(AppSettings.handoverKey, AppSettings.clientId, data).then( res => {
				console.log('submit response', res);
			})
		}
		
	}
	
	

}

export default Canvas;