<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" class="create-team-modal">
    <div class="pl-card modal-sm">
      <q-form @submit="createTeam">
        <div class="pl-card-title q-pr-md">
          <div>Create a team</div>
          <q-space />
          <q-btn icon="close" color="grey-8" round flat dense v-close-popup />
        </div>

        <!-- MODAL CONTENTS FOR SENDING THE CONTACT FORM -->
        <q-card-section class="q-pt-md q-px-lg q-gutter-y-md">
          <PLFieldInput
            v-model="teamBuffer.name"
            field="Name*"
            required
            maxlength="50"
          >
            <template v-slot:label>
              <PLCharacterCount
                :length="teamBuffer.name.length"
                :maxlength="50"
              />
            </template>
          </PLFieldInput>

          <PLTextArea
            v-model="teamBuffer.description"
            field="Description"
            maxlength="140"
            :minHeight="100"
          >
            <template v-slot:label>
              <PLCharacterCount
                :length="teamBuffer.description.length"
                :maxlength="140"
              />
            </template>
          </PLTextArea>
        </q-card-section>

        <q-separator />

        <div class="text-right q-pa-md">
          <q-btn
            label="Create team"
            class="pl-btn"
            color="primary"
            type="submit"
            :loading="loading"
          />
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import Team from 'src/api/models/Team'
import useNotify from 'src/composables/notify'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],

  setup () {
    const { showError } = useNotify()
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent()

    const teamBuffer = reactive({
      name: '',
      description: ''
    })

    const loading = ref(false)

    const createTeam = async () => {
      try {
        loading.value = true
        const team = new Team(teamBuffer)
        const res = await team.create()
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
      loading,
      teamBuffer,
      createTeam,

      // we can passthrough onDialogCancel directly
      onCancelClick: onDialogCancel
    }
  }
})
</script>

<style lang="scss">
.create-team-modal {
  .pl-card {
    box-shadow: none;
  }
}
</style>
