<template>
  <q-dialog class="pl-confirmation-modal" ref="dialog" @hide="onDialogHide">
    <div class="pl-card modal-sm">
      <q-card-section class="q-pa-lg">
        <div class="f-18 f-bold q-mb-md">{{ title }}</div>
        <div class="f-16 q-mb-xl">{{ text }}</div>

        <!-- ONLY FOR "ALERT" MODALS, which just display information with an okay option -->
        <div class="row justify-end q-gutter-x-sm" v-if="alert">
          <q-btn
            label="OK"
            class="pl-btn no-btn"
            outline
            :disable="loading"
            @click="onOKClick"
          />
        </div>

        <!-- OPTIONS FOR A STANDARD CONFIRMATION MODAL -->
        <div class="row justify-end q-gutter-x-sm" v-else>
          <q-btn
            label="No"
            class="pl-btn no-btn"
            outline
            :disable="loading"
            @click="onCancelClick"
          />
          <q-btn
            label="Yes"
            class="pl-btn"
            color="negative"
            :loading="loading"
            @click="onOKClick"
          />
        </div>
      </q-card-section>
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: 'PLConfirmationModal',
  props: {
    title: String,
    text: String,
    loading: Boolean,
    alert: Boolean
  },
  emits: ['ok', 'hide'],
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      // this.hide()
    },

    onCancelClick () {
      // we just need to hide the dialog
      this.hide()
    }
  }
}
</script>

<style lang="scss">
.pl-confirmation-modal {
  .pl-card {
    box-shadow: none;
  }

  .pl-btn {
    padding: 16px 45px;
  }

  .no-btn.q-btn--outline:before {
    border: 2px solid #e2e2ea;
  }
}
</style>
