<template>
  <div class="pl-card manage-users-card">
    <div class="pl-card-title">Manage Users</div>
    <PageLoader v-if="loadingUsers" />
    <div v-else class="q-pa-md">
      <!-- Add users -->
      <q-form v-if="isOwnerOrAdmin" @submit="addUser">
        <div class="row items-start q-gutter-x-sm">
          <PLFieldInput
            v-model="newUserBuffer.email"
            type="email"
            class="col"
            placeholder="Email"
            debounce="500"
            required
            :loading="verifyingUser"
            :error="!allowAddUser && !!newUserBuffer.email.trim()"
            :error-message="verificationError"
            @update:model-value="verifyUser"
            hide-bottom-space
          >
            <template v-if="allowAddUser" v-slot:append>
              <q-icon name="check" color="positive" />
            </template>
          </PLFieldInput>
          <select
            v-model="newUserBuffer.role"
            class="pl-n-select sl-input"
            style="min-width: 200px"
            required
          >
            <option
              v-for="role in teamRoles"
              :key="role.value"
              :value="role.value"
            >
              {{ role.label }}
            </option>
          </select>
          <q-btn
            class="pl-btn-icn"
            icon="add"
            color="primary"
            type="submit"
            :loading="addingUser"
            :disable="!allowAddUser"
          />
        </div>
        <q-separator class="q-my-lg" />
      </q-form>

      <!-- Manage users -->
      <div class="user-row-grid" v-if="currentTeamUser">
        <ManageUserRow :user="currentTeamUser" />
        <div />

        <ManageUserRow
          v-for="user in usersExcludingCurrent"
          :user="user"
          :key="user.id"
          :editable="isOwnerOrAdmin"
          @delete="removeUser"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref, reactive } from 'vue'
import { ROLES, teamRoles } from 'src/modules/constants'
import ManageUserRow from 'src/components/TeamManagement/ManageUserRow'
import Plexus from 'src/api'
import User from 'src/api/models/User'
import { useRoute } from 'vue-router'
import useNotify from 'src/composables/notify'
import PageLoader from '../global/PageLoader.vue'

export default defineComponent({
  components: {
    ManageUserRow,
    PageLoader
  },
  setup () {
    const route = useRoute()
    const { showError } = useNotify()

    const newUserBuffer = reactive({
      email: '',
      role: ROLES.MEMBER
    })

    const users = ref([])
    const loadingUsers = ref(false)
    const getUsers = async () => {
      try {
        loadingUsers.value = true
        const res = await Plexus.API.get(`/teams/${route.params.id}/users`)
        users.value = res
      } catch (err) {
        showError(err)
      } finally {
        loadingUsers.value = false
      }
    }

    const allowAddUser = ref(false)
    const verifyingUser = ref(false)
    const verificationError = ref('')

    const resetVerification = () => {
      allowAddUser.value = false
      verifyingUser.value = false
      verificationError.value = ''
    }

    const verifyUser = async () => {
      resetVerification()
      const email = newUserBuffer.email.trim().toLowerCase()
      if (!email) {
        return
      }
      try {
        verificationError.value = ''
        verifyingUser.value = true
        const res = await User.verify(email)
        if (!res) {
          verificationError.value = "Plexus user doesn't exist"
        } else if (users.value.some((u) => u.email === res.email)) {
          verificationError.value = 'User is already in team'
        } else {
          allowAddUser.value = true
        }
      } catch (err) {
        showError(err)
      } finally {
        verifyingUser.value = false
      }
    }

    const addingUser = ref(false)
    const addUser = async () => {
      try {
        addingUser.value = true
        const res = await User.verify(newUserBuffer.email)
        if (!res) {
          return showError(null, "This user hasn't joined Plexus")
        }
        await Plexus.API.post(`/teams/${route.params.id}/users`, {
          id: res.id,
          role: newUserBuffer.role
        })
        newUserBuffer.email = ''
        users.value.push({ ...res, role: newUserBuffer.role })
      } catch (err) {
        showError(err)
      } finally {
        resetVerification()
        addingUser.value = false
      }
    }

    const removeUser = (user) => {
      users.value = users.value.filter((u) => u.id !== user.id)
    }

    const currentUser = ref(null)

    const currentTeamUser = computed(() => {
      if (!currentUser.value) {
        return null
      }
      return users.value.find((u) => u.id === currentUser.value.id)
    })

    const isOwnerOrAdmin = computed(() => {
      if (currentTeamUser.value) {
        const roles = [ROLES.OWNER, ROLES.ADMIN]
        return roles.includes(currentTeamUser.value.role)
      }
      return false
    })

    const usersExcludingCurrent = computed(() => {
      if (!currentUser.value) {
        return []
      }

      const presort = users.value.filter((u) => u.id !== currentUser.value.id)
      return presort.sort((a, b) => {
        const first = `${a.first_name} ${a.last_name}`
        const second = `${b.first_name} ${b.last_name}`
        return first.localeCompare(second)
      })
    })

    onMounted(async () => {
      currentUser.value = await Plexus.Auth.getUserData()
      await getUsers()
    })

    return {
      loadingUsers,

      allowAddUser,
      verifyingUser,
      verifyUser,
      verificationError,

      newUserBuffer,
      addingUser,
      addUser,

      removeUser,

      teamRoles,
      currentUser,
      currentTeamUser,
      isOwnerOrAdmin,
      usersExcludingCurrent
    }
  }
})
</script>

<style lang="scss">
.manage-users-card {
  .user-row-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
