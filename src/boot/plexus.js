import { boot } from 'quasar/wrappers'
import Plexus from 'src/api/index'

export default boot(({ app }) => {
  app.config.globalProperties.$Plexus = Plexus
})
