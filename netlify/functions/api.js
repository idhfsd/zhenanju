// Netlify Function 入口（传统 Node.js Functions，稳定打包 express）
// 把 Express 应用包装成 Netlify 事件处理器；/api/* 的请求由 netlify.toml 重定向到这里。

const serverless = require('serverless-http')
const app = require('../../zhenanju-server/index.js')

// serverless-http 会把 Netlify 的事件转换成 Node req/res，Express 路由按原样工作。
exports.handler = serverless(app)
