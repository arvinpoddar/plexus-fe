<template>
  <!-- LOADING STATE -->
  <q-page v-if="loading" class="full-height full-width flex flex-center">
    <PageLoader />
  </q-page>

  <!-- NO TEAMS STATE-->
  <q-page
    v-else-if="!teams.length"
    class="full-height full-width flex flex-center no-teams-layout"
  >
    <div class="q-gutter-y-md">
      <img src="~assets/noTeam.svg" alt="" class="no-teams-img" />
      <div>
        Looks like you aren't in any teams. Join one via invite or create your
        own!
      </div>
      <q-btn
        class="pl-btn"
        label="Create a team"
        color="primary"
        @click="showCreateTeamModal"
      />
    </div>
  </q-page>
</template>

<script>
import Team from 'src/api/models/Team'
import { useQuasar } from 'quasar'
import { defineComponent, onBeforeMount, ref } from 'vue'
import CreateTeamModal from 'src/components/TeamManagement/CreateTeamModal'
import useNotify from 'src/composables/notify'

export default defineComponent({
  setup () {
    const $q = useQuasar()
    const { showError } = useNotify()

    const activeTeam = ref(null)
    const teams = ref([])

    const showCreateTeamModal = () => {
      $q.dialog({
        component: CreateTeamModal
      }).onOk(async (newTeam) => {
        await Team.setCurrentTeam(newTeam)
        window.location.reload()
      })
    }

    const loading = ref(false)
    const loadTeamData = async () => {
      try {
        loading.value = true
        teams.value = await Team.getForUser()
        const curr = await Team.getCurrentTeam()
        if (!curr && teams.value.length) {
          activeTeam.value = teams.value[0]
          await Team.setCurrentTeam(teams.value[0])
        }
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    onBeforeMount(async () => {
      await loadTeamData()
    })

    return {
      loading,
      teams,
      activeTeam,
      showCreateTeamModal
    }
  }
})
</script>

<style lang="scss">
.no-teams-layout {
  text-align: center;
  .no-teams-img {
    width: 360px;
  }
}

.app-layout {
}
</style>
