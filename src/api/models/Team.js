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
      const res = await Team.getForUser()
      await Team.setTeamsCache(res)
    }
    return data.map(t => new Team(t))
  }

  static async setTeamsCache (teams) {
    return await Storage.setValue(ALL_TEAMS, teams)
  }

  static async setCurrentTeam (team) {
    const res = await Storage.setValue(ACTIVE_TEAM, team)
    return new Team(res)
  }

  static async getCurrentTeam () {
    const activeTeam = await Storage.getValue(ACTIVE_TEAM)
    return new Team(activeTeam)
  }

  static async get (id) {
    if (id) {
      return new Team(await Plexus.API.get(`/teams/${id}`))
    }
    return null
  }

  static async getForUser () {
    return (await Plexus.API.get('/teams')).map(t => new Team(t))
  }

  async create () {
    return new Team(await Plexus.API.post('/teams', this))
  }
}

export default Team
