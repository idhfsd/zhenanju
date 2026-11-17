
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body && body.code !== 200) {
      return Promise.reject(new Error(body.msg || '请求失败'))
    }

    return body
  },
  (error) => {
    // 优先显示后端返回的真实错误信息
    const serverMessage = error.response?.data?.msg

    let msg = serverMessage || '网络异常，请检查后端服务是否已启动'

    if (error.code === 'ECONNABORTED') {
      msg = '请求超时，请稍后重试'
    } else if (!serverMessage && error.response) {
      msg = `请求失败（HTTP ${error.response.status}）`
    }

    return Promise.reject(new Error(msg))
  }
)

export default request
