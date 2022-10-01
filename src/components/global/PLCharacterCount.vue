<template>
  <div
    :class="{
      'f-14': true,
      'text-negative': fullCapacity,
      'text-grey': !fullCapacity,
    }"
  >
    {{ length }}/{{ maxlength }}
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'IGCharacterCount',
  props: {
    length: Number,
    maxlength: Number
  },
  computed: {
    fullCapacity () {
      return this.length >= this.maxlength
    }
  }
})
</script>
