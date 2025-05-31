## `translations.json` syntax

```jsonc
{
  "pages": {
    "index": {
      // plain text
      "title": {
        "cn": "首页",
        "en": "Home",
      },

      // interpolation
      "error": {
        "cn": "错误: {{error}}",
        "en": "Error: {{error}}",
      },

      // pluralization
      "posts": {
        "cn": "{{user}} 有 {{count}} 篇文章",
        "en": {
          "1": "{{user}} has {{count}} post",
          "other": "{{user}} has {{count}} posts",
        },
      },

      // functional interpolation
      "docs": {
        "cn": "请阅读我们的{{link(文档)}}",
        "en": "Please read our {{link(documentations)}}",
      },
    },
  },
}
```

## Usage

### 1. Use translations in components via `useTranslation` hook

This is the most common way. Using `useTranslation` makes the component re-render when the language changes, so that the messages are always up-to-date.

```tsx
function SomeComponent() {
  const t = useTranslation()

  // plain text messages are just plain strings
  t.pages.index.title

  // other kinds of messages are converted to functions that return a string
  t.pages.index.error({ error: '404' })

  // a pluralized message generates an extra `count` key to determine the plural form
  t.pages.index.posts({ count: 1, user: userName })

  // to use JSX, call the `.jsx` function
  t.pages.index.posts.jsx({ count: 1, user: <b>{userName}</b> })

  // functional interpolation keys are only available in the `.jsx` function
  t.pages.index.docs.jsx({ link: (s) => <a href="/docs">{s}</a> })
}
```

### 2. Use translations outside components via the `i18n` object.

The `i18n` object serves messages of the current language. It has the same structure as the return value of `useTranslation`.

Note that this won't make the component re-render when the language changes, so it's suitable for static messages or messages that don't need to be updated frequently.

```ts
function getMessages() {
  return {
    title: i18n.pages.index.title,
    error: i18n.pages.index.error({ error: '404' }),
  }
}

function SomeComponent() {
  getMessages()
}
```

### 3. Use translations outside components via the `i18nDefer` object.

It differs from `i18n` in that all messages, including plain text ones, are converted to functions, so that we can call them later to get up-to-date messages for the current language.

```ts
const title = i18nDefer.pages.index.title
const error = i18nDefer.pages.index.error

function Component() {
  title()
  error({ error: '404' })
}
```

## Workflow

There is a special section in `translations.json` called `essentials`, which will be statically bundled into the app for displaying messages before the overall translations are loaded. Specifically, it's used to render the error state when the translations fail to load.

`scripts/generate-translations.ts` is a Vite plugin that will split `translations.json` into a `.ts` file for each language, and an `essentials.ts` containing the `essentials` section of every language. The reason to use `.ts` is that it's strongly typed, allowing us to use the type information to generate strictly typed interpolation functions, which is impossible with `.json`.

A bonus by using `.ts` is that TypeScript can now trace the messages' references, so we can use IDE's "Go to definition" to inspect the referenced messages, or use "Find all references" to find where a message is referenced in the codebase.

During development, the plugin watches `translations.json`. When this file is modified, the plugin will re-generate the split files to trigger a hot reload.
