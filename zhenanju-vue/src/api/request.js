// ============================================================
// axios 请求封装（统一出口）
// 作用：所有页面只从这里发请求，好处是
//   1. baseURL 只写一次，以后后端换域名只改这一处
//   2. 统一处理超时、错误提示，页面里不用重复写 try/catch 细节
//   3. 响应拦截器直接把「后端返回的 data」剥出来，页面拿到的就是业务数据
// ============================================================
import axios from 'axios'

const request = axios.create({
  // 后端接口统一前缀。
  // 用「相对路径 /api」而不是 http://localhost:3000/api，好处有三：
  //   1. 开发时：/api 会被 vite 的代理转发到 localhost:3000（见 vite.config.js）
  //   2. 部署时：前端和后端放在同一个域名下，前端请求 /api 就是同源请求，天然没有跨域
  //   3. 换服务器/换域名时，这段代码一个字都不用改
  baseURL: '/api',
  timeout: 8000 // 超过 8 秒没响应就判定失败，避免页面一直转圈
})

// ---------- 请求拦截器：发请求前统一加工 ----------
request.interceptors.request.use(
  (config) => {
    // 真实项目里通常在这里塞 token：
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ---------- 响应拦截器：拿到响应后统一处理 ----------
request.interceptors.response.use(
  (response) => {
    const body = response.data
    // 后端约定：code === 200 才算成功，否则当作业务错误抛出
    if (body && body.code !== 200) {
      return Promise.reject(new Error(body.msg || '请求失败'))
    }
    // 直接返回剥壳后的结果：{ code, msg, data }
    return body
  },
  (error) => {
    // 网络层错误（服务没启动、跨域被拦、超时等）
    let msg = '网络异常，请检查后端服务是否已启动'
    if (error.code === 'ECONNABORTED') msg = '请求超时，请稍后重试'
    else if (error.response) msg = `请求失败（HTTP ${error.response.status}）`
    return Promise.reject(new Error(msg))
  }
)

export default request
