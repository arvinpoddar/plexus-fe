<template>
  <q-page class="flex flex-center"> MAIN PAGE </q-page>
</template>

<script>
import Team from 'src/api/models/Team'
import { defineComponent, onBeforeMount } from 'vue'

export default defineComponent({
  setup () {
    onBeforeMount(async () => {
      // const user = await Plexus.Auth.getUserData()
      const res = await Team.getForUser()
      console.log(res)
    })
  }
})
</script>
