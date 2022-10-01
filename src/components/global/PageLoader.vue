<template>
  <div class="full-width flex flex-center page-loader">
    <q-spinner color="primary" size="10em" class="q-mb-xl" />
    <!--<div class="loader-desc">Loading data, hang tight!</div>-->
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'PageLoader'
})
</script>

<style lang="scss">
.page-loader {
  padding: 100px 50px;
  .loader-desc {
    width: 100%;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
  }
}
</style>
