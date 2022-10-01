<template>
  <div class="pl-stack-input">
    <div class="row items-center sl-label" v-if="field">
      <div class="col">{{ field }}</div>
      <slot name="label"></slot>
    </div>
    <textarea
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="{
        'pl-textarea': true,
        'pl-raw-input-unsized': true,
        'sl-input': !!field,
      }"
      :style="minHeightStyle"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'IGTextArea',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: null
    },
    field: {
      type: String
    },
    minHeight: {
      type: Number,
      default: 56
    }
  },
  computed: {
    minHeightStyle () {
      return `min-height: ${this.minHeight}px;`
    }
  }
})
</script>

<style lang="scss">
.pl-textarea {
  min-width: 100%;
  resize: vertical;
}

.pl-textarea::-webkit-input-placeholder {
  color: #b5b5be !important;
}
.pl-textarea:-moz-placeholder {
  color: #b5b5be !important;
}
.pl-textarea::-moz-placeholder {
  color: #b5b5be !important;
}
.pl-textarea:-ms-input-placeholder {
  color: #b5b5be !important;
}
.pl-textarea::placeholder {
  color: #b5b5be !important;
}
</style>
