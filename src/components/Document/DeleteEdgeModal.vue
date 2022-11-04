<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="delete-doc-modal">
    <div class="pl-card modal-sm">
      <div class="pl-card-title q-pr-md">
        <div>Confirm Delete Edge</div>
        <q-space />
        <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
      </div>

      <q-card-section>
        Are you sure you want to delete this edge? This cannot be undone.
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
          @click="deleteEdge"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import Edge from 'src/api/models/Edge'
import Team from 'src/api/models/Team'
import useNotify from 'src/composables/useNotify'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  props: {
    edge: Object
  },
  setup (props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const { showError } = useNotify()
    const loading = ref(false)

    const deleteEdge = async () => {
      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        const edge = new Edge(props.edge)
        await edge.deleteForTeam(team.id)
        onDialogOK(props.edge)
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
      deleteEdge
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
