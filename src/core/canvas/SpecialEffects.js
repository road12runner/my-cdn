


export const SPECIAL_EFFECTS_INTENSITY = {
	LOW: 1,
	MEDIUM: 2,
	HIGH: 3
};


export const AVAILABLE_EFFECTS = [
	{id: 0, name: 'amaro', caption: 'Amaro', data: [ {lut: 'amaro_100.png'}, {lut: 'amaro_100-2.png', alpha: 'mask.jpg'}]},
	//{id: 0, name: 'amaro', caption: 'Amaro', data: [ {lut: 'amaro_100.png'}, {lut: 'amaro_100-2.png'}]},
	// {id: 1, name: 'inkwell', caption: 'Inkwell', data: [{lut: 'inkwell_100.png', baselineLut: 'inkwell_0.png'}]},
	// {id: 2, name: 'clarendon', caption: 'Clarendon', data:[{lut: 'clarendon_100.png'}]},
	// {id: 3, name: 'gingham', caption: 'Gingham', data: [{lut: 'gingham_100.png'}]},
	// {id: 4, name: 'juno', caption: 'Juno', data: [{lut: 'juno_100.png'}]},
	// {id: 5, name: 'lark', caption: 'Lark', data: [{lut: 'lark_100.png'}]},
	// {id: 6, name: 'lofi', caption: 'Lofi', data: [{lut: 'lofi_100.png'}]},
	// {id: 7, name: 'ludwig', caption: 'Ludwig', data: [{lut: 'ludwig_100.png'}]},
	// {id: 8, name: 'valencia', caption: 'Valencia', data: [{lut: 'valencia_100.png'}]},
	// {id: 9, name: 'xpro2', caption: 'Xpro2', data: [{lut: 'xpro2_100.png'}]}
];



const INTENSITY_MAP = {
	1: 30,
	2: 65,
	3: 100
};



/**
 *
 * Blend second imageData into first, using opacity if given.
 *
 * @param {ImageData} base - bottom layer
 * @param {ImageData} top - top layer
 * @param {int} [alpha] - optional opacity of top layer, 1-100
 *
 * @returns {ImageData}
 */
function blendLayers(base, top, opacity = 0) {
	const bData = base.data;
	const tData = top.data;
	const alpha = opacity / 100 || 1;

	for (let i = 0, l = bData.length; i < l; i += 4) {
		let rA, gA, bA, aA, rB, gB, bB, aB, rOut, gOut, bOut, aOut;

		rA = tData[i];
		gA = tData[i + 1];
		bA = tData[i + 2];
		aA = tData[i + 3] * alpha;
		rB = bData[i];
		gB = bData[i + 1];
		bB = bData[i + 2];
		aB = bData[i + 3];

		rOut = rA * aA / 255 + rB * aB * (255 - aA) / (255 * 255);
		gOut = gA * aA / 255 + gB * aB * (255 - aA) / (255 * 255);
		bOut = bA * aA / 255 + bB * aB * (255 - aA) / (255 * 255);
		aOut = aA + aB * (255 - aA) / 255;

		bData[i] = rOut;
		bData[i + 1] = gOut;
		bData[i + 2] = bOut;
		bData[i + 3] = aOut;
	}

	return base;
}


function lutToData (baselineLutImage, lutImage, intensity) {
	const lutCanvas = document.createElement('canvas');
	lutCanvas.width = lutImage.width;
	lutCanvas.height = lutImage.height;

	const lutContext = lutCanvas.getContext('2d');
	lutContext.drawImage(lutImage, 0, 0);

	const lut = lutContext.getImageData(
		0,
		0,
		lutImage.naturalWidth,
		lutImage.naturalHeight
	);

	lutContext.clearRect(0, 0, lutImage.naturalWidth, lutImage.naturalHeight);
	lutContext.drawImage(baselineLutImage, 0, 0);

	const baselineLut = lutContext.getImageData(
		0,
		0,
		lutImage.naturalWidth,
		lutImage.naturalHeight
	);
	const blended = blendLayers(baselineLut, lut, intensity);
	lutContext.putImageData(blended, 0, 0);

	return blended.data;
}



class SpecialEffects {
	constructor (opts = {}) {
		this.publicPath = opts.publicPath || '/filters/';
		this.gradingCanvas = document.createElement('canvas');
		this.gradingContext = this.gradingCanvas.getContext('2d');

		this.maxSize = opts.maxSize || {width: 720, height: 1500};

		this.baselineLut = 'baseline_lut.png';

		this.baseImage = new Image();
		this.imageSize = [];
		this.filters = [];

	}

	// setImage (src, callback) {
	//
	// 	this.baseImage.onload = () => {
	// 		// constrain size
	// 		const w = this.baseImage.width;
	// 		const h = this.baseImage.height;
	// 		const horizontal = w > h;
	// 		let scale;
	// 		if (horizontal) {
	// 			scale = Math.min(1, this.maxSize[0] / w);
	// 		} else {
	// 			scale = Math.min(1, this.maxSize[1] / h);
	// 		}
	//
	// 		const width = Math.round(w * scale);
	// 		const height = Math.round(h * scale);
	// 		this.imageSize = [width, height];
	// 		this.gradingCanvas.width = width;
	// 		this.gradingCanvas.height = height;
	// 		this.gradingContext.drawImage(this.baseImage, 0, 0, width, height);
	// 		this.baseImage.onload = undefined;
	// 		this.baseImage.src = this.gradingCanvas.toDataURL();
	//
	// 		callback && callback();
	// 	};
	//
	// 	this.baseImage.src = src;
	// }

