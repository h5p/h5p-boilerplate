<template>
  <div class="h5p-hello-world-component">
    <div class="h5p-question-content">
      <p>{{ params.taskDescription }}</p>
      <div class="h5p-input-wrapper" :class="wrapperClass">
        <input 
          type="text" 
          v-model="userAnswer"
          class="h5p-text-input"
          :disabled="inputDisabled"
          :aria-label="ariaLabel"
          :placeholder="params.l10n.inputPlaceholder || 'Write your answer here'">
      </div>
    </div>
    <div v-if="showSolution" class="h5p-question-solution">
      <p>{{ params.l10n.correctAnswerText }}</p>
      <p class="h5p-solution-text">
        {{ acceptedAnswers.join(', ') }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorldComponent',
  props: {
    params: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value === 'object';
      }
    }
  },
  data() {
    return {
      userAnswer: '',
      showSolution: false,
      isSubmitted: false,
      wasCorrect: false
    };
  },
  computed: {
    acceptedAnswers() {
      return (this.params.acceptedAnswers || 'Hello\nHi\nHey')
        .split('\n')
        .map(greeting => greeting.trim())
        .filter(greeting => greeting.length > 0);
    },
    ariaLabel() {
      const baseLabel = this.params.l10n.inputLabel || 'Your answer';
      if (!this.isSubmitted) {
        return baseLabel;
      }
      return `${baseLabel}. ${this.wasCorrect ? 
        (this.params.l10n.answeredCorrectly || 'Answered correctly') : 
        (this.params.l10n.answeredIncorrectly || 'Answered incorrectly')}`;
    },
    inputDisabled() {
      return this.isSubmitted && this.wasCorrect;
    },
    wrapperClass() {
      return {
        'h5p-correct': this.isSubmitted && this.wasCorrect,
        'h5p-wrong': this.isSubmitted && !this.wasCorrect
      };
    }
  },
  methods: {
    reset() {
      this.userAnswer = '';
      this.showSolution = false;
      this.isSubmitted = false;
      this.wasCorrect = false;
    },
    setAnswerState(isCorrect) {
      this.isSubmitted = true;
      this.wasCorrect = isCorrect;
    }
  }
};
</script>