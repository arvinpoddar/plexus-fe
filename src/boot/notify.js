import { Notify } from 'quasar'

/**
 * Define custom error notification
 */
Notify.registerType('pl-error', {
  position: 'top-right',
  progress: true,
  color: 'negative',
  textColor: 'white',
  classes: 'pl-error-notification',
  actions: [{ icon: 'close', color: 'white' }]
})

Notify.registerType('pl-success', {
  position: 'top-right',
  progress: true,
  color: 'positive',
  textColor: 'white',
  classes: 'pl-success-notification',
  actions: [{ icon: 'close', color: 'white' }]
})
