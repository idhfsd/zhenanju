// Netlify Function 入口（传统 Node.js Functions，稳定打包 express）
// 把 Express 应用包装成 Netlify 事件处理器；/api/* 的请求由 netlify.toml 重定向到这里。

const serverless = require('serverless-http')
const app = require('../../zhenanju-server/index.js')

// 先把 Lambda 事件里携带的 Netlify Blobs 凭据接进运行时，再交给 Express 处理。
// Lambda 兼容模式下 Blobs 上下文不会自动注入，必须在 getStore 之前调用 connectLambda。
const wrapped = serverless(app)

exports.handler = async (event, context) => {
  app.initBlobsContext(event)
  return wrapped(event, context)
}
