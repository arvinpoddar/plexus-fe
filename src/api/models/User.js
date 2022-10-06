import { strictAssign } from 'src/modules/Utils'
import Plexus from 'src/api'

class User {
  constructor (params) {
    this.id = ''
    this.email = ''
    this.first_name = ''
    this.last_name = ''
    this.bio = ''

    strictAssign(this, params)
  }

  static async verify (email) {
    const res = await Plexus.API.get('/users/verify', { email })
    return res.id ? new User(res) : null
  }

  async verify () {
    const res = await Plexus.API.get('/users/verify', { email: this.email })
    return res.id ? new User(res) : null
  }

  async create () {
    return new User(await Plexus.API.post('/users', this))
  }
}

export default User
