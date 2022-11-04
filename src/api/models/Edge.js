import Plexus from 'src/api'
import { strictAssign } from 'src/modules/Utils'

class Edge {
  constructor (params) {
    this.id = ''
    this.x = ''
    this.y = ''
    this.description = ''

    strictAssign(this, params)
  }

  static async listForTeam (teamId) {
    return (await Plexus.API.get(`/teams/${teamId}/edges`)).map(
      (d) => new Edge(d)
    )
  }

  async createForTeam (teamId) {
    return new Edge(await Plexus.API.post(`teams/${teamId}/edges/`, this))
  }

  async saveForTeam (teamId) {
    return new Edge(
      await Plexus.API.put(`teams/${teamId}/edges/${this.id}`, this)
    )
  }

  async deleteForTeam (teamId) {
    return await Plexus.API.delete(`teams/${teamId}/edges/${this.id}`)
  }
}

export default Edge
