import { boot } from 'quasar/wrappers'
import PageLoader from 'src/components/global/PageLoader'
import PLFieldInput from 'src/components/global/PLFieldInput'
import PLDateInput from 'src/components/global/PLDateInput'
import PLTextArea from 'src/components/global/PLTextArea'
import PLCharacterCount from 'src/components/global/PLCharacterCount'
import PLConfirmationModal from 'src/components/global/PLConfirmationModal'

export default boot(({ app }) => {
  app.component('PLFieldInput', PLFieldInput)
  app.component('PLDateInput', PLDateInput)
  app.component('PLTextArea', PLTextArea)
  app.component('PLCharacterCount', PLCharacterCount)
  app.component('PageLoader', PageLoader)
  app.component('PLConfirmationModal', PLConfirmationModal)
})
