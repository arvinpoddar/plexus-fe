import Storage from 'src/modules/Storage'
import { ROLES, USER_PERMISSION_RINGS } from 'src/modules/constants'

const ACTIVE_TEAM = 'active_team'
const ALL_TEAMS = 'teams'

export class UserData {
  static async getTeams () {
    const data = await Storage.getValue(ALL_TEAMS)
    return data
  }

  static async setTeams (teams) {
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

  static async getRole () {
    const isSuperAdmin = await this.isSuperAdmin()
    if (isSuperAdmin) {
      return ROLES.SUPER_ADMIN
    }

    const user = await this.getUserData()
    const team = await this.getCurrentTeam()
    if (!(user && team)) return ROLES.VIEWER
    return team.role || ROLES.VIEWER
  }

  static async isRole (role) {
    const currentRole = await this.getRole()
    return currentRole === role
  }

  static async isGreaterRole (role) {
    const currentRole = await this.getRole()
    const currentLevel = USER_PERMISSION_RINGS[currentRole] || 0
    return currentLevel > (USER_PERMISSION_RINGS[role] || 0)
  }

  static async isGreaterOrEqualRole (role) {
    const currentRole = await this.getRole()
    const currentLevel = USER_PERMISSION_RINGS[currentRole] || 0
    return currentLevel >= (USER_PERMISSION_RINGS[role] || 0)
  }
}

export default UserData
