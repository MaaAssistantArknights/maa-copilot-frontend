import { json } from '@codemirror/lang-json'
import { Annotation, EditorState } from '@codemirror/state'
import { ViewUpdate } from '@codemirror/view'

import { EditorView, basicSetup } from 'codemirror'
import { FC, useEffect, useLayoutEffect, useRef } from 'react'

import { useThemeFromBodyClass } from 'utils/useThemeFromBodyClass'

import { darkTheme } from './theme/dark'
import { lightTheme } from './theme/light'

const External = Annotation.define<boolean>()

export interface JsonEditorProps {
  className?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export const JsonEditor: FC<JsonEditorProps> = (props) => {
  const { className, value, onChange, onBlur } = props

  const editor = useRef<HTMLDivElement | null>(null)
  const view = useRef<EditorView>()
  const theme = useThemeFromBodyClass()

  useLayoutEffect(() => {
    if (editor.current) {
      const updateListener = EditorView.updateListener.of((vu: ViewUpdate) => {
        if (
          vu.docChanged &&
          // 区分 editor 内外部 update，避免死循环
          !vu.transactions.some((tr) => tr.annotation(External))
        ) {
          const doc = vu.state.doc.toString()
          onChange(doc)
        }
      })

      const currentExtension = [
        basicSetup,
        updateListener,
        json(),
        EditorView.lineWrapping,
      ]

      if (theme === 'light') currentExtension.push(lightTheme)
      if (theme === 'dark') currentExtension.push(darkTheme)

      const state = EditorState.create({
        doc: value,
        extensions: currentExtension,
      })

      view.current = new EditorView({
        state,
        parent: editor.current,
      })

      if (onBlur && view.current) {
        view.current.dom.addEventListener('blur', onBlur)
      }
    }

    return () => {
      if (view.current) {
        view.current.destroy()
        if (onBlur) view.current.dom.removeEventListener('blur', onBlur)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, onBlur, theme, editor])

  // update inner editor state
  useEffect(() => {
    if (value === undefined) {
      return
    }
    const currentValue = view.current ? view.current.state.doc.toString() : ''
    if (view.current && value !== currentValue) {
      view.current.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value || '' },
        annotations: [External.of(true)],
      })
    }
  }, [value, view])

  return <div ref={editor} className={className} />
}
