import Team from 'src/api/models/Team'
import useNotify from 'src/composables/notify'

export function useSetTeams () {
  const { showError } = useNotify()

  const fetchAndCacheTeams = async () => {
    await Team.setCurrentTeam(null)

    const teams = await Team.getForUser()
    if (teams.length) {
      await Team.setCurrentTeam(teams[0])
    }
    return teams
  }

  const setCurrentTeam = async (team) => {
    try {
      await Team.setCurrentTeam(team)
      window.location.reload('/app')
    } catch (err) {
      showError(err, 'Could not switch teams')
    }
  }

  return {
    fetchAndCacheTeams,
    setCurrentTeam
  }
}

export default useSetTeams
