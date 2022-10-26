import { Notify } from 'quasar'
import { isProduction } from 'src/modules/Utils'

export function useNotify () {
  const showError = (err, message = 'Uh oh, something went wrong', options = {}) => {
    if (!isProduction()) {
      console.error(err)
    }

    const properties = Object.assign({
      type: 'pl-error',
      message
    }, options)

    Notify.create(properties)
  }

  const showSuccess = (res, message = 'Hooray!', options = {}) => {
    if (!isProduction()) {
      console.log(res)
    }

    const properties = Object.assign({
      type: 'pl-success',
      message
    }, options)

    Notify.create(properties)
  }

  return { showError, showSuccess }
}

export default useNotify
