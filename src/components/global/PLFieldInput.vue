<template>
  <div class="pl-stack-input">
    <div class="row items-center sl-label" v-if="field || $slots.label">
      <div class="col">{{ field }}</div>
      <slot name="label"></slot>
    </div>
    <q-input
      v-bind="$attrs"
      :type="inputType"
      :modelValue="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :class="{
        'pl-input': true,
        'sl-input': !!field,
        'pl-prefix-input': !!$attrs.prefix,
      }"
      outlined
      autocomplete="on"
      ref="rootInput"
    >
      <template v-slot:prepend v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </template>

      <template v-slot:append v-if="$slots.append">
        <q-icon
          v-if="toggleVisibility"
          :name="showPassword ? 'ig:icon-not-visible' : 'ig:icon-view-fill-2'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
        <slot name="append"></slot>
      </template>
    </q-input>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'IGFieldInput',
  emits: ['update:modelValue'],
  props: {
    modelValue: null,
    field: String,
    toggleVisibility: Boolean,
    delayAutoFocus: Boolean
  },
  data () {
    return {
      showPassword: false
    }
  },
  methods: {
    focus () {
      if (this.$refs.rootInput) {
        this.$refs.rootInput.focus()
      }
    },

    delayFocus (delay = 400) {
      setTimeout(() => this.focus(), delay)
    }
  },
  computed: {
    inputType () {
      if (this.toggleVisibility) {
        return this.showPassword ? 'text' : 'password'
      }
      return this.$attrs.type || 'text'
    }
  },
  mounted () {
    if (this.delayAutoFocus) {
      this.delayFocus()
    }
  }
})
</script>
