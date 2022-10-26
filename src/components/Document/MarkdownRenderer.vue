<template>
  <Markdown class="markdown-body full-height full-width" :source="source"
    linkify html />
</template>

<script>
import { defineComponent } from 'vue'
import Markdown from 'vue3-markdown-it'

import 'highlight.js/styles/monokai.css'
import 'github-markdown-css/github-markdown-dark.css'

export default defineComponent({
  name: 'MarkdownViewer',
  components: {
    Markdown
  },
  props: {
    source: {
      type: String,
      default: ''
    }
  },
  setup (ctx, props) { }
})
</script>

<style lang="scss">
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 980px;
  margin: 0 auto;
  padding: 30px;

  min-height: 100%;
  height: 100%;
}
</style>
