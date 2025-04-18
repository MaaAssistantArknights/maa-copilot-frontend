import react from '@vitejs/plugin-react'

import { defineConfig, loadEnv } from 'vite'
import viteTsconfigPath from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), viteTsconfigPath()],
    server: {
      port: +env.PORT || undefined,
    },
    resolve: {
      alias: {
        src: require('path').resolve(__dirname, 'src'),
      },
    },
    build: {
      sourcemap: false,
    },
  }
})
