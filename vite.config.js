import { defineConfig } from 'vite'

export default defineConfig({
  root: 'web',
  publicDir: '../',   // 把项目根目录作为静态资源目录，registry.json 可通过 /registry.json 访问
  server: {
    port: 17317,
  },
})
