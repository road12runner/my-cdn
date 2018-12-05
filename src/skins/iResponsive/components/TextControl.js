import template from '../templates/text-control.tmpl';

import {TEXT} from '../../../core/canvas/itemTypes'

export default class TextControl {
	constructor ( parentElement, canvas, options = {}) {

		this.onClose = options.onClose || (() => {});

		this.parentElement = parentElement;
		this.el = document.createElement('div');

		this.el.innerHTML = template;
		this.el.className = 'text-feature feature';

		this.render(canvas);

		this.parentElement.appendChild(this.el);

	}


	render(canvas) {
		this.el.querySelector('#btn-text-add').onclick = () => {
			const textValue = this.el.querySelector('#text-field').value;
			canvas.addTextItem('test', textValue);
		};

		this.el.querySelector('#btn-text-bold').onclick = () => {
			const obj = canvas.getSelectedObject();
			if (obj && obj.type === TEXT) {
				const font = obj.getFontStyle();
				font.bold = !font.bold;
				obj.setFontStyle(font);
			}

		};

		this.el.querySelector('#btn-text-italic').onclick = () => {
			const obj = canvas.getSelectedObject();
			if (obj && obj.type === TEXT) {
				const font = obj.getFontStyle();
				font.italic = !font.italic;
				obj.setFontStyle(font);
			}
		};

		this.el.querySelector('#btn-text-shadow').onclick = () => {
			const obj = canvas.getSelectedObject();
			if (obj && obj.type === TEXT) {
				const font = obj.getFontStyle();
				font.shadow = !font.shadow;
				obj.setFontStyle(font);
			}
		};

		this.el.querySelector('#btn-text-stroke').onclick = () => {

			const obj = canvas.getSelectedObject();
			if (obj && obj.type === TEXT) {
				const font = obj.getFontStyle();
				font.stroke = !font.stroke;
				obj.setFontStyle(font);
			}

		};

		this.el.querySelector('#text-field').oninput = (e) => {
			//canvas.setText(e.target.value);
			const obj = canvas.getSelectedObject();
			if (obj && obj.type === TEXT) {
				obj.setText(e.target.value);
			}

		};

		console.log('text', $('#text-color', this.el));


		$('#text-color', this.el).spectrum({
			containerClassName: 'awesome',
			move: (color) => {

				const obj = canvas.getSelectedObject();
				if (obj && obj.type === TEXT) {
					const font = obj.getFontStyle();
					font.color = color.toHexString();
					obj.setFontStyle(font);
				}

			}
		});

	}

}