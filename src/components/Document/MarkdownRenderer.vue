<template>
  <div class="renderer-container full-height full-width">
    <Markdown class="markdown-body" :source="source" linkify html />
  </div>

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
  }
})
</script>

<style lang="scss">
.renderer-container {
  .markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 30px;

    height: 1px;
    min-height: 100%;
    overflow-y: auto;
  }
}
</style>
