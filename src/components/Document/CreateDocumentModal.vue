<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="create-doc-modal">
    <div class="pl-card modal-sm">
      <q-form @submit="createDocument">
        <div class="pl-card-title q-pr-md">
          <div>Create document</div>
          <q-space />
          <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
        </div>

        <q-card-section class="q-pt-md q-px-lg q-gutter-y-md">
          <PLFieldInput v-model="newDocName" field="Document Name*" required
            maxlength="50" focus>
            <template v-slot:label>
              <PLCharacterCount :length="newDocName.length" :maxlength="50" />
            </template>
          </PLFieldInput>
        </q-card-section>

        <div class="text-right q-pa-md">
          <q-btn label="Create" class="pl-btn" color="primary" type="submit"
            :loading="loading" />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import Document from 'src/api/models/Documents'
import Team from 'src/api/models/Team'
import useNotify from 'src/composables/useNotify'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],
  setup () {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const { showError } = useNotify()

    const loading = ref(false)
    const newDocName = ref('')

    const createDocument = async () => {
      if (!newDocName.value) {
        return
      }

      try {
        loading.value = true
        const team = await Team.getCurrentTeam()
        const docBuffer = new Document({
          id: '',
          name: newDocName.value,
          status: 'PUBLISHED',
          content: `# ${newDocName.value}\n`
        })
        const res = await docBuffer.createForTeam(team.id)
        onDialogOK(res)
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
      newDocName,
      createDocument
    }
  }
})
</script>

<style lang="scss">
.create-doc-modal {
  .pl-card {
    box-shadow: none;
  }
}
</style>
