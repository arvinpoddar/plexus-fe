<template>
  <q-page class="flex flex-center"> MAIN PAGE </q-page>
</template>

<script>
import Plexus from 'src/api'
import { defineComponent, onBeforeMount } from 'vue'

export default defineComponent({
  setup () {
    onBeforeMount(async () => {
      // const user = await Plexus.Auth.getUserData()
      const res = await Plexus.API.get('/teams')
      console.log(res)
    })
  }
})
</script>