	async loadEffects (effects) {
		this.effects = AVAILABLE_EFFECTS.filter(effect => effects.indexOf(effect.name) !== -1);

		console.log('selected effects', this.effects);

		for (const effect of this.effects) {

			for (const effectData of effect.data) {
				await this.loadEffect(effectData);
			}

		}

		return this.effects;

	}

	async loadEffect (filter) {

		const loadAsset = (imgPath) => {

			return new Promise(resolve => {
				const img = new Image();
				//TODO absolute path should be fixed depends on env, as the plugin might called from customer host
				img.src = location.href.substr(0, location.href.lastIndexOf('/')) + this.publicPath + imgPath;
				img.onload = () => {
					resolve(img);
				}

			});
		};

		filter.baselineLutImage = await loadAsset(filter.baselineLut || this.baselineLut);
		filter.lutImage = await loadAsset(filter.lut);
		if (filter.alpha) {
			filter.alphaImage = await loadAsset(filter.alpha);
		}

		console.log('loaded filter', filter);

		return filter;

	}

	reset () {
		const image = this.baseImage;
		this.gradingContext.clearRect(0, 0, this.imageSize[0], this.imageSize[1]);
		this.gradingContext.drawImage(image, 0, 0);
	};


	/**
	 * Process the image
	 */
	process (image, intensity, callback) {

		/**
		 * @param {HTML Element} baseImageCtx - context containing the original image data to apply the LUT to
		 * @param {Image} lut - Lookup table
		 * @param {Image} alpha - Alpha channel image, if supplied applies as alpha channel, if null opaque image returned
		 *
		 * @returns {Image} Image with LUT applied
		 */
		const applyLut =  (baseImageCtx, {width, height}, intensity, lut, baselineLut, alpha) => {
			// const width = baseImageCtx.canvas.width;
			// const height = baseImageCtx.canvas.height;

			const baseImageData = baseImageCtx.getImageData(
				0,
				0,
				width,
				height
			);

			const iData = baseImageData.data;

			const testData = [...iData];

			const lData = lutToData(baselineLut, lut, intensity);
			let aData = null;

			if (alpha) {
				const alphaCanvas = document.createElement('canvas');
				alphaCanvas.width = width;
				alphaCanvas.height = height;
				alphaCanvas.getContext('2d').drawImage(alpha, 0, 0, width, height);
				aData = alphaCanvas.getContext('2d').getImageData(0, 0, width, height).data;
			}

			for (let i = 0, l = iData.length; i < l; i += 4) {
				let r, g, b;

				r = Math.floor(iData[i] / 4);
				g = Math.floor(iData[i + 1] / 4);
				b = Math.floor(iData[i + 2] / 4);

				let lutX, lutY, lutIndex;

				lutX = b % 8 * 64 + r;
				lutY = Math.floor(b / 8) * 64 + g;
				lutIndex = (lutY * lut.naturalWidth + lutX) * 4;

				let lutR, lutG, lutB, lutA;

				lutR = lData[lutIndex];
				lutG = lData[lutIndex + 1];
				lutB = lData[lutIndex + 2];

				iData[i] = lutR;
				iData[i + 1] = lutG;
				iData[i + 2] = lutB;

				lutA = alpha ? aData[i] : 255; //Grayscale mask, all RBG values are the same.
				iData[i + 3] = lutA;
			}

			if (alpha) {
				console.log(JSON.stringify(testData) === JSON.stringify(baseImageData.data));
			}

			return baseImageData;
		};



		if (!this.filters) {
			throw new Error('loadEffects() should be executed prior to call process() function');
		}


		//this.reset();

		let {width, height} = image;
		const horizontal = width > height;
		let scale = 1;
		if (horizontal) {
			scale = Math.min(1,this.maxSize.width / width);
		} else {
			scale = Math.min(1,this.maxSize.height / height);
		}

		width = (width * scale);
		height = (height * scale);



		this.gradingCanvas.width = width;
		this.gradingCanvas.height = height;
		this.gradingContext.drawImage(image, 0, 0, width, height);



		const imageCanvas = document.createElement('canvas');
		imageCanvas.width = width;
		imageCanvas.height = height;

		const baseImageCtx = imageCanvas.getContext('2d');
		baseImageCtx.drawImage(image, 0, 0);


		const intens = INTENSITY_MAP[intensity];

		for (const effect of this.effects) {

			const layers = effect.data.map(filter => {

				return applyLut(
					baseImageCtx,
					{width, height},
					intens,
					filter.lutImage,
					filter.baselineLutImage,
					filter.alphaImage
				);
			});

			let composedImageData;
			if (layers.length === 0) {
				composedImageData = layers[0];
			} else {

				composedImageData = layers.slice(1).reduce((carry, layer) => {
					return blendLayers(carry, layer);
				}, layers[0]);
			}

			this.gradingCanvas.getContext('2d').putImageData(composedImageData, 0, 0);
			const imgData = this.gradingCanvas.toDataURL();
			callback({
				effect,
				image: imgData
			});


		}
	}



}



export default SpecialEffects;