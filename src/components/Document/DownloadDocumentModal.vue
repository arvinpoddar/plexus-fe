<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="download-doc-modal">
    <div class="pl-card modal-sm">
      <q-form @submit="save">
        <div class="pl-card-title q-pr-md">
          <div>Download document</div>
          <q-space />
          <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
        </div>

        <q-card-section class="q-pt-md q-px-lg q-gutter-y-md">
          <PLFieldInput
            v-model="fileName"
            field="Name*"
            required
            maxlength="50"
            focus
          >
            <template v-slot:label>
              <PLCharacterCount :length="fileName.length" :maxlength="50" />
            </template>
          </PLFieldInput>
        </q-card-section>

        <div class="text-right q-pa-md">
          <q-btn
            label="Download"
            class="pl-btn"
            color="primary"
            type="submit"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import dayjs from 'dayjs'
import FileSaver from 'file-saver'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  props: {
    document: Object
  },
  setup (props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const suggestedName = `${props.document.name} ${dayjs().format(
      'YYYY-MM-DD HH-mm'
    )}`
    const fileName = ref(suggestedName)

    const save = () => {
      if (!props.document) {
        return
      }
      const fileSaveName = fileName.value + '.md'
      const markdown = new Blob([props.document.content], {
        type: 'text/plain;charset=utf-8'
      })
      FileSaver.saveAs(markdown, fileSaveName)
      dialogRef.value.hide()
    }

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
      onCancelClick: onDialogCancel,

      fileName,
      save
    }
  }
})
</script>

<style lang="scss">
.download-doc-modal {
  .pl-card {
    box-shadow: none;
  }
}
</style>
