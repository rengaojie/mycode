import { useSocket } from "@/utils/socket.js";


class HomeSocket {
  socket = null
  init() {
    this.socket = useSocket({
        url: `/websocket/PCH5Page_${Date.now()}`,
        protocols: "", // 约定的子协议,没有的时候不传
        query: {},
    });
    // 监听打开
    /*this.socket.subscribe("open", () => {
      console.log("WebSocket连接成功!");
    });*/
    // 监听关闭
    this.socket.subscribe("close", (reason) => {
      console.log("WebSocket连接关闭!", reason);
    });
    // 监听错误
    this.socket.subscribe("error", (err) => {
      console.log("WebSocket捕获错误:", err);
    });
    // 监听重连
    this.socket.subscribe("reconnect", (_socket) => {
      console.log("WebSocket断开重连:", _socket);
      this.socket = _socket;
    });
    // 心跳检测 - 自动,无需主动调用
    // this.socket.heartCheckStart();
  }
  close(){
    // this.socket.clearHeartCheck()
    this.socket.closeSocket()
  }
}

export default HomeSocket;
