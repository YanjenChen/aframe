var registerComponent = require('../../core/component').registerComponent;
var constants = require('../../constants/');
var utils = require('../../utils/');
var bind = utils.bind;

var ENTER_AR_CLASS = 'a-enter-ar';
var ENTER_AR_BTN_ID = 'a-enter-ar-button';
var HIDDEN_CLASS = 'a-hidden';

/**
 * UI for entering VR mode.
 */
module.exports.Component = registerComponent('ar-mode-ui', {
  dependencies: ['canvas'],

  schema: {
    enabled: {default: true},
    enterARButton: {default: ''}
  },

  init: function () {
    var self = this;
    var sceneEl = this.el;

    if (utils.getUrlParameter('ui') === 'false') { return; }

    this.insideLoader = false;
    this.enterAREl = null;
    this.bindMethods();

    // Hide/show VR UI when entering/exiting VR mode.
    sceneEl.addEventListener('enter-ar', this.updateEnterARInterface);

    window.addEventListener('message', function (event) {
      if (event.data.type === 'loaderReady') {
        self.insideLoader = true;
        self.remove();
      }
    });
  },

  bindMethods: function () {
    this.onEnterARButtonClick = bind(this.onEnterARButtonClick, this);
    this.updateEnterARInterface = bind(this.updateEnterARInterface, this);
  },

  /**
   * Enter VR when modal clicked.
   */
  onEnterARButtonClick: function () {
    this.el.enterAR();
  },

  update: function () {
    var data = this.data;
    var sceneEl = this.el;

    if (!data.enabled || this.insideLoader || utils.getUrlParameter('ui') === 'false') {
      return this.remove();
    }
    if (this.enterAREl) { return; }

    // Add UI if enabled and not already present.
    if (data.enterARButton) {
      // Custom button.
      this.enterAREl = document.querySelector(data.enterARButton);
      this.enterAREl.addEventListener('click', this.onEnterARButtonClick);
    } else {
      this.enterAREl = createEnterARButton(this.onEnterARButtonClick);
      sceneEl.appendChild(this.enterAREl);
    }

    this.updateEnterARInterface();
  },

  remove: function () {
    [this.enterAREl].forEach(function (uiElement) {
      if (uiElement && uiElement.parentNode) {
        uiElement.parentNode.removeChild(uiElement);
      }
    });
  },

  updateEnterARInterface: function () {
    //this.toggleEnterARButtonIfNeeded();
    var sceneEl = this.el;
    //console.log('Enter AR callback, check scene mode: ', sceneEl.is('ar-mode'), this.enterAREl);
    if (!this.enterAREl) { return; }
    if (sceneEl.is('ar-mode')) {
      this.enterAREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterAREl.classList.remove(HIDDEN_CLASS);
    }
  }
/*
  toggleEnterARButtonIfNeeded: function () {
    var sceneEl = this.el;
    if (!this.enterAREl) { return; }
    if (sceneEl.is('ar-mode')) {
      this.enterAREl.classList.add(HIDDEN_CLASS);
    } else {
      this.enterAREl.classList.remove(HIDDEN_CLASS);
    }
  }
  */
});

/**
 * Create a button that when clicked will enter into stereo-rendering mode for VR.
 *
 * Structure: <div><button></div>
 *
 * @param {function} onClick - click event handler
 * @returns {Element} Wrapper <div>.
 */
function createEnterARButton (onClick) {
  var arButtonWrapper;
  var arButton;
  var wrapper;
  var discription;

  // Create elements.
  wrapper = document.createElement('div');
  wrapper.classList.add(ENTER_AR_CLASS);
  wrapper.setAttribute(constants.AFRAME_INJECTED, '');

  discription = document.createElement('div');
  discription.classList.add('demo-card');
  discription.classList.add('mdl-card');
  discription.classList.add('mdl-shadow--4dp');
  discription.setAttribute('id', 'a-enter-ar-info');
  if (utils.device.isARAvailable) {
    discription.insertAdjacentHTML('beforeend', '<div class="mdl-card__title"><h2 class="mdl-card__title-text">Augmented Reality with the WebXR Device API</h2></div><div class="mdl-card__supporting-text">This is an experiment using augmented reality features with the WebXR Device API.</div>');

    arButtonWrapper = document.createElement('div');
    arButtonWrapper.classList.add('mdl-card__actions');
    arButtonWrapper.classList.add('mdl-card--border');

    arButton = document.createElement('a');
    arButton.classList.add('mdl-button');
    arButton.classList.add('mdl-button--raised');
    arButton.classList.add('mdl-button--accent');
    arButton.setAttribute('id', ENTER_AR_BTN_ID);
    arButton.insertAdjacentText('beforeend', 'Start augmented reality');

    // Insert elements.
    arButtonWrapper.appendChild(arButton);
    discription.appendChild(arButtonWrapper);

  } else {
    discription.insertAdjacentHTML('beforeend', '<div class="mdl-card__title"><h2 class="mdl-card__title-text">Augmented Reality with the WebXR Device API</h2></div><div class="mdl-card__supporting-text">This device does not support WebXR device API.</div>');
  }

  // Insert elements.
  wrapper.appendChild(discription);

  if (utils.device.isARAvailable) {
    arButton.addEventListener('click', function (evt) {
      onClick();
      evt.stopPropagation();
    });
  }
  return wrapper;
}
