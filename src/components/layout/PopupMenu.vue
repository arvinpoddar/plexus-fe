<template>
  <q-menu
    :offset="[0, 10]"
    anchor="bottom end"
    self="top right"
    class="popup-menu-outer"
  >
    <q-list class="popup-menu-list">
      <!-- Account and User Roles -->
      <q-item
        clickable
        v-close-popup
        to="/app"
        class="popup-menu-item"
        active-class="q-item-no-link-highlighting"
      >
        <q-item-section>Home</q-item-section>
      </q-item>
      <q-item
        clickable
        v-close-popup
        to="/account"
        class="popup-menu-item"
        active-class="q-item-no-link-highlighting"
      >
        <q-item-section>My Account</q-item-section>
      </q-item>
      <q-item
        v-if="activeTeam"
        clickable
        v-close-popup
        :to="`/team/${activeTeam.id}`"
        class="popup-menu-item"
        active-class="q-item-no-link-highlighting"
      >
        <q-item-section>Manage This Team</q-item-section>
      </q-item>
      <q-separator />

      <!-- Teams List -->
      <div v-if="teams.length > 1">
        <q-item
          v-for="team in teams"
          :key="team.name"
          clickable
          v-close-popup
          :class="{
            'popup-menu-item': true,
            'popup-menu-item-icon': team.id === activeTeam.id,
          }"
          @click="setActiveTeam(team)"
        >
          <q-item-section avatar v-if="team.id === activeTeam.id">
            <q-icon name="check" />
          </q-item-section>
          <q-item-section>{{ team.name }}</q-item-section>
        </q-item>
        <q-separator />
      </div>

      <!-- Logout -->
      <q-item clickable v-close-popup class="popup-menu-item" @click="logout">
        <q-item-section class="text-negative">Logout</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import useSetTeams from 'src/composables/useSetTeams'
import { logout } from 'src/modules/Utils'
import Team from 'src/api/models/Team'

export default defineComponent({
  name: 'PopupMenu',
  setup () {
    const { setCurrentTeam } = useSetTeams()

    const teams = ref([])
    const activeTeam = ref(null)

    const setActiveTeam = async (team) => {
      if (team.id !== activeTeam.value.id) {
        await setCurrentTeam(team)
      }
    }

    onMounted(async () => {
      teams.value = await Team.getForUser()
      if (teams.value.length) {
        activeTeam.value = teams.value[0]
        await Team.setCurrentTeam(teams.value[0])
      }
    })

    return {
      teams,
      activeTeam,
      setActiveTeam,
      logout
    }
  }
})
</script>

<style lang="scss">
.popup-menu-outer {
  border-radius: 10px;
  .popup-menu-list {
    min-width: 250px;
    border-radius: 10px;
    .popup-menu-item {
      padding-left: 50px;
    }

    .popup-menu-item:first-child {
      padding-top: 12px;
    }

    .popup-menu-item:last-child {
      padding-bottom: 12px;
    }

    .popup-menu-item-icon {
      padding-left: 16px;
      .q-item__section--avatar {
        min-width: unset;
      }
      .q-item__section--side {
        padding-right: 10px;
      }
    }
  }
}
</style>
