<template>
  <q-dialog class="pl-confirmation-modal" ref="dialogRef" @hide="onDialogHide">
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
import { defineComponent } from 'vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  props: {
    alert: Boolean,
    loading: Boolean,
    title: String,
    text: String
  },
  setup () {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    return {
      // This is REQUIRED;
      // Need to inject these (from useDialogPluginComponent() call)
      // into the vue scope for the vue html template
      dialogRef,
      onDialogHide,

      // other methods that we used in our vue html template;
      // these are part of our example (so not required)
      onOKClick () {
        // on OK, it is REQUIRED to
        // call onDialogOK (with optional payload)
        onDialogOK()
        // or with payload: onDialogOK({ ... })
        // ...and it will also hide the dialog automatically
      },

      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel
    }
  }
})
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
