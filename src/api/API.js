// import { set, get, clear } from 'idb-keyval'
import axios from 'axios'
import * as queryString from 'query-string'

import { logout, parseJwt } from 'src/modules/Utils'
import Storage from 'src/modules/Storage'

export class API {
  static async get (resource, parameters = {}) {
    return API.request(resource, 'get', parameters, null)
  }

  static async post (resource, data = {}, parameters = {}) {
    return API.request(resource, 'post', parameters, data)
  }

  static async put (resource, data = {}, parameters = {}) {
    return API.request(resource, 'put', parameters, data)
  }

  static async delete (resource, data = {}, parameters = {}) {
    return API.request(resource, 'delete', parameters, data)
  }

  static async request (resource, method, parameters = {}, data = null) {
    return axios.request({
      url: `${resource}?${queryString.stringify(parameters, { arrayFormat: 'bracket' })}`,
      method,
      data,
      baseURL: `${process.env.API_URL}/`,
      headers: {
        ...(await Auth.isAuthenticated() ? { Authorization: `Bearer ${await Auth.getAccessToken()}` } : {}),
        Accept: 'application/json',
        'Content-Type': (data instanceof FormData ? 'multipart/form-data' : 'application/json')
      }
    }).then((results) => results.data)
      .catch(async (error) => {
        switch (error.response?.status) {
          case 401:
            await logout()
            throw error
          default:
            throw error
        }
      })
  }
}

export class Auth {
  static async requestToken (googleAuthCode) {
    return axios.request({
      url: 'token',
      method: 'post',
      baseURL: `${process.env.LOGIN_URL}/`,
      data: { code: googleAuthCode },
      headers: {
        Accepts: 'application/json'
      }
    }).then((results) => {
      Storage.setValue('user_data', results.data)
      return results.data
    })
      .catch(async (error) => {
        switch (error.response?.status) {
          case 401:
            await this.clearAccessToken()
            throw error
          default:
            throw error
        }
      })
  }

  static async getUserData () {
    const data = await Storage.getValue('user_data')
    return data || null
  }

  static async getAccessToken () {
    const data = await Auth.getUserData()
    if (data) {
      return data.access_token || null
    }
    return null
  }

  static async isAuthenticated () {
    const data = await Auth.getAccessToken()
    if (data == null) return false
    const jwt = parseJwt(data)
    return new Date(jwt.exp * 1000) >= new Date()
  }

  static async clearAccessToken () {
    await Storage.clear()
  }
}
