import { createApp } from 'vue';
import HelloWorldComponent from '../components/HelloWorldComponent.vue';

/**
 * Class holding a full HelloWorld example.
 *
 * - Extends H5P.Question which offers functions for setting the DOM
 * - Implements the question type contract necessary for reporting and for
 *   making the content type usable in compound content types like Question Set
 *   Cpm. https://h5p.org/documentation/developers/contracts
 * - Implements getCurrentState to allow continuing a user's previous session
 * - Uses a separate content class to organitze files
 */
export default class HelloWorld extends H5P.Question {
  /**
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('hello-world'); // CSS class selector for the content's iframe: h5p-hello-world

    // Save incoming parameters and state
    this.params = params;
    this.contentId = contentId;
    this.extras = extras;

    // Initialize score tracking
    this.score = 0;
    this.maxScore = 1;

    // Set default parameters (merging editor params with defaults)
    this.params = extend(
      {
        behaviour: {
          enableSolutionsButton: true,
          enableRetry: true
        },
        l10n: {
          checkAnswer: 'Check answer',
          showSolution: 'Show solution',
          tryAgain: 'Retry',
          inputLabel: 'Your answer',
          inputPlaceholder: 'Write your answer here',
          correctAnswerText: 'A greeting was expected'
        }
      },
      this.params
    );

    this.previousState = this.extras.previousState || {};

    // Process task media if provided
    if (this.params.media && this.params.media.library) {
      const mediaObject = this.params.media.params;
      const type = this.params.media.library.split(' ')[0];
      if (type === 'H5P.Image') {
        this.setImage(mediaObject.file.path, {
          disableImageZooming: this.params.media.disableImageZooming || false,
          alt: mediaObject.alt,
          title: mediaObject.title,
          expandImage: mediaObject.expandImage,
          minimizeImage: mediaObject.minimizeImage
        });
      }
      else if (type === 'H5P.Video') {
        this.setVideo(this.params.media);
      }
      else if (type === 'H5P.Audio') {
        this.setAudio(this.params.media);
      }
    }

    /**
     * Makes it easy to bubble events from child to parent
     *
     * @private
     * @param {Object} origin Origin of the Event
     * @param {string} eventName Name of the Event
     * @param {Object} target Target to trigger event on
     */
    const bubbleUp = (origin, eventName, target) => {
      origin.on(eventName, function (event) {
        target.bubblingUpwards = true;
        target.trigger(eventName, event);
        target.bubblingUpwards = false;
      });
    };

    /**
     * Makes it easy to bubble events from parent to children
     *
     * @private
     * @param {Object} origin Origin of the Event
     * @param {string} eventName Name of the Event
     * @param {Object} targets Targets to trigger event on
     */
    const bubbleDown = (origin, eventName, targets) => {
      origin.on(eventName, function (event) {
        if (origin.bubblingUpwards) {
          return; // Prevent sending the event back down.
        }
        for (let i = 0; i < targets.length; i++) {
          targets[i].trigger(eventName, event);
        }
      });
    };

    /**
     * Creates a new ontent instance from the given content parameters and
     * then attaches it the wrapper. Sets up event listeners.
     *
     * @private
     * @param {Object} content Parameters
     * @param {Object} [contentData] Content Data
     */
    this.addRunnable = (content, previousState = {}) => {
      const $wrapper = H5P.jQuery('<div/>', { 'class': 'h5p-content-wrapper' });
      const instance = H5P.newRunnable(content, this.contentId, $wrapper, false, previousState);
      bubbleUp(instance, 'resize', this);
      // optionally bubble xAPI events:
      // bubbleUp(instance, 'xAPI', this);
      bubbleDown(this, 'resize', [instance]);
      return { instance, $wrapper };
    };

    /**
     * Registers DOM elements for the content.
     *
     * @private
     */
    this.registerDomElements = () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('h5p-hello-world-wrapper');
      this.setContent(wrapper);

      const app = createApp(HelloWorldComponent, {
        params: this.params
      });
      this.vueInstance = app.mount(wrapper);



