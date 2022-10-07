export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MEMBER]: 'Member'
}

export const teamRoles = [
  {
    value: ROLES.OWNER,
    label: ROLE_LABELS[ROLES.OWNER]
  },
  {
    value: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN]
  },
  {
    value: ROLES.MEMBER,
    label: ROLE_LABELS[ROLES.MEMBER]
  }
]

export const USER_PERMISSION_RINGS = {
  [ROLES.SUPER_ADMIN]: 1000000,
  [ROLES.OWNER]: 1,
  [ROLES.ADMIN]: 1,
  [ROLES.USER]: 0
}

export const DOCUMENT_STATUS = {
  PUBLISHED: 'published',
  DRAFT: 'draft'
}
