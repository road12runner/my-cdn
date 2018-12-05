import template from './templates/preview.tmpl';
import AppSettings from '../../core/AppSettings';
import localize from   '../../core/localize';

export default class Preview {
	constructor (parentElement, img, options = {}) {

		this.parentElement = parentElement;

		this.renderedTemplate = template;


		this.el = document.createElement('div');
		this.el.className= 'preview';
		this.el.innerHTML = this.renderedTemplate;


		//TODO improve adding gallery
		const designer = this.parentElement.querySelector('.designer');
		this.parentElement.insertBefore(this.el, designer);


		const previewContainer = this.el.querySelector('#preview-container');

		previewContainer.appendChild(img);

		localize(this.el, AppSettings.Language);

		this.onClose = options.onClose || (() => {});
		this.onNext = options.onNext || (() => {});


		this.el.querySelector('#btn-back').onclick = () => {
			// return back
			this.parentElement.removeChild(this.el);
			this.onClose();
		};

		this.el.querySelector('#btn-next').onclick = () => {
			this.parentElement.removeChild(this.el);
			this.onNext();
		};




		if (AppSettings.isCustomImage) {
			const previewWarning = document.createElement('div');
			previewWarning.className = 'preview-warning';

			const warningTitle = document.createElement('h3');
			warningTitle.className == 'preview-warning--title';

			const warningList = document.createElement('ul');
			warningTitle.className == 'preview-warning--list';

			previewWarning.appendChild(warningTitle);
			previewWarning.appendChild(warningList);

			const keys = Object.keys(AppSettings.Language.previewWarning);
			keys.forEach( key => {
				if (key.indexOf('_') > -1) {
					// create list item
					const waringListItem = document.createElement('li');
					waringListItem.className == 'preview-warning--list-item';
					waringListItem.innerText = AppSettings.Language.previewWarning[key];

					warningList.appendChild(waringListItem);
				} else {
					//create title
					warningTitle.innerText = AppSettings.Language.previewWarning[key];
				}
			});

			previewContainer.appendChild(previewWarning);
			previewContainer.classList.add('with-warning');

		}




	}

}

//todo warning for custom images


