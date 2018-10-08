
class Dropdown {
	constructor(el, items, opts ={}) {
		this.el = el;
		this.items = [];
		this.placeHolder = '';


		// create placeholder
		this.placeHolder = document.createElement('span');
		this.el.appendChild(this.placeHolder);

		// create ul
		this.itemsContainer  = document.createElement('ul');
		this.itemsContainer.className = 'dropdown';

		this.el.appendChild(this.itemsContainer);


		this.onItemSelected = opts.onItemSelected || (() => {});

		if (items) {
			this.addItems(items);
		}



		this.selectedItemId = opts.selectedItemId || ( this.items.length > 0 ? this.items[0].id : null);
		this.setActiveItem(this.selectedItemId);


		this.el.onclick = () => {
			this.el.classList.toggle('active');
		}

	}


	addItems(items) {

		for(const item of items) {
			this.addItem(item);
		}
	}


	addItem(item) {

		const addOption = (id, name)  =>{

			const renderedItem = document.createElement('li');
			renderedItem.className = 'list-item';
			renderedItem.id = id;

			const link = document.createElement('a');
			link.setAttribute('href', '#');
			link.id = id;
			link.innerHTML = name;
			link.onclick = (e) => {
				e.preventDefault();
				const id = +e.target.id;
				this.setActiveItem(id);

			};
			renderedItem.appendChild(link);


			return renderedItem;
		};

		const id = item.Id || item.id;
		this.itemsContainer.appendChild(addOption(id, item.name));
		this.items.push({id, name: item.name});
	}

	setActiveItem(id) {

		const selectedItem = this.items.find( item => item.id === id);
		if (selectedItem) {
			this.selectedItemId = selectedItem.id;
			this.placeHolder.innerHTML = selectedItem.name;
			this.onItemSelected(this.selectedItemId);
		}
	}


	findByName(name) {
		return this.items.find( item =>  item.name === name);
	}


}


export default Dropdown;


