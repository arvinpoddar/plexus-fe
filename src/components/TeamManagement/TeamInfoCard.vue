<template>
  <q-form class="pl-card" @submit="saveTeam">
    <div class="pl-card-title">Team Info</div>
    <PageLoader v-if="loadingTeam" />
    <div v-else class="q-pa-md">
      <PLFieldInput
        v-model="teamBuffer.name"
        class="q-mb-md"
        field="Name*"
        required
      />
      <div>
        <PLTextArea
          v-model="teamBuffer.description"
          class="q-mb-md"
          field="Description"
          maxlength="140"
          :minHeight="56"
        >
          <template v-slot:label>
            <PLCharacterCount
              :length="teamBuffer.description.length"
              :maxlength="140"
            />
          </template>
        </PLTextArea>
      </div>
      <q-btn
        label="Save changes"
        class="pl-btn"
        color="primary"
        type="submit"
        :loading="savingTeam"
      />
    </div>
  </q-form>
</template>

<script>
import { defineComponent, onMounted, ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { strictAssign } from 'src/modules/Utils'
import useNotify from 'src/composables/notify'
import Team from 'src/api/models/Team'
import Plexus from 'src/api'

export default defineComponent({
  setup () {
    const route = useRoute()
    const { showError, showSuccess } = useNotify()

    const teamBuffer = reactive(
      new Team({
        name: '',
        description: ''
      })
    )

    const loadingTeam = ref(false)
    const getTeam = async () => {
      try {
        loadingTeam.value = true
        const id = route.params.id
        const curr = await Team.get(id)
        strictAssign(teamBuffer, curr)
      } catch (err) {
        showError(err)
      } finally {
        loadingTeam.value = false
      }
    }

    const savingTeam = ref(false)
    const saveTeam = async () => {
      try {
        savingTeam.value = true
        await Plexus.API.put(`/teams/${route.params.id}`, teamBuffer)
        showSuccess(null, 'Changes saved!')
      } catch (err) {
        showError(err)
      } finally {
        savingTeam.value = false
      }
    }

    onMounted(async () => {
      await getTeam()
    })

    return {
      loadingTeam,
      savingTeam,
      saveTeam,
      teamBuffer
    }
  }
})
</script>

<style lang="scss"></style>
