import template from '../templates/doodle-control.tmpl';

import {DOODLE} from '../../../core/canvas/itemTypes'

export default class DoodleControl {
	constructor ( parentElement, canvas, options = {}) {

		this.onClose = options.onClose || (() => {});

		this.parentElement = parentElement;
		this.el = document.createElement('div');

		this.el.innerHTML = template;
		this.el.className = 'doodle-feature feature';

		this.render(canvas);

		this.parentElement.appendChild(this.el);


		this.doodleColor = '#ffffff';
	}


	render(canvas) {


		$('#doodle-color', this.el).spectrum({
			color: this.doodleColor,
			containerClassName: 'awesome',
			move: (color) => {

				this.doodleColor = color.toHexString();

				const obj = canvas.getSelectedObject();
				if (obj && obj.type === DOODLE) {
					obj.setLineColor(this.doodleColor);
				}

			}
		});


		if (!canvas.hasDoodle()) {
			canvas.addDoodleItem({
				lineWidth: this.el.querySelector('#doodle-line-width').value,
				lineColor: this.doodleColor
			});
		}

		this.el.querySelector('#btn-doodle-clear').onclick = () => {
			const obj = canvas.getSelectedObject();
			if (DOODLE === obj.type) {
				obj.clear();
			}
		};

		this.el.querySelector('#btn-doodle-undo').onclick = () => {
			const obj = canvas.getSelectedObject();
			if (DOODLE === obj.type) {
				obj.undo();
			}
		};

		this.el.querySelector('#doodle-line-width').oninput = (e) => {
			const obj = canvas.getSelectedObject();
			if (obj && obj.type === DOODLE) {
				obj.setLineWidth(+e.target.value);
			}
		};

	}

}