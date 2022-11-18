import Plexus from 'src/api'
import { strictAssign } from 'src/modules/Utils'
import Edge from './Edge'

class Suggestion {
  constructor (params) {
    this.id = null
    this.description = ''
    this.similarity = 0
    this.x = Document
    this.y = Document

    strictAssign(this, params)
  }

  toEdge () {
    return new Edge({
      id: '',
      description: this.description,
      x: this.x.id,
      y: this.y.id
    })
  }
}

class Document {
  constructor (params) {
    this.id = null
    this.name = ''
    this.author = null
    this.content = ''
    this.status = ''
    this.last_updated = ''
    this.created_at = ''

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

  async getSuggestions (teamId) {
    return (
      await Plexus.API.get(`teams/${teamId}/documents/${this.id}/suggestions`)
    ).map((s) => new Suggestion(s))
  }
}

export default Document
