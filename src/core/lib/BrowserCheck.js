export default class BrowserCheck {

	getAndroidVersion(ua) {
		ua = (ua || navigator.userAgent).toLowerCase();
		const match = ua.match(/android\s([0-9\.]*)/);
		return match ? parseFloat(match[1]) : false;
	}

	getIOSversion() {
		if (/iP(hone|od|ad)/.test(navigator.platform)) {
			// supports iOS 2.0 and later: <https://bit.ly/TJjs1V>
			const v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			//return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
			return v ? parseInt(v[1], 10) : false;
		}
	}

	getIEVersion() {
		const ua = window.navigator.userAgent;

		// Test values; Uncomment to check result …

		// IE 10
		// ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

		// IE 11
		// ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

		// Edge 12 (Spartan)
		// ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

		// Edge 13
		// ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

		const msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		const trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		const edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// Edge (IE 12+) => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return false;
	}

	getChromeVersion(){
		const ua = window.navigator.userAgent;

		const chrome = ua.indexOf('Chrome');
		if (chrome > 0) {
			return parseInt(ua.substring(chrome + 7, ua.indexOf('.', chrome)), 10);
		}
	}

	// check mobile devices and IE for minimal supported version
	// expects input data  in format {ie: 11, android: 4.4: ios: 9}
	isVersionSupported ( version =  {}) {

		let result = true;
		if (version.android) {
			const androidVersion = this.getAndroidVersion();
			if (androidVersion) {
				result = androidVersion >= version.android;
			}
		}

		if (version.ios) {
			const iosVersion = this.getIOSversion();
			if (iosVersion) {
				result = iosVersion >= version.ios;
			}
		}

		if (version.ie) {
			const ieVersion = this.getIEVersion();
			if (ieVersion) {
				result = ieVersion >= version.ie;
			}
		}

		if (version.chrome) {
			const chromeVersion = this.getChromeVersion();
			if (chromeVersion) {
				result = chromeVersion >= version.chrome;
			}
		}

		return result;
	};
}