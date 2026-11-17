// Netlify Server 入口
// 平台约定：本文件被 Netlify Server 加载后，导出的默认处理器会接管配置的路径。
// 这里复用 zhenanju-server 里的同一个 Express 应用，避免把路由复制两份。

import serverApp from "../../zhenanju-server/index.js"

// 只把 /api/* 交给后端 Express；页面、JS、CSS 等静态资源仍由 Netlify CDN 直接发布，
// 这样既不会和前端 dist 抢路由，也能保证接口和页面同源（前端请求的是相对路径 /api）。
export const config = {
  path: "/api/*",
  includedFiles: [
    "../../zhenanju-server/data/**",
    "../../zhenanju-vue/dist/**"
  ]
}

// Express 是 Node http 应用；Netlify Server 支持把它作为 fetch 风格应用直接挂载。
export default serverApp
