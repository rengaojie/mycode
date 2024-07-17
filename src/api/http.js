import {message} from "ant-design-vue";
import axios from 'axios'

window.$message = message

//基本配置
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL+'/visualizedPlatform/'

axios.defaults.timeout = 30000
axios.defaults.headers = {
  'api-version': '2.0',
  }
let time = null
//请求拦截
axios.interceptors.request.use(
  (config) => {
    // 处理后返回
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

//响应拦截
axios.interceptors.response.use(
  (res) => {
    // console.log(1111,res)
    // 处理后返回
    return res
  },
  (error) => {
    // 错误处理
    if (time) {
      return
    }
    time = setTimeout(() => {
      window.$message.error('网络错误,请稍候重试')
      time = null
    }, 4000)
    return Promise.reject(error)
  }
)

//请求主体
const httpServer = function (opt, data) {
  // 参数判断
  let defaultOptions = {
    url: opt.url,
    method: opt.methods || 'GET',
    responseType: 'json'
  }
  if (opt.methods === 'GET') {
    defaultOptions.params = data
  } else {
    defaultOptions.data = data || {}
  }
  return new Promise((resolve, reject) => {
    axios(defaultOptions)
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export default httpServer
