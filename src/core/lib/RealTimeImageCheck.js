import AppSettings from '../AppSettings';

const MATCHED_IMAGES = 'MatchedImages';

const WARING_TYPE = 2;
const ERROR_TYPE = 1;


export default class RealTimeImageCheck {

	constructor (options = {}) {
		var realTimeSettings = AppSettings.designerSettings.RealTimeImgChecking || {};
	}

	//TODO implement it

	//
	// 	function ($, errorTemplate, warningTemplate) {
	//
	//
	// 		/**
	// 		 * Real time image checker
	// 		 * App - app controller (required)
	// 		 * rootElement - parent root element (required). Warning or error templates will be attached to it
	// 		 * opt - options (optional)
	// 		 */
	// 		return function (App, rootElement, opts) {
	//
	// 			if (!App) {
	// 				throw 'App should be defined';
	// 			}
	//
	// 			if (!rootElement) {
	// 				throw 'Root scope should be defined';
	// 			}
	//
	// 			var that = this;
	// 			var options = opts || {};
	//
	//
	// 			function _init () {
	//
	// 				if (realTimeSettings.Enabled) {
	//
	// 					var template = ERROR_TYPE === realTimeSettings.WarningType ? _.template(errorTemplate, {resourceLocation: ServerSide.Configuration.Urls.Resources})
	// 						: template = _.template(warningTemplate, {resourceLocation: ServerSide.Configuration.Urls.Resources});
	// 					if (rootElement) {
	// 						$(rootElement).append(template);
	// 					}
	//
	// 					var language = new ServerSide.Framework.UI.Templating.RefLangTemplater(App.Designer);
	// 					language.Apply();
	//
	// 				}
	// 			}
	//
	// 			that.onNextButtonStatusChanged = options.onNextButtonStatusChanged || function (status) {};
	// 			that.onConfirmButtonClicked = options.onConfirmButtonClicked || function () {};
	//
	// 			// perform real time image check;
	// 			// passes back in callback the result of the check
	// 			that.check = function (callback) {
	//
	// 				var cb = callback || function () {};
	//
	// 				if (realTimeSettings.Enabled === true) {
	//
	// 					// to avoid repeated checks for next and prev actions cache the result of the previous check
	// 					var matchImages = ServerSide.Lib.Utils.SsgSerialiser.deserialise(MATCHED_IMAGES) || [];
	//
	// 					var imagesToCheck = _.chain(App.Layers).filter({Type: 'Custom'}).map( function(layer){
	// 						return layer.Id;
	// 					}).filter( function(id){
	// 						return matchImages[id] === undefined
	// 					}).value();
	//
	//
	//
	// 					if (imagesToCheck.length > 0) {
	// 						that.onNextButtonStatusChanged(false);
	// 						that.showLoader(true);
	//
	// 						var count =0;
	// 						_.each(imagesToCheck, function(imageId) {
	//
	// 							App.Designer.PerformRealTimeImageCheck(App.HandoverKey, imageId, function (result) {
	// 								count++;
	// 								matchImages[imageId] = {checkResult: result.checkResult};
	// 								ServerSide.Lib.Utils.SsgSerialiser.serialise(MATCHED_IMAGES, matchImages);
	// 								if (!result.checkResult && realTimeSettings.WarningType === ERROR_TYPE) { // denied
	// 									that.showLoader(false);
	// 									that.showDeniedMessage();
	// 									cb({result: false});
	// 								} else if (!result.checkResult && realTimeSettings.WarningType === WARING_TYPE) { //warning
	// 									that.showLoader(false);
	// 									that.showWarningMessage(cardId);
	// 									cb({result: false});
	// 								} else {
	//
	// 									if (count === imagesToCheck.length) {
	// 										that.showLoader(false);
	// 										that.onNextButtonStatusChanged(true);
	// 										cb({result: true});
	// 									}
	// 								}
	// 							});
	//
	// 						});
	//
	// 					} else {
	// 						cb({noImages: true});
	// 					}
	// 				} else {
	// 					cb({checkDisabled: true});
	// 				}
	//
	// 			};
	//
	// 			// hide or show progress indicator
	// 			that.showLoader = function (show) {
	// 				if (App.showLoader) {
	// 					if (show) {
	// 						App.showLoader($(rootElement));
	// 					} else {
	// 						App.hideLoader();
	// 					}
	// 				} else {
	// 					if (show) {
	// 						$('.loading').show();
	// 						$('.preview-content-container').addClass('content-disabled');
	// 						$('.tool-bar-container').addClass('content-disabled');
	// 					} else {
	// 						$('.loading').hide();
	// 						$('.preview-content-container').removeClass('content-disabled');
	// 						$('.tool-bar-container').removeClass('content-disabled');
	// 					}
	// 				}
	//
	// 			};
	//
	// 			// show denied message
	// 			that.showDeniedMessage = function () {
	// 				$('#copyright-warning', rootElement).hide();
	// 				$('#preview-container', rootElement).addClass('shifted-preview-container');
	// 				$('#realTimeCheckDenied', rootElement).show();
	// 				$('#denied-back-button', rootElement).click(function () {
	// 					that.previousAction();
	// 				});
	// 			};
	//
	// 			// show waring message
	// 			that.showWarningMessage = function (cardId) {
	// 				$('#copyright-warning', rootElement).hide();
	// 				$('#preview-container', rootElement).addClass('shifted-preview-container');
	// 				$('#realTimeCheckWarning', rootElement).show();
	// 				$('#warning-back-button', rootElement).on('click', function () {
	// 					that.previousAction();
	// 				});
	// 				$('#confirm-button', rootElement).on('click', function () {
	// 					that.onNextButtonStatusChanged(true);
	// 					var matchImages = ServerSide.Lib.Utils.SsgSerialiser.deserialise(MATCHED_IMAGES) || [];
	// 					matchImages[cardId].confirmed = true;
	// 					ServerSide.Lib.Utils.SsgSerialiser.serialise(MATCHED_IMAGES, matchImages);
	// 					$('#realTimeCheckWarning', rootElement).hide();
	// 					that.onConfirmButtonClicked();
	// 				});
	// 			};
	//
	//
	// 			that.previousAction = function () {
	// 				App.redirect('prev');
	// 			};
	//
	// 			_init();
	//
	// 		};
	// 	}
	// );
	//

}