import {bytesToSize, secondsToTime} from './helpers';

export const UPLOAD_ERRORS = {
	TYPE_ERROR: 'type-error',
	MIN_SIZE: 'min-size',
	MAX_SIZE: 'max-size'
};


export const UPLOAD_EVENTS = {
	ERROR: 'error',
	SUBMIT: 'submit',
	COMPLETE: 'complete',
	PROGRESS: 'progress',
	UPLOAD: 'upload'
};

class Upload {
	constructor (request, input, opt = {}) {
		this._preview = opt.preview || new Image();
		this._request = request;
		this._validation = opt.validation || {
			allowedExtensions : ['jpeg', 'jpg', 'png', 'gif', 'bmp'],
			acceptFiles : 'image/*',
			sizeLimit : 10485760,
			minSizeLimit : 1

		};
		this._autoUpload = opt.autoUpload || false;
		this._previousBytesLoaded = 0;
		this._input = input;
		this._reset();


		const callbacks = opt.callbacks || {};

		this.onError = callbacks.onError || function(){};
		this.onSubmit = callbacks.onSubmit || function(){};
		this.onProgress = callbacks.onProgress || function(){};
		this.onComplete = callbacks.onComplete || function(){};
		this.onUpload = callbacks.onUpload || function(){};


		const fileSelected = () => {

			// get selected file element
			const oFile = this._input.files[0];

			this._fileName = oFile.name;

			this.onSubmit( {filename: this._fileName});

			if (this._validation.allowedExtensions.indexOf(oFile.type.replace('image/', '')) === -1) {
				return this.error(UPLOAD_ERRORS.TYPE_ERROR);
			}

			// max file size
			if (oFile.size > this._validation.sizeLimit) {
				return this.error(UPLOAD_ERRORS.MAX_SIZE);
			}

			// min file size
			if (oFile.size < this._validation.minSizeLimit) {
				return this.error(UPLOAD_ERRORS.MIN_SIZE);
			}

			// prepare HTML5 FileReader
			const oReader = new FileReader();
			oReader.onload = e => {

				// e.target.result contains the DataURL which we will use as a source of the image
				this._preview.src = e.target.result;
				this._preview.onload = () => { // binding onload event
					// we are going to display some custom image information here
					const sResultFileSize = bytesToSize(oFile.size);

					if (this._validation.minSize && (this._preview.naturalWidth < this._validation.minSize.Width || this._preview.naturalHeight < this._validation.minSize.Height))
						return this.error('minSizeError');

					const _fileInfo = {
						size: sResultFileSize,
						type: oFile.type,
						dimension: {width: this._preview.naturalWidth, height: this._preview.naturalHeight}
					};

					if (this._autoUpload) {
						startUploading(this._fileName, _fileInfo);
					}


				};
			};

			// read selected file as DataURL
			oReader.readAsDataURL(oFile);
		};

		const startUploading = (fileName, fileInfo) => {
			this.onUpload({fileName, fileInfo});

			const data = new FormData();

			for (let i = 0; i < this._input.files.length; i++) {
				data.append(i,this._input.files.item(i));
			}


			// create XMLHttpRequest object, adding few event listeners, and POSTing our data
			const oXHR = new XMLHttpRequest();
			oXHR.upload.addEventListener('progress', e => this.progress(e), false);
			oXHR.addEventListener('load', e => this.complete(e), false);
			oXHR.addEventListener('error', e => this.error(e), false);
			oXHR.addEventListener('abort', e => this.error(e), false);
			oXHR.open('POST', this._request);
			oXHR.send(data);

		};

		this._input.onchange = () => fileSelected();

	}

	_reset () {
		this._fileName = null;
		this._bytesUploaded = 0;
		this._previousBytesLoaded = 0;
		this._bytesTotal = 0;
		this._percentComplete = 0;
	}


	error (reason) {
		this.onError(reason);
	}


	progress (e) { // upload process in progress
		console.log('progress', e);


		const doInnerUpdates = () => { // we will use this function to display upload speed
			let iCB = this._bytesUploaded;
			let iDiff = iCB - this._previousBytesLoaded;

			// if nothing new loaded - exit
			if (iDiff === 0) {
				return;
			}

			this._previousBytesLoaded = iCB;
			iDiff = iDiff * 2;
			let iBytesRem = this._bytesTotal - this._previousBytesLoaded;
			let secondsRemaining = iBytesRem / iDiff;

			// update speed info
			let iSpeed = iDiff.toString() + 'B/s';
			if (iDiff > 1024 * 1024) {
				iSpeed = (Math.round(iDiff * 100 / (1024 * 1024)) / 100).toString() + 'MB/s';
			} else if (iDiff > 1024) {
				iSpeed = (Math.round(iDiff * 100 / 1024) / 100).toString() + 'KB/s';
			}

			this.onProgress({
				filename: this._fileName,
				bytesUploaded: this._bytesUploaded,
				bytesTotal: this._bytesTotal,
				percentComplete: this._percentComplete,
				speed: iSpeed,
				secondsRemain: secondsToTime(secondsRemaining)
			});
		};

		if (e.lengthComputable) {
			this._bytesUploaded = e.loaded;
			this._bytesTotal = e.total;
			this._percentComplete = Math.round(e.loaded * 100 / e.total);

			doInnerUpdates();
		} else {
			this.error('cantCompute');
		}
	}

	// upload successfully finished
	complete (e) {
		console.log('complete', e);
		if (e.target.status === 200) {

			// check for real time image rejection

			// success
			this.onComplete({
				fileName: this._fileName,
				result: JSON.parse(e.target.responseText)
			})
		} else {
			this.error(e.target.responseText);
		}



	}


}

export default Upload;