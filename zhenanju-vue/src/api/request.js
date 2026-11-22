// ============================================================
// axios 请求封装（统一出口）
// 作用：所有页面只从这里发请求，好处是
//   1. baseURL 只写一次，以后后端换域名只改这一处
//   2. 统一处理超时、错误提示，页面里不用重复写 try/catch 细节
//   3. 响应拦截器直接把「后端返回的 data」剥出来，页面拿到的就是业务数据
// ============================================================
import axios from 'axios'

const request = axios.create({
  // 后端接口地址，按环境自动切换：
  //   本地开发：不设 VITE_API_BASE，走 vite.config.js 里的代理（/api -> http://localhost:3000）
  //   线上部署：在 Netlify 的环境变量里写 VITE_API_BASE=https://xxx.onrender.com/api
  // 这样代码里不再出现 localhost，换部署地址只改环境变量，不用改代码、不用重新想跨域
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  // 本地 8 秒足够；Render 免费实例冷启动要几十秒，生产环境放宽到 60 秒
  timeout: import.meta.env.PROD ? 60000 : 8000
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