      this.addButtons();
    };

    /**
     * Adds buttons to the content.
     * (Check Answer, Show Solution, Retry)
     * 
     * @private
     */
    this.addButtons = () => {
      // Check Answer button
      this.addButton(
        'check-answer',
        this.params.l10n.checkAnswer,
        () => {
          const answer = this.vueInstance.userAnswer.trim().toLowerCase();
          const isCorrect = this.checkIfGreeting(answer);
          this.score = isCorrect ? this.maxScore : 0;
          this.hideButton('check-answer');
          this.vueInstance.setAnswerState(isCorrect);
          if (this.params.behaviour.enableSolutionsButton) {
            this.showButton('show-solution');
          }
          if (this.params.behaviour.enableRetry) {
            this.showButton('try-again');
          }
          this.triggerXAPIAnswered(answer, isCorrect);
        },
        true
      );

      // Show Solution button
      this.addButton(
        'show-solution',
        this.params.l10n.showSolution,
        () => {
          this.showSolutions();
        },
        false
      );

      // Retry button
      this.addButton(
        'try-again',
        this.params.l10n.tryAgain,
        () => {
          this.resetTask();
          this.showButton('check-answer');
          this.hideButton('show-solution');
          this.hideButton('try-again');
        },
        false
      );
    };

    /**
     * Check if the answer is a greeting.
     *
     * @param {string} answer The user's answer.
     * @return {boolean} True if the answer is a greeting, false otherwise.
     */
    this.checkIfGreeting = (answer) => {
      const acceptedAnswers = (this.params.acceptedAnswers || 'Hello\nHi\nHey')
        .split('\n')
        .map(greeting => greeting.trim())
        .filter(greeting => greeting.length > 0);
      return acceptedAnswers.some(greeting => greeting.toLowerCase() === answer);
    };

    /**
     * Triggers an xAPI event for the answered question.
     *
     * @param {string} answer The user's answer.
     * @param {boolean} correct True if the answer is correct, false otherwise.
     */
    this.triggerXAPIAnswered = (answer, correct) => {
      const xAPIEvent = this.createXAPIEventTemplate('answered');
      xAPIEvent.setScoredResult(this.score, this.maxScore, this, true, correct);
      xAPIEvent.data.statement.result.response = answer;
      this.trigger(xAPIEvent);
    };

    /**
     * Check if result has been submitted or input has been given.
     *
     * @return {boolean} True, if answer was given.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getAnswerGiven = () => {
      return this.vueInstance?.userAnswer?.length > 0 || false;
    };

    /**
     * Get the score.
     *
     * @return {number} Score.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getScore = () => this.score;

    /**
     * Get the maximum score.
     *
     * @return {number} Maximum score.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getMaxScore = () => this.maxScore;

    /**
     * Show solutions.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {
      if (this.vueInstance) {
        this.vueInstance.showSolution = true;
      }
      this.trigger('resize');
    };

    /**
     * Reset task.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {
      this.score = 0;
      if (this.vueInstance?.reset) {
        this.vueInstance.reset();
      }
    };

    /**
     * Get xAPI data.
     *
     * @return {object} XAPI statement.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = () => ({
      statement: this.getXAPIAnswerEvent().data.statement
    });

    /**
     * Build xAPI answer event.
     *
     * @return {H5P.XAPIEvent} XAPI answer event.
     */
    this.getXAPIAnswerEvent = () => {
      const xAPIEvent = this.createXAPIEvent('answered');

      xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this,
        true, this.isPassed());

      /*
       * TODO: Add other properties here as required, e.g. xAPIEvent.data.statement.result.response
       * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#245-result
       */

      return xAPIEvent;
    };

    /**
     * Create an xAPI event for Dictation.
     *
     * @param {string} verb Short id of the verb we want to trigger.
     * @return {H5P.XAPIEvent} Event template.
     */
    this.createXAPIEvent = (verb) => {
      const xAPIEvent = this.createXAPIEventTemplate(verb);
      extend(
        xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
        this.getxAPIDefinition()
      );
      return xAPIEvent;
    };

    /**
     * Get the xAPI definition for the xAPI object.
     *
     * @return {object} XAPI definition.
     */
    this.getxAPIDefinition = () => {
      const definition = {};
      definition.name = { 'en-US': this.getTitle() };
      definition.description = { 'en-US': this.getDescription() };
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'other';
      return definition;
    };

    /**
     * Determine whether the task has been passed by the user.
     *
     * @return {boolean} True if user passed or task is not scored.
     */
    this.isPassed = () => true;

    /**
     * Get tasks title.
     *
     * @return {string} Title.
     */
    this.getTitle = () => {
      const raw =
        (this.extras.metadata && this.extras.metadata.title);
      return H5P.createTitle(raw);
    };

    /**
     * Get tasks description.
     *
     * @return {string} Description.
     */
    this.getDescription = () =>
      this.params.taskDescription;

    /**
     * Extend an array just like JQuery's extend.
     *
     * @param {object} arguments Objects to be merged.
     * @return {object} Merged objects.
     */
    function extend() {
      for (let i = 1; i < arguments.length; i++) {
        for (let key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            if (
              typeof arguments[0][key] === 'object' &&
              typeof arguments[i][key] === 'object'
            ) {
              extend(arguments[0][key], arguments[i][key]);
            } else {
              arguments[0][key] = arguments[i][key];
            }
          }
        }
      }
      return arguments[0];
    }

    /**
     * Save current state for restoration.
     *
     * @return {object} Current state.
     */
    this.getCurrentState = () => {
      if (!this.vueInstance) {
        return {};
      }

      const state = {
        answer: this.vueInstance.userAnswer,
        score: this.score,
        showSolution: this.vueInstance.showSolution,
        showHint: this.vueInstance.showHint
      };
      return state;
    };
  }
}