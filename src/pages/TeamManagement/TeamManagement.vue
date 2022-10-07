<template>
  <q-page class="pl-drawer-page pl-unset-height documents-layout">
    <TeamInfoCard class="q-mb-lg" />
    <ManageUsersCard />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

import ManageUsersCard from 'src/components/TeamManagement/ManageUsersCard'
import TeamInfoCard from 'src/components/TeamManagement/TeamInfoCard.vue'

export default defineComponent({
  components: {
    ManageUsersCard,
    TeamInfoCard
  },
  setup () {}
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
