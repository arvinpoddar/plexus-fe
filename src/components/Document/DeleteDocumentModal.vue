<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="delete-doc-modal">
    <div class="pl-card modal-sm">
      <div class="pl-card-title q-pr-md">
        <div>Confirm Delete Document</div>
        <q-space />
        <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
      </div>

      <q-card-section>
        Are you sure you want to delete
        <span class="f-bold"> {{ document.name }} </span>? This cannot be
        undone.
      </q-card-section>

      <div class="text-right q-pa-md q-gutter-x-md">
        <q-btn
          label="Cancel"
          class="pl-btn"
          color="grey"
          @click="onCancelClick"
        />
        <q-btn
          label="Delete"
          class="pl-btn"
          color="negative"
          @click="deleteDocument"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import Document from 'src/api/models/Document'
import Team from 'src/api/models/Team'
import useNotify from 'src/composables/useNotify'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  props: {
    document: Object
  },
  setup (props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const { showError } = useNotify()
    const loading = ref(false)

    const deleteDocument = async () => {
      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        const doc = new Document(props.document)
        await doc.deleteForTeam(team.id)
        onDialogOK(props.document)
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
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

      loading,
      deleteDocument
    }
  }
})
</script>

<style lang="scss">
.delete-doc-modal {
  .pl-card {
    box-shadow: none;
  }
}
</style>
