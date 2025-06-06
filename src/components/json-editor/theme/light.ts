import { EditorView } from '@codemirror/view'

export const lightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#fff',
    },
  },
  {
    dark: false,
  },
)
