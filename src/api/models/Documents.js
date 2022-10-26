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
}

export default Document
