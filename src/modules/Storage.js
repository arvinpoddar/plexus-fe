import { set, get, clear } from 'idb-keyval'

export class Storage {
  static async getValue (key) {
    const data = await get(key)
    return data ? JSON.parse(data) : null
  }

  static async setValue (key, value) {
    return await set(key, JSON.stringify(value))
  }

  static async clear () {
    return await clear()
  }
}

export default Storage
