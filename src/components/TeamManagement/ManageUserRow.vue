<template>
  <div class="manage-user-row">
    <q-avatar class="q-mr-md" rounded color="grey" text-color="white">
      <q-spinner v-if="loading" size="24px" />
      <q-icon v-else name="person" size="24px" />
    </q-avatar>
    <div class="user-info">
      <div class="f-16 f-bold user-name">
        {{ user.first_name }} {{ user.last_name }}
      </div>
      <div class="f-14 text-grey user-email">
        {{ user.email }}
      </div>
    </div>
    <q-space />

    <!-- SELECT USER ROLE -->
    <select
      v-if="editable"
      v-model="userBuffer.role"
      class="pl-n-select q-mr-sm"
      required
      @input="updateTeamUser"
    >
      <option v-for="role in teamRoles" :key="role.value" :value="role.value">
        {{ role.label }}
      </option>
    </select>
    <div v-else class="f-16 q-mr-md">
      {{ ROLE_LABELS[userBuffer.role] }}
    </div>

    <q-btn
      v-if="editable"
      flat
      dense
      text-color="negative"
      icon="delete"
      @click="promptDeleteUser"
    />
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { teamRoles, ROLE_LABELS } from 'src/modules/constants'
import { strictAssign } from 'src/modules/Utils'
import { useRoute } from 'vue-router'
import useNotify from 'src/composables/useNotify'
import Plexus from 'src/api'
import { useQuasar } from 'quasar'
import PLConfirmationModal from 'src/components/global/PLConfirmationModal.vue'

export default defineComponent({
  emits: ['delete'],
  props: {
    user: Object,
    editable: Boolean
  },
  setup (props, ctx) {
    const route = useRoute()
    const { showError } = useNotify()
    const $q = useQuasar()

    const userBuffer = reactive({
      id: '',
      email: '',
      role: 'member'
    })

    const loading = ref(false)
    const updateTeamUser = async () => {
      try {
        loading.value = true
        await Plexus.API.put(
          `/teams/${route.params.id}/users/${userBuffer.id}`,
          userBuffer
        )
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    const promptDeleteUser = async () => {
      $q.dialog({
        component: PLConfirmationModal,
        componentProps: {
          title: 'Delete User',
          text: `Are you sure you want to remove ${userBuffer.email} from this team? This can't be undone`
        }
      }).onOk(() => {
        deleteTeamUser()
      })
    }

    const deleteTeamUser = async () => {
      try {
        loading.value = true
        await Plexus.API.delete(
          `/teams/${route.params.id}/users/${userBuffer.id}`
        )
        ctx.emit('delete', props.user)
      } catch (err) {
        showError(err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      strictAssign(userBuffer, props.user)
    })
    return {
      ROLE_LABELS,
      teamRoles,
      userBuffer,
      loading,
      updateTeamUser,
      promptDeleteUser
    }
  }
})
</script>

<style lang="scss">
.manage-user-row {
  background-color: #fafafb;
  padding: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  border: 2px solid #e6e6e9;
}
</style>
