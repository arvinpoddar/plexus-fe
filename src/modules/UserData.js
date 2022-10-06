import { ROLES, USER_PERMISSION_RINGS } from 'src/modules/constants'

export class UserData {
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
