export default {

	// isTouchDevice: function () {
	// 	return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	// }
	supportTouch : null,


	isTouchDevice: function() {

		// check touch suppor only once
		if (this.supportTouch == null) {
			const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
			const mq = function(query) {
				return window.matchMedia(query).matches;
			};

			if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
				return true;
			}

			// include the 'heartz' as a way to have a non matching MQ to help terminate the join
			// https://git.io/vznFH
			const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
			this.supportTouch = mq(query);
		}

		return this.supportTouch;
	}
	
};