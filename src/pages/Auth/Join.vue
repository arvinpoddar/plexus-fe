<template>
  <q-form class="auth-form join-form" @submit="createUser">
    <div class="join-header q-mb-md">Create your account</div>
    <div>
      Welcome to Plexus! Fill out the information below to create your account
    </div>
    <q-separator class="q-my-lg" />
    <div class="q-mt-lg q-gutter-y-md">
      <PLFieldInput
        v-model="userBuffer.email"
        field="Email*"
        required
        readonly
      />
      <PLFieldInput
        v-model="userBuffer.first_name"
        field="First Name*"
        required
      />
      <PLFieldInput
        v-model="userBuffer.last_name"
        field="Last Name*"
        required
      />
      <PLTextArea
        v-model="userBuffer.bio"
        field="Bio"
        maxlength="140"
        :minHeight="100"
      >
        <template v-slot:label>
          <PLCharacterCount :length="userBuffer.bio.length" :maxlength="140" />
        </template>
      </PLTextArea>
    </div>
    <q-separator class="q-my-lg" />
    <q-btn
      class="pl-btn full-width"
      color="primary"
      label="Join"
      type="submit"
      :loading="loading"
    />
    <div class="f-16 text-center q-mt-md">
      Not {{ userBuffer.email }}?
      <span class="a-fake f-bold cursor-pointer" @click="logout"> Logout </span>
    </div>
  </q-form>
</template>

<script>
import { defineComponent, onBeforeMount, ref, reactive } from 'vue'
import Plexus from 'src/api'
import useNotify from 'src/composables/useNotify'
import { useRouter } from 'vue-router'
import User from 'src/api/models/User'
import { logout } from 'src/modules/Utils'
import useSetTeams from 'src/composables/useSetTeams'

export default defineComponent({
  setup () {
    const router = useRouter()
    const { showError } = useNotify()
    const { fetchAndCacheTeams } = useSetTeams()

    const loading = ref(false)
    const userBuffer = reactive({
      id: '',
      email: '',
      first_name: '',
      last_name: '',
      bio: ''
    })

    const createUser = async () => {
      try {
        loading.value = true
        const newUser = new User(userBuffer)
        const res = await newUser.create()
        await Plexus.Auth.setUserData(res)
        await fetchAndCacheTeams()
        router.push({ name: 'app' })
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const loadUserData = async () => {
      try {
        loading.value = true
        const googleAuthData = await Plexus.Auth.getGoogleData()
        userBuffer.first_name = googleAuthData.given_name
        userBuffer.last_name = googleAuthData.family_name
        userBuffer.email = googleAuthData.email
        userBuffer.id = googleAuthData.id
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    onBeforeMount(() => {
      loadUserData()
    })

    return {
      userBuffer,
      createUser,
      loading,
      logout
    }
  }
})
</script>

<style lang="scss">
.join-form {
  .join-header {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
  }
}
</style>
