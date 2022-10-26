<template>
  <div class="markdown-editor">
    <div id="editor-container"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue'

import { basicSetup, EditorView } from 'codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark'

const LOCAL_EDIT_EVENT = 'local-edit'
const SAVE_EVENT = 'save'

export default defineComponent({
  name: 'MarkdownEditor',
  emits: [LOCAL_EDIT_EVENT, SAVE_EVENT],
  props: {
    source: String
  },
  setup (props, ctx) {
    const initEditor = () => {
      // const parent = document.getElementById('editor-container')
      const editor = new EditorView({
        doc: props.source,
        extensions: [
          basicSetup,
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
            addKeymap: true
          }),
          oneDarkTheme,
          syntaxHighlighting(oneDarkHighlightStyle),
          keymap.of([indentWithTab]),
          EditorView.updateListener.of((e) => emitLocalEdit(e))
        ]
      })

      const parent = document.getElementById('editor-container')
      parent.appendChild(editor.dom)
    }

    const emitLocalEdit = (e) => {
      if (e.changedRanges.length) {
        ctx.emit(LOCAL_EDIT_EVENT, {
          content: e.state.doc.toString()
        })
      }
    }

    const emitSave = (e) => {
      ctx.emit(SAVE_EVENT)
    }

    emitSave()

    onMounted(() => initEditor())
  }
})
</script>

<style lang="scss">
.markdown-editor {
  height: 100%;
  min-height: 100%;
  max-height: 100%;

  #editor-container {
    height: 1px;
    min-height: 100%;
    overflow-y: auto;
  }

  .cm-scroller {
    overflow: auto
  }

  .cm-editor {
    height: 100%;

    .cm-line {
      color: #fff;
    }

    .cm-panel {

      input[type='checkbox'],
      button {
        cursor: pointer;
      }

    }
  }
}
</style>
