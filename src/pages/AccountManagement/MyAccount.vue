<template>
  <!--
  <q-page class="ig-drawer-page">
    <PageLoader />
  </q-page>
-->
  <q-page class="pl-drawer-page pl-unset-height documents-layout">
    <q-form class="pl-card">
      <div class="pl-card-title">Edit your Account</div>

      <div class="q-pa-lg">
        <PLFieldInput
          v-model="newUser.email"
          class="q-mb-md"
          field="Email*"
          required
          readonly
        />
        <PLFieldInput
          v-model="newUser.first_name"
          class="q-mb-md"
          field="First Name*"
          required
        />
        <PLFieldInput
          v-model="newUser.last_name"
          class="q-mb-md"
          field="Last Name*"
          required
        />
        <div>
          <PLTextArea
            v-model="newUser.bio"
            class="q-mb-md"
            field="Bio"
            maxlength="140"
            :minHeight="100"
          >
            <template v-slot:label>
              <PLCharacterCount :length="newUser.bio.length" :maxlength="140" />
            </template>
          </PLTextArea>
        </div>
        <q-btn
          label="Save changes"
          class="pl-btn"
          color="primary"
          type="submit"
          :loading="loading"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, reactive } from 'vue'
import Plexus from 'src/api'
import { logout } from 'src/modules/Utils'
import useNotify from 'src/composables/notify'
// import { useRouter } from 'vue-router'
import { useCodeClient } from 'vue3-google-signin'
import PLFieldInput from 'src/components/global/PLFieldInput.vue'

export default defineComponent({
  setup () {
    // const router = useRouter()
    const { showError } = useNotify()

    const loading = ref(false)
    const verifiedGoogleUser = ref(false)
    const notExistingUser = ref(true)
    const newUser = reactive({
      email: '',
      first_name: '',
      last_name: '',
      bio: ''
    })
    const handleOnSuccess = async (response) => {
      try {
        loading.value = true
        verifiedGoogleUser.value = true
        const res = await Plexus.Auth.requestToken(response.code)
        newUser.email = res.email || ''
        newUser.first_name = res.given_name || ''
        newUser.last_name = res.family_name || ''

        // router.push({ name: 'app' })
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const handleOnError = (errorResponse) => {
      console.log('Error: ', errorResponse)
    }

    const { isReady, login } = useCodeClient({
      onSuccess: handleOnSuccess,
      onError: handleOnError
    })

    const isAuthenticated = ref(false)
    onMounted(async () => {
      isAuthenticated.value = await Plexus.Auth.isAuthenticated()
      console.log(await Plexus.Auth.isAuthenticated())
    })

    return {
      isReady,
      verifiedGoogleUser,
      notExistingUser,
      newUser,
      loading,
      login,
      logout,
      isAuthenticated,
      handleOnSuccess,
      handleOnError
    }
  },
  components: { PLFieldInput }
})
</script>

<style lang="scss">
.login-form {
  .early-access {
    font-size: 16px;
    text-align: center;
  }
}
</style>
