export default class HelloWorld extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(config, contentId, extras = {}) {
    super();
    let username = H5PIntegration.user.name || 'world';
    this.element = document.createElement('div');
    this.element.innerText = config.textField.replace('%username', username);

    /**
     * Attach library to wrapper.
     *
     * @param {jQuery} $wrapper Content's container.
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-hello-world');
      $wrapper.get(0).appendChild(this.element);
    };
  }
}
