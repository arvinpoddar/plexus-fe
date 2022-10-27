<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="confirm-leave-modal">
    <div class="pl-card modal-sm">
      <div class="pl-card-title q-pr-md">
        <div>Confirm</div>
        <q-space />
      </div>

      <q-card-section>
        You have unsaved changes on this document. Switching documents will
        discard these changes. Are you sure you want to continue without saving?
      </q-card-section>

      <div class="text-right q-pa-md q-gutter-x-md">
        <q-btn label="Leave" class="pl-btn" color="grey" @click="onOKClick" />
        <q-btn
          label="Cancel"
          class="pl-btn"
          color="primary"
          @click="onCancelClick"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
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
.create-leave-modal {
  .pl-card {
    box-shadow: none;
  }
}
</style>
