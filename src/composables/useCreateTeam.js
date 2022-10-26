import { useQuasar } from 'quasar'
import Team from 'src/api/models/Team'
import CreateTeamModal from 'src/components/TeamManagement/CreateTeamModal.vue'

export function useCreateTeam () {
  const $q = useQuasar()

  const showCreateTeamModal = () => {
    $q.dialog({
      component: CreateTeamModal
    }).onOk(async (newTeam) => {
      await Team.setCurrentTeam(newTeam)
      window.location.reload()
    })
  }

  return {
    showCreateTeamModal
  }
}
