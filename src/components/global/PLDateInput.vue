<template>
  <div class="pl-stack-input">
    <div class="row items-center sl-label">
      <div class="col">{{ field }}</div>
      <slot name="label"></slot>
    </div>
    <q-input
      v-bind="$attrs"
      :modelValue="formattedDate"
      @update:model-value="setDate($event, DISPLAY_FORMAT)"
      mask="##/##/####"
      fill-mask="-"
      :class="{
        'pl-input': true,
        'sl-input': !!field,
      }"
      outlined
      ref="dateInput"
    >
      <!--
      :error="!date"
      hide-bottom-space
      no-error-icon
      lazy-rules="ondemand"
      -->
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="date"
              mask="YYYY-MM-DD"
              :options="isValidDateOption"
              @update:model-value="emitToParent"
              required
              no-unset
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { defineComponent } from 'vue'

const VALUE_FORMAT = 'YYYY-MM-DD'
const DISPLAY_FORMAT = 'MM/DD/YYYY'
const MODEL_VALUE_EVENT = 'update:model-value'

const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

export default defineComponent({
  name: 'IGDateInput',
  emits: [MODEL_VALUE_EVENT],
  props: {
    modelValue: null,
    field: String,
    minDate: String,
    maxDate: String
  },
  data () {
    return {
      VALUE_FORMAT,
      DISPLAY_FORMAT,
      date: ''
    }
  },
  computed: {
    formattedDate () {
      return dayjs(this.date).format(DISPLAY_FORMAT)
    }
  },
  methods: {
    isValidDateOption (date) {
      const now = dayjs(date)
      let min = null
      let max = null

      if (this.minDate && dayjs(this.minDate).isValid()) {
        min = dayjs(this.minDate)
      }

      if (this.maxDate && dayjs(this.maxDate).isValid()) {
        max = dayjs(this.maxDate)
      }

      if (!(min || max)) {
        return true
      } else if (min && max) {
        return (
          now.isSame(min) ||
          now.isSame(max) ||
          (now.isAfter(min) && now.isBefore(max))
        )
      } else if (min) {
        return now.isSame(min) || now.isAfter(min)
      } else if (max) {
        return now.isSame(max) || now.isAfter(max)
      } else {
        return true
      }
    },

    setDate (val, inputFormat = VALUE_FORMAT) {
      const date = dayjs(val, inputFormat)
      if (date.isValid() && this.isValidDateOption(date)) {
        this.changeInputValid(true)
        this.date = date.format(VALUE_FORMAT)
      } else if (val.length === inputFormat.length) {
        this.changeInputValid(false)
        this.date = ''
      } else {
        this.changeInputValid(false)
      }
      this.emitToParent(this.date)
    },

    emitToParent (e) {
      const date = dayjs(e, VALUE_FORMAT)
      if (date.isValid() && this.isValidDateOption(date)) {
        this.changeInputValid(true)
        this.$emit(MODEL_VALUE_EVENT, date.format(VALUE_FORMAT))
      } else {
        this.changeInputValid(false)
        this.date = ''
        this.$emit(MODEL_VALUE_EVENT, '')
      }
    },

    changeInputValid (isValid) {
      if (this.$attrs.required !== undefined) {
        const input = this.$refs.dateInput.getNativeElement()
        input.setCustomValidity(isValid ? '' : 'Invalid date')
      }
    }
  },
  watch: {
    modelValue (val) {
      if (val) {
        const day = dayjs(val)
        if (day.isValid()) {
          this.date = day.format(VALUE_FORMAT)
          this.changeInputValid(true)
        } else {
          this.changeInputValid(false)
        }
      } else {
        this.changeInputValid(false)
      }
    }
  },
  mounted () {
    if (!this.modelValue) {
      this.changeInputValid(false)
    } else {
      this.setDate(this.modelValue, VALUE_FORMAT)
    }
  }
})
</script>
