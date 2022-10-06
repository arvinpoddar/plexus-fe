import { strictAssign } from 'src/modules/Utils'
import Plexus from 'src/api'
import Storage from 'src/modules/Storage'

const ACTIVE_TEAM = 'active_team'
const ALL_TEAMS = 'teams'

class Team {
  constructor (params) {
    this.id = ''
    this.name = ''
    this.description = ''
    this.documents = []
    this.edges = []
    this.users = []

    strictAssign(this, params)
  }

  static async getTeamsCache () {
    const data = await Storage.getValue(ALL_TEAMS)
    if (data == null) {
      console.log('miss')
      const res = await Team.getForUser()
      await Team.setTeamsCache(res)
    }
    return data
  }

  static async setTeamsCache (teams) {
    return await Storage.setValue(ALL_TEAMS, teams)
  }

  static async setCurrentTeam (team) {
    const res = await Storage.setValue(ACTIVE_TEAM, team)
    return res
  }

  static async getCurrentTeam () {
    const activeOrg = await Storage.getValue(ACTIVE_TEAM)
    return activeOrg
  }

  static async getForUser () {
    return await Plexus.API.get('/teams')
  }

  async create () {
    return new Team(await Plexus.API.post('/teams', this))
  }
}

export default Team
