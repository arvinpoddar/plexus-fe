import dayjs from 'dayjs'
import Storage from 'src/modules/Storage'

export const parseJwt = (token) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))

  return JSON.parse(jsonPayload)
}

export const formatDate = (string, format) => {
  return dayjs(string).format(format)
}

// export const isUnsupportedDevice = () => Platform.is.mobile && !Platform.is.ipad
export const isUnsupportedDevice = () => false

export const isProduction = () => process.env.PROD

export const trimString = (string, length) => {
  return string ? string.substring(0, length) : ''
}

export const getDeploymentStage = () => {
  let stage = 'development'
  try {
    stage = process.env.DEPLOYMENT
  } catch (err) {
    console.log(err)
  }
  return stage.toLowerCase()
}

export const logout = async () => {
  try {
    await Storage.clear()
  } catch (err) {
    console.error(err)
  } finally {
    window.location.href = '/login'
  }
}

export const strictAssign = (target, source) => {
  if (target && source) {
    for (const field in target) {
      const val = source[field]
      if (val !== null && val !== undefined) {
        target[field] = source[field]
      }
    }
    return target
  }
  return target
}
