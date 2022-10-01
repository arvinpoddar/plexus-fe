<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar class="nav-bar">
        <q-toolbar-title class="row items-center">
          <!-- Link back to dashboard -->
          <router-link to="/login" class="nav-logo-link flex flex-center">
            <img src="~assets/badge-theme.png" />
          </router-link>

          <span class="f-bold">{{ pageTitle }}</span>
        </q-toolbar-title>

        <q-btn
          label="New Doc"
          class="pl-btn"
          color="primary"
          no-wrap
          to="/new-doc"
        />

        <q-separator vertical class="q-mx-md" />

        <div class="user-info row items-center cursor-pointer">
          <div class="user-titles col">
            <div class="ellipsis user-name" v-if="user">
              {{ user.name }}
            </div>
            <div class="ellipsis user-org" v-if="team">
              {{ team.name }}
            </div>
          </div>
          <q-btn flat icon="arrow_drop_down" dense class="text-grey-6" />
          <PopupMenu />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import PopupMenu from 'src/components/layout/PopupMenu'
import Plexus from 'src/api'
import UserData from 'src/modules/UserData'

export default defineComponent({
  name: 'MainLayout',
  components: {
    PopupMenu
  },
  setup () {
    const route = useRoute()

    const user = ref(null)
    const team = ref(null)

    const pageTitle = computed(() => {
      return route?.meta?.title
    })

    onMounted(async () => {
      user.value = await Plexus.Auth.getUserData()
      team.value = await UserData.getCurrentTeam()
    })
    return {
      pageTitle,
      user,
      team
    }
  }
})
</script>

<style lang="scss">
.drawer-menu {
  .drawer-logo {
    width: 182px;
    margin: 20px auto 0px 25px;
  }
}

.q-drawer--left.q-drawer--bordered {
  border-right: 1px solid #e2e2ea;
}

.nav-bar {
  height: 70px;
  color: #000;
  background-color: #fff;
  border-bottom: 1px solid #e2e2ea;

  .nav-logo-link {
    height: 70px;
    margin-left: 5px;
    margin-right: 15px;
    img {
      width: 30px;
    }
  }

  .user-info {
    max-width: 275px;
    .user-titles {
      margin-right: 50px;
      .user-name {
        font-size: 14px;
        font-weight: 600;
      }
      .user-org {
        color: var(--dark-grey);
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
}
</style>
