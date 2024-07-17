// import {wsHost} from '/config.js'
const baseURL = 'ws://' + import.meta.env.VITE_API_WS_URL;
const EventTypes = ["open", "close", "message", "error", "reconnect"];
const DEFAULT_CHECK_TIME = 20 * 1000; // 心跳检测的默认时间
const DEFAULT_CHECK_COUNT = 3; // 心跳检测默认失败重连次数
const DEFAULT_CHECK_DATA = { msgType: 'connectionHeartBeat' }; // 心跳检测的默认参数 - 跟后端协商的
const CLOSE_ABNORMAL = 1006; // WebSocket非正常关闭code

class EventMap {
  deps = new Map();
  depend(eventType, callback) {
    this.deps.set(eventType, callback);
  }
  notify(eventType, event) {
    if (this.deps.has(eventType)) {
      this.deps.get(eventType)(event);
    }
  }
}

class Socket extends WebSocket {
  heartCheckData = DEFAULT_CHECK_DATA;
  heartCheckTimeout = DEFAULT_CHECK_TIME;
  heartCheckInterval = null;
  heartCheckCount = DEFAULT_CHECK_COUNT;
  constructor(options, dep, reconnectCount = 0) {
    let _baseURL = baseURL;
    const {
      url,
      protocols,
      query = {},
      greet = null,
      customBase = null, // 重置baseURL
    } = options;


    const _queryParams = Object.keys(query).reduce((str, key) => {
      if (typeof query[key] !== "object" && typeof query[key] !== "function") {
        return (str +=
          str.length > 0 ? `&${key}=${query[key]}` : `${key}=${query[key]}`);
      } else {
        return str;
      }
    }, "");
    if (customBase) {
      _baseURL = customBase;
    }

    if(protocols){
      super(`${_baseURL}${url}?${_queryParams}`, protocols); // 存在约定子协议的时候
    }else{
      super(`${_baseURL}${url}`);
    }

    this._currentOptions = options;
    this._dep = dep;
    this._reconnectCount = reconnectCount;
    greet &&
      Object.assign(this, {
        heartCheckData: greet,
      });
    this.initSocket();
  }

  // 初始化WebSocket
  initSocket() {
    // 监听webSocket的事件
    this.onopen = function (e) {
      this._dep.notify("open", e);
      // 开启心跳检测
      // this.heartCheckStart();
    };
    this.onclose = function (e) {
      this._dep.notify("close", e);
      // 如果WebSocket是非正常关闭 则进行重连
      if (e.code === CLOSE_ABNORMAL) {
        if (this._reconnectCount < this.heartCheckCount) {
          this._reconnectCount++;
          const _socket = new Socket(
            this._currentOptions,
            this._dep,
            this._reconnectCount,
          );
          this._dep.notify("reconnect", _socket);
        } else {
          console.log("WebSocket重连失败");
        }
      }
    };
    this.onerror = function (e) {
      this._dep.notify("error", e);
    };
    this.onmessage = function (e) {
      // 如果后端返回的是二进制数据
      if (e.data instanceof Blob) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.data);
        reader.onload = (ev) => {
          if (ev.target.readyState === FileReader.DONE) {
            this._dep.notify("message", ev.target?.result);
          }
        };
      } else {
        // 处理普通数据
        try {
          const _parseData = JSON.parse(e.data);
          this._dep.notify("message", _parseData);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }

  // 订阅事件
  subscribe(eventType, callback) {
    if (typeof callback !== "function")
      throw new Error("The second param is must be a function");
    if (!EventTypes.includes(eventType))
      throw new Error("The first param is not supported");
    this._dep.depend(eventType, callback);
  }

  // 发送消息
  sendMessage(data, options = {}) {
    const { transformJSON = true } = options;
    let result = data;
    if (transformJSON) {
      result = JSON.stringify(data);
    }
    this.send(result);
  }

  // 关闭WebSocket
  closeSocket(code, reason) {
    this.close(code, reason);
  }

  // 开始心跳检测
  heartCheckStart() {
    this.heartCheckInterval = setInterval(() => {
      if (this.readyState === this.OPEN) {
        let transformJSON = typeof this.heartCheckData === "object";
        this.sendMessage(this.heartCheckData, { transformJSON });
      } else {
        this.clearHeartCheck();
      }
    }, this.heartCheckTimeout);
  }

  // 清除心跳检测
  clearHeartCheck() {
    clearInterval(this.heartCheckInterval);
  }

  // 重置心跳检测
  resetHeartCheck() {
    clearInterval(this.heartCheckInterval);
    this.heartCheckStart();
  }
}
// 默认的配置项
const defaultOptions = {
  url: "",
  protocols: "", // 约定的子协议,没有的时候不传
  query: {},
};

export const useSocket = (options = defaultOptions) => {
  if (!window.WebSocket) {
    console.log("您的浏览器不支持WebSocket, 请更换浏览器!");
    return;
  }
  const dep = new EventMap();
  const reconnectCount = 0;

  return new Socket(options, dep, reconnectCount);
};

// xx.jsx or xx.vue
// import { useSocket } from './socket.js'
// const socket = ref(null) // WebSocket实例
// const initWebSocket = () => {
// 	const options = {
// 		url: '/<your url>',
// 		query: {
// 			// something params
// 		},
// 	}
// 	socket.value = useSocket(options)
// 	socket.value.subscribe('open', () => {
// 		console.log('WebSocket连接成功!')
// 		const greet = 'hello'
// 		// 发送打招呼消息
// 		socket.value.sendMessage(greet)
// 	})
// 	socket.value.subscribe('close', reason => {
// 		console.log('WebSocket连接关闭!', reason)
// 	})
// 	socket.value.subscribe('message', result => {
// 		console.log('WebSocket接收到消息:', result)
// 	})
// 	socket.value.subscribe('error', err => {
// 		console.log('WebSocket捕获错误:', err)
// 	})
// 	socket.value.subscribe('reconnect', _socket => {
// 		console.log('WebSocket断开重连:', _socket)
// 		socket.value = _socket
// 	})
// }
// initWebSocket()
