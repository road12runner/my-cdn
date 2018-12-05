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
	},

	isTextViewEnabled : function ()  {
		if (this.designerSettings) {
			return this.designerSettings.TextOnImage.Enabled && 'v' !== this.designerSettings.Orientation.Type;
		}
	},

	isLogoViewEnabled:  function ()  {
		if (this.designerSettings) {
			return this.isClipArtEnabled() !== true && this.designerSettings.Coverage.Logo != null;
		}
	},

	isClipArtEnabled: function ()  {
		if (this.designerSettings) {
			return  this.designerSettings.ClipArtEnabled === true;
		}
	},

	isDataCaptureEnabled : function () {
		console.log('this', this);
		if (this.designerSettings) {
			return this.designerSettings.DataCapture.EmailCapture === 'Enabled' || this.designerSettings.DataCapture.CustomDataCaptureEnabled === true;
		}
	},

	isFacebookEnabled: function () {
		if (this.designerSettings) {
			return  this.designerSettings.FacebookAppId && this.designerSettings.EnableFacebookButton;

		}
	},

	isSpecialEffectsEnabled: function () {
		if (this.designerSettings) {
			return this.designerSettings.SpecialEffects && this.designerSettings.SpecialEffects.Enabled === true && this.designerSettings.SpecialEffects.Effects.length > 0;

		}
	},
	isDoodleEnabled: function ()  {
		if (this.designerSettings) {
			return this.designerSettings.Doodle && this.designerSettings.Doodle.Enabled === true;

		}
	}
};