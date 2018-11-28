/** Class representing the content */
export default class HelloWorldContent {
  /**
   * @constructor
   *
   * @param {string} textField Parameter from editor.
   * @param {string} [username=world] Username.
   * @param {number} [random=-1] Random number.
   */
  constructor(textField = 'Hello %username.', username = 'world', random = -1) {
    this.content = document.createElement('div');
    this.content.innerHTML = `<p>${textField.replace('%username', username)} (${random})</p>`;

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };
  }
}
