export default class HelloWorld extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(config, contentId, contentData = {}) {
    super();
    let username = H5PIntegration.user.name || 'world';
    this.element = document.createElement('div');
    this.element.innerText = config.textField.replace('%username', username);

    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function($wrapper) {
      $wrapper.get(0).classList.add('h5p-hello-world');
      $wrapper.get(0).appendChild(this.element);
    };
  }
}
