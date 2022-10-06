<template>
  <q-form class="auth-form login-form">
    <div class="card-header">Sign in to your account</div>

    <q-btn
      label="Sign in with Google"
      class="pl-btn full-width"
      color="primary"
      :disabled="!isReady"
      :loading="loading"
      @click="() => login()"
    />

    <q-separator class="q-my-lg" />
    <div class="early-access">
      Don't have an account?
      <router-link class="a-fake f-bold" to="/early-access">
        Request Early Access
      </router-link>
    </div>
  </q-form>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import Plexus from 'src/api'
import User from 'src/api/models/User'
import { logout } from 'src/modules/Utils'
import useNotify from 'src/composables/notify'
import { useRouter } from 'vue-router'
import { useCodeClient } from 'vue3-google-signin'
import useSetTeams from 'src/composables/useSetTeams'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { showError } = useNotify()
    const { fetchAndCacheTeams } = useSetTeams()

    const loading = ref(false)
    const handleOnSuccess = async (response) => {
      try {
        loading.value = true
        const googleUser = await Plexus.Auth.requestToken(response.code)
        const plexusUser = await User.verify(googleUser.email)
        if (!plexusUser) {
          router.push({ name: 'join' })
        } else {
          await Plexus.Auth.setUserData(plexusUser)
          await fetchAndCacheTeams()
          router.push({ name: 'app' })
        }
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
      loading,
      login,
      logout,
      isAuthenticated,
      handleOnSuccess,
      handleOnError
    }
  }
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
