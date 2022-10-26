<template>
  <q-page v-if="loadingUser" class="pl-drawer-page">
    <PageLoader />
  </q-page>
  <q-page v-else class="pl-drawer-page pl-unset-height teams-layout">
    <q-form class="pl-card" @submit="saveUser">
      <div class="pl-card-title">Edit your Account</div>

      <div class="q-pa-lg">
        <PLFieldInput
          v-model="userBuffer.email"
          class="q-mb-md"
          field="Email*"
          required
          readonly
        />
        <PLFieldInput
          v-model="userBuffer.first_name"
          class="q-mb-md"
          field="First Name*"
          required
        />
        <PLFieldInput
          v-model="userBuffer.last_name"
          class="q-mb-md"
          field="Last Name*"
          required
        />
        <div>
          <PLTextArea
            v-model="userBuffer.bio"
            class="q-mb-md"
            field="Bio"
            maxlength="140"
            :minHeight="100"
          >
            <template v-slot:label>
              <PLCharacterCount
                :length="userBuffer.bio.length"
                :maxlength="140"
              />
            </template>
          </PLTextArea>
        </div>
        <q-btn
          label="Save changes"
          class="pl-btn"
          color="primary"
          type="submit"
          :loading="savingUser"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, reactive } from 'vue'
import Plexus from 'src/api'
import User from 'src/api/models/User'
import { strictAssign } from 'src/modules/Utils'
import useNotify from 'src/composables/useNotify'

export default defineComponent({
  setup () {
    // const router = useRouter()
    const { showError, showSuccess } = useNotify()

    const userBuffer = reactive(
      new User({
        id: '',
        email: '',
        first_name: '',
        last_name: '',
        bio: ''
      })
    )

    const loadingUser = ref(false)
    const getUser = async () => {
      try {
        loadingUser.value = true
        const curr = await Plexus.Auth.getUserData()
        const data = await curr.me()
        strictAssign(userBuffer, data)
      } catch (err) {
        showError(err)
      } finally {
        loadingUser.value = false
      }
    }

    const savingUser = ref(false)
    const saveUser = async () => {
      try {
        savingUser.value = true
        const res = await userBuffer.update()
        await Plexus.Auth.setUserData(res)
        showSuccess(null, 'Changes saved!')
      } catch (err) {
        showError(err)
      } finally {
        savingUser.value = false
      }
    }

    onMounted(async () => {
      await getUser()
    })

    return {
      userBuffer,
      loadingUser,
      saveUser,
      savingUser
    }
  }
})
</script>

<style lang="scss">
.teams-layout {
}
</style>
