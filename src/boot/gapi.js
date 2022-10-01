import { boot } from 'quasar/wrappers'
import GoogleSignInPlugin from 'vue3-google-signin'

export default boot(({ app }) => {
  app.use(GoogleSignInPlugin, {
    clientId: '736608152837-68eagtntb7c3ijpfbfvj41a8rba0lr0f.apps.googleusercontent.com'
  })
})
