import Plexus from 'src/api'
import { strictAssign } from 'src/modules/Utils'

class Document {
  constructor (params) {
    this.id = null
    this.name = ''
    this.author = null
    this.content = ''
    this.status = ''

    strictAssign(this, params)
  }

  static async listForTeam (teamId) {
    return (await Plexus.API.get(`/teams/${teamId}/documents`)).map(
      (d) => new Document(d)
    )
  }

  static async get (teamId, docId) {
    return new Document(
      await Plexus.API.get(`teams/${teamId}/documents/${docId}`)
    )
  }

  async createForTeam (teamId) {
    return new Document(
      await Plexus.API.post(`teams/${teamId}/documents/`, this)
    )
  }

  async saveForTeam (teamId) {
    return new Document(
      await Plexus.API.put(`teams/${teamId}/documents/${this.id}`, this)
    )
  }

  async deleteForTeam (teamId) {
    return await Plexus.API.delete(`teams/${teamId}/documents/${this.id}`)
  }
}

export default Document
