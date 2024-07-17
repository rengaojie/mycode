<template>
  <div class="home">
    <topHeader />
    <div class="homeContent">
      <div class="posContent">
        <div
          class="item"
          :class="['item' + item.beltId]"
          v-for="item in beltList"
          :key="item.beltId"
        >
          <ul class="cameraList">
            <li
              class="cameraItem"
              v-for="camera in item.deviceList"
              :key="camera.deviceId"
              @click="watchCamera(camera)"
              :style="{'left':camera.left+'%'}"
              :class="{ isAi: camera.isAIDevice, isOffLine: !camera.isOnLine, isError: false }"
            ></li>
          </ul>
          <div class="belt">
            <div class="beltBg">
              <div class="coalQuantity" :class="['coalQuantity'+item.status.beltCoalQuantityState]"></div>
            </div>
            <div class="speed">
              <div class="speedTxt">{{item.status.beltSpeed}}</div>
              <span>m/s</span>
            </div>
          </div>
          <div class="beltInfo">
            <ul class="infoWrap">
              <li class="name">
                <span>{{ item.beltName }}</span>
                <span class="icon" :class="{'stop':item.status.beltSpeed === 0}"></span>
              </li>
              <li>电流:<span class="num">{{item.status.beltCurrent}}</span> A</li>
              <li>电压:<span class="num">{{item.status.beltVoltage}}</span> V</li>
            </ul>
          </div>
        </div>

        <div class="msgWrap" v-if="showMsg" @mousemove="setShowTime">
          <div class="msgInfo">
            <div class="title"><span class="icon"></span>AI摄像机异常告警</div>
            <ul class="infoList">
              <li><span>摄像头名称:</span> <span>{{currentErrInfo.deviceName}}</span></li>
              <li><span>告警类型:</span> <span>{{currentErrInfo.warningTypeName}}</span></li>
              <li><span>告警位置:</span> <span>{{currentErrInfo.warningPosition}}</span></li>
              <li><span>模型名称:</span> <span>{{currentErrInfo.modelName}}</span></li>
              <li><span>发生事件:</span> <span>{{ dayjs(currentErrInfo.warningTime).format('MM-DD HH:mm:ss') }}</span></li>
            </ul>
          </div>
          <div class="cameraInfo msgInfo">
            <div class="title">异常告警视频</div>
            <div class="videoContent" style="cursor: pointer" @click="playBack(currentErrInfo)">
              <img style="width: 100%;height: 100%" :src="currentErrInfo.warningPictureURL" alt="">
            </div>
          </div>
        </div>

        <div class="tableWrap">
          <div class="topTable">
            <div class="table">
              <a-table
                :columns="columns"
                :data-source="cameraErrData"
                :pagination="false"
                :customHeaderRow="customHeaderRow"
                :rowClassName="rowClassName"
                bordered
              >
                <template #bodyCell="{ column, text,record }">
                  <template v-if="column.dataIndex === 'key'">
                    <div>{{ text }}</div>
                  </template>
                  <template v-if="column.dataIndex === 'playback'">
                    <div
                      style="display: flex; justify-content: center; cursor: pointer"
                      @click="playBack(record)"
                    >
                      <span class="playIcon"></span>
                    </div>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
          <div class="page">
            <pagination :total="cameraErrNum" :page-size="6" :current-page="currentPage" @onShowSizeChange="pageChange" />
          </div>
        </div>

        <div class="warningIcon" @click="getMsgList">
          <div class="num">{{unreadNum}}</div>
        </div>

        <div class="coalBunker1">
          <img src="@/assets/image/coalBunker.png" alt="" />
          <p>井下煤仓</p>
        </div>
        <div class="coalBunker2">
          <ul>
            <li>煤仓1</li>
            <li>煤仓2</li>
          </ul>
          <p>井上煤仓</p>
        </div>
        <div class="legend">
          <div style="display: flex">
            <ul v-for="item in beltStateList" :key="item.beltId">
              <li>{{item.beltControlStateTitle}}</li>
              <li v-for="(list,index) in item.beltControlStateNameArray" :key="list" class="list">
                <span class="icon" :class="{'active':index === item.selectedBeltControlStateIndex}"></span>
                <span>{{list}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="tableContent">
        <div class="item">
          <ul class="name">
            <li class="title"></li>
            <li v-for="item in selfWarningName" :key="item">{{item.selfWarningName}}</li>
          </ul>
          <ul>
            <li v-for="item in warningList" :key="item.beltId">
              <ul class="name">
                <li  class="title">{{item.beltName}}</li>
                <li class="block" v-for="list in item.selfWarningStateList" :key="list.selfWarningName">
                  <div class="blockItem" :class="{'err':list.selfWarningState === 1}"></div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="item atresiaState ">
          <ul class="name">
            <li class="title"></li>
            <li style="width: 200px;justify-content: left;">皮带沿线闭锁</li>
          </ul>
          <ul>
            <li v-for="item in atresiaState" :key="item.beltId">
              <ul class="name">
                <li class="title">{{item.beltName}}</li>
                <li class="block" style="width: 20px" v-for="(list,index) in item.atresiaStateList" :key="index">
                  <div class="blockItem" style="text-align: center" :class="{'err':list === 1}">{{index + 1}}</div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <modal
      v-model:openModal="openVideoModal"
      width="1400px"
      :key="modalKey"
      @handle-close="closeVideoModal"
      @handle-ok="closeVideoModal"
    >
      <div class="videoContentModal">
        <div class="title">{{currentCamera.deviceName}}</div>
        <video class="videoMain" id="videoMain"></video>
        <ul class="videoInfo" v-if="showInfo">
          <li class="name">{{currentCamera.devicePositionDesc}}</li>
          <li>是否AI摄像头: <span>{{currentCamera.isAIDevice===1?'是':'否'}}</span></li>
     <!-- <li>部署信息: <span>正常</span></li>-->
          <li class="warning"> <span class="warningIcon"></span> 告警: <span>({{currentCamera.unreadWarningCount}})</span></li>
     <!-- <li>样本采集: <span>开</span></li>-->
        </ul>
      </div>
    </modal>
    <modal
      v-model:openModal="openMsgModal"
      width="1200px"
      title="消息列表"
      :footer="false"
      @handle-close="openMsgModal = false"
    >
      <div class="msgTable">
        <a-table
          :columns="columns"
          :data-source="msgListData"
          :pagination="false"
          :customHeaderRow="customHeaderRow"
          :rowClassName="rowClassName"
        >
          <template #bodyCell="{ column, text,record }">
            <template v-if="column.dataIndex === 'key'">
              <div>{{ text }}</div>
            </template>
            <template v-if="column.dataIndex === 'playback'">
              <div
                style="display: flex; justify-content: center;align-items: center; cursor: pointer"
              >
                <span class="playIcon" @click="playBack(record)"></span>
                <span :class="record.readMark === 0?'unread':'read'" @click="setRead(record)">{{record.readMark === 0 ?'已读':'未读'}}</span>
              </div>
            </template>
          </template>
        </a-table>
      </div>

    </modal>
  </div>
</template>

<script setup>
import topHeader from '@/components/Header.vue'
import pagination from '@/components/pagination.vue'
import modal from '@/components/modal.vue'
import dayjs from "dayjs";
import flvjs from "flv.js"
import {ref, onMounted, nextTick} from 'vue'
import {message} from "ant-design-vue";
import HomeSocket from '@/utils/homeSocket.js'

import {
  getAllBeltWebList,
  getAllBeltState,
  getAllBeltSelfWarningState,
  getAllBeltAtresiaState,
  getDeviceWarningList,
  getWarningList,
  getAllDeviceState,
  getAllWarningUnreadCount,
  warningConfirm} from '@/api/index.js'
import { customHeaderRow, rowClassName, legendList } from './utils.js'

let homeSocket = null

let openVideoModal = ref(false)
let openMsgModal = ref(false)
let modalKey = ref(Date.now())

// 摄像头报警列表
const columns = [
  {
    title: '序号',
    dataIndex: 'key',
    width: 65
  },
  {
    title: '告警类型',
    dataIndex: 'warningTypeName',
    ellipsis: true,
    width: 100
  },
  {
    title: '告警摄像头',
    ellipsis: true,
    dataIndex: 'deviceName'
  },
  {
    title: '所在位置',
    ellipsis: true,
    dataIndex: 'warningPosition'
  },
  {
    title: '告警模型',
    ellipsis: true,
    dataIndex: 'modelName'
  },
  {
    title: '发生时间',
    ellipsis: true,
    dataIndex: 'warningTime'
  },
  {
    title: '回放',
    dataIndex: 'playback',
    width: 100
  }
]
const cameraErrData = ref([])


let JSWebrtc = window.JSWebrtc
let flvPlayer = ref(null)

onMounted(() => {
  getBeltList()
  // 获取需要刷新的数据
  // refreshedData()
  openSocket()
  //这个是报警列表,等有报警的时候在触发更新
  getDeviceWarningListData()
})


// 要实时刷新的数据列表
const refreshedData = () => {
  getBeltState()
  getBeltSelfWarningState()
  getBeltAtresiaState()
  getUnreadNum()
  getAllDeviceStateData()
}

// 皮带控制状态


// 查看摄像头视频
let showInfo = ref(true)
let currentCamera = ref({})
const watchCamera = (item,type)=>{
  showInfo.value = true
  if(!item.isOnLine || !item.isAvailable){
    message.warn('当前摄像机未不在线,或未启用')
    return
  }
  currentCamera.value = item
  openVideoModal.value = true
  nextTick(()=>{
    let videoMain = document.getElementById('videoMain')
    flvPlayer.value = new JSWebrtc.Player(
      item.deviceVideoURL,
      {
        video: videoMain,
        autoplay: true,
        onPlay: (obj) => { console.log("start play")}
      }
    );
  })
}

// 回看
let player = ref()
const playBack = (item)=>{
  console.log(item)
  showInfo.value = false
  modalKey.value = Date.now()
  openVideoModal.value = true
  currentCamera.value = item
  nextTick(()=>{
    let videoMain = document.getElementById('videoMain')
    player.value = flvjs.createPlayer({
      type: 'mp4',
      isLive: true,
      url: item.warningVideoURL
    });
    player.value.attachMediaElement(videoMain);
    player.value.load();
    player.value.play();
  })
}

// 首页报警列表
let currentPage = ref(1)
let cameraErrNum = ref(0)
const getDeviceWarningListData = ()=>{
  getDeviceWarningList({
    isPage:true,
    pageSize:6,
    pageIndex:currentPage.value
  }).then(res=>{
    let data = res.data.data.deviceWarningList || []
    cameraErrNum.value = res.data.count || 0
    data.forEach((item, index) => {
      item.key = index + 1
      item.warningTime = dayjs(item.warningTime).format('MM-DD HH:mm:ss')
    })
    cameraErrData.value = data
  })
}
const pageChange = (page)=>{
  currentPage.value = page
  getDeviceWarningListData()
}

// 获取未读数量
let unreadNum = ref(0)
const getUnreadNum = ()=>{
  getAllWarningUnreadCount({}).then(res=>{
    unreadNum.value = res.data.data.allWarningUnreadCount
  })
}

// 获取未读报警列表
let msgListData = ref([])
const getMsgList = ()=>{
  openVideoModal.value = false
  getWarningList({
    readMark:0,
    isPage:false,
  }).then(res=>{
    let data = res.data.data.warningList || []
    data.forEach((item,index)=>{
      item.key = index + 1
      item.warningTime = dayjs(item.warningTime).format('MM-DD HH:mm:ss')
    })
    msgListData.value = data
  })
  openMsgModal.value = true

}

// 未读消息置为已读
let currentMsg = ref({
  warningId:null
})
const setRead = (info)=>{
  currentMsg.value = info
  setWarningConfirm()
}
let setWarningConfirm = ()=>{
  warningConfirm({
    warningId:currentMsg.value.warningId
  }).then(res=>{
    if(res.data.message){
      message.warn(res.data.message)
      return
    }
    getMsgList()
  })
}


// 获取皮带告警列表
let selfWarningName = ref([])
let warningList = ref([])
const getBeltSelfWarningState =()=>{
  getAllBeltSelfWarningState().then(res=>{
    warningList.value = res.data.data.selfWarningList
    selfWarningName.value =  warningList.value[0].selfWarningStateList
  })
}

// 获取皮带闭锁状态
let atresiaState = ref([])
const getBeltAtresiaState = ()=>{
  getAllBeltAtresiaState().then(res=>{
    atresiaState.value = res.data.data.beltAtresiaStateList
  })
}

// 皮带状态列表
let beltStateList = ref([])
const getBeltState = ()=>{
  getAllBeltState().then((res) => {
    let data = res.data.data.beltStateList || []
    beltStateList.value =  res.data.data.beltStateList || []
    console.log(data)
    beltList.value.forEach((item) => {
      data.forEach((list) => {
        if (list.beltId === item.beltId) {
          item.status = list
        }
      })
    })
  })
}

// 获取皮带列表
let beltList = ref([])
const getBeltList = () => {
  getAllBeltWebList().then((res) => {
    beltList.value = res.data.data.allBeltWebList
    beltList.value.forEach(item=>{
      let beltLength = item.beltLength
      item.deviceList.forEach(camera=>{
        camera.left = (camera.devicePosition/beltLength) * 100
      })
      item.status = []
    })
     refreshedData()
  })
}

// 获取皮带下摄像头状态
const getAllDeviceStateData = ()=>{
  getAllBeltWebList().then((res) => {
    let list = res.data.data.allBeltWebList
    beltList.value.forEach(item=>{
      list.forEach( listItem=>{
        if(item.beltId === listItem.beltId){
          let beltLength = item.beltLength
          item.deviceList = listItem.deviceList
          item.deviceList.forEach(camera=>{
            camera.left = (camera.devicePosition/beltLength) * 100
          })
        }
      })
    })
  })
}

// 获取实时摄像头报警
let showMsg = ref(false)
let time = ref()
let currentErrInfo = ref({})
const openSocket = () => {
  // 连接socket
  homeSocket = new HomeSocket()
  homeSocket.init()
  homeSocket.socket.subscribe('open', () => {
    console.log('WebSocket连接成功!')
    // 发送打招呼消息
   /* const json = {
      "layerCode": [1]
    }
    homeSocket.socket.send(JSON.stringify(json))*/
    homeSocket.socket.subscribe('message', (message) => {
      if(message.msgType === 'warningInfoNotify'){
        currentErrInfo.value = message
        getDeviceWarningListData() // 更新报警列表
        setShowTime()
      }
    })
  })
}

const setShowTime = ()=>{
  showMsg.value = true
  if(time.value){
    clearTimeout(time.value)
  }
  time.value = setTimeout(()=>{
    showMsg.value = false
  },10000)
}

const closeVideoModal = () => {
  openVideoModal.value = false
  if(player.value){
    player.value.destroy()
    player.value = null
  }
}
</script>

<style lang="less" scoped>
.playIcon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url('@/assets/image/playback.png') no-repeat;
  background-size: 100% 100%;
}
.home {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  color: #adbbda;
  .homeContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    .posContent {
      flex: 1;
      position: relative;
      .item {
        width: 286px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        position: absolute;
        .cameraList {
          width: 100%;
          height: 40px;
          position: relative;
          left: -25px;
          .cameraItem {
            width: 32px;
            height: 34px;
            background: url('@/assets/image/cameraStatus.png') no-repeat;
            background-size: 100% 100%;
            cursor: pointer;
            position: absolute;
            top: 5px;
            &.isOffLine {
              background: url('@/assets/image/cameraStatusOff.png') no-repeat;
              background-size: 100% 100%;
            }
            &.isError {
              background: url('@/assets/image/cameraStatusErr.png') no-repeat;
              background-size: 100% 100%;
            }
            &.isAi {
              background: url('@/assets/image/cameraStatus1.png') no-repeat;
              background-size: 100% 100%;
              &.isOffLine {
                background: url('@/assets/image/cameraStatus1Off.png') no-repeat;
                background-size: 100% 100%;
              }
              &.isError {
                background: url('@/assets/image/cameraStatus1Err.png') no-repeat;
                background-size: 100% 100%;
              }
            }
          }
        }
        .belt {
          width: 100%;
          height: 52px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          .beltBg {
            flex: 1;
            height: 100%;
            background: url('@/assets/image/belt.png') no-repeat;
            background-size: 100% 100%;
            .coalQuantity{
              width: 100%;
              height: 15px;
              margin-left: 5px;
              &.coalQuantity1{
                background: url('@/assets/image/coalQuantity1.gif') no-repeat;
                background-size: 100% 100%;
              }
              &.coalQuantity2{
                background: url('@/assets/image/coalQuantity2.gif') no-repeat;
                background-size: 100% 100%;
              }
              &.coalQuantity3{
                background: url('@/assets/image/coalQuantity3.gif') no-repeat;
                background-size: 100% 100%;
              }
            }
          }
          .speed {
            position: absolute;
            width: 60px;
            display: flex;
            align-items: center;
            color: #bfdbfc;
            right: -65px;
            .speedTxt {
              font-size: 16px;
              color: #00b755;
              text-align: center;
              margin-right: 4px;
              width: 40px;
              height: 25px;
              line-height: 25px;
              background: #21273a;
              border: 1px solid #ffffff;
            }
          }
        }
        .beltInfo {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          .infoWrap {
            width: 150px;
            min-height: 80px;
            background: #173473;
            border-radius: 2px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            li {
              font-size: 14px;
              color: #bbcde6;
              font-weight: 600;
              &.name {
                display: flex;
                justify-content: space-between;
                .icon {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  background: url('@/assets/image/beltStatus1.png') no-repeat;
                  background-size: 100% 100%;
                  &.stop{
                    background: url('@/assets/image/beltStatus2.png') no-repeat;
                    background-size: 100% 100%;
                  }
                }
              }
              .num {
                color: #00b755;
                margin: 0 6px;
              }
            }
          }
        }
        &.item1 {
          left: 130px;
          bottom: 30px;
        }
        &.item2 {
          left: 220px;
          bottom: 300px;
        }
        &.item3 {
          left: 700px;
          bottom: 440px;
        }
        &.item4 {
          left: 1080px;
          bottom: 590px;
        }
      }
      .tableWrap {
        position: absolute;
        right: 360px;
        bottom: 50px;
        .topTable {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 260px;
          border: 1px solid #2b7cb5;
          .table {
            width: 850px;
            height: 100%;
            overflow: auto;
            :deep(.ant-table-wrapper) {
              .ant-table-thead > tr > th {
                border-bottom: 1px solid #1f3d73;
                border-inline-end: 1px solid #1f3d73;
                font-weight: 600;
                font-size: 16px;
                color: #ffffff;
                padding: 7px;
              }
              .default-row {
                td {
                  background: #0b1442 !important;
                }
              }
              .double-row {
                td {
                  background: #080a35 !important;
                }
              }
              td {
                padding: 7px;
                color: #fff;
                border: none;
                border-inline-end: 1px solid #1f3d73;
                background: none !important;
              }
            }
          }
        }
        .page {
          flex: 0 0 60px;
        }
      }
      .msgWrap {
        position: absolute;
        right: 20px;
        top: 70px;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        .msgInfo {
          width: 280px;
          height: 257px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          &.cameraInfo {
            overflow: hidden;
            .title {
              width: 100%;
              background-color: #007db9;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .videoContent {
              width: 100%;
              height: 212px;
              background: #070a37;
              border: 1px solid #2f64bd;
            }
          }
          .title {
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            color: #ffffff;
            background-color: #673827;
            padding-left: 40px;
            .icon {
              display: inline-block;
              width: 16px;
              height: 16px;
              background: url('@/assets/image/prompt.png') no-repeat;
              background-size: 100% 100%;
              margin-right: 5px;
            }
          }
          .infoList {
            height: 227px;
            padding: 10px;
            background-color: #4a1d38;
            color: #ffffff;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
        }
      }

      .warningIcon {
        position: absolute;
        right: 30px;
        top: 20px;
        width: 30px;
        height: 30px;
        background: url('@/assets/image/message-call.png') no-repeat;
        background-size: 100% 100%;
        cursor: pointer;
        .num {
          position: relative;
          height: 14px;
          border-radius: 8px;
          background: #e20808;
          color: #fff;
          left: 15px;
          text-align: center;
          line-height: 8px;
          padding: 3px 0;
        }
      }
      .coalBunker1 {
        position: absolute;
        left: 544px;
        bottom: 240px;
        display: flex;
        width: 74px;
        height: 115px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img {
          width: 100%;
          height: 100px;
          margin-bottom: 6px;
        }
      }
      .coalBunker2 {
        position: absolute;
        left: 1400px;
        top: 160px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        ul {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px !important;
          li {
            width: 65px;
            height: 120px;
            background: url('@/assets/image/coalBunker2.png') no-repeat;
            background-size: 100% 100%;
            margin-left: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #1a3757;
          }
        }
      }
      .legend {
        height: 180px;
        min-width: 200px;
        border: 1px solid #3d3f6a;
        color: #adbbda;
        font-size: 18px;
        display: inline-block;
        position: relative;
        padding:10px;
        margin: 20px !important;
        ul{
          margin-right: 15px !important;
          li{
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            &.list{
              display: flex;
              span{
                flex: 1;
                display: flex;
                &.icon{
                  display: inline-block;
                  flex: 0 0 19px;
                  height: 19px;
                  border-radius: 9px;
                  background: #9FAFC9;
                  margin-right: 10px;
                  &.active{
                    background: #63C242;
                  }
                }
              }
            }
          }
        }
      }
    }
    .tableContent {
      width: 100%;
      padding: 10px 10px 10px 80px;
      height: 200px;
      display: flex;
      background: #141641;
      .item{
        flex: 0 0 800px;
        display: flex;
        flex-direction: column;
        .name{
          display: flex;
          height: 30px;
          color: #E3F2FD;
          li{
            width: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 10px;
            font-size: 14px;
            &.title{
              width: 90px;
            }
            &.block{
              display: flex;
              justify-content: center;
              align-items: center;
              .blockItem{
                width: 24px;
                height: 16px;
                background: #00DA80;
                &.err{
                  background: #FE0000;
                }
              }
            }
          }
        }
        &.atresiaState{
          flex: 1;
        }
      }
    }
  }
}
.videoContentModal{
  width: 100%;
  min-height: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  .title{
    width: 100%;
    height: 42px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: left;
    padding-left: 20px;

  }
  .videoMain{
    height: 720px;
    width: 100%;
    background: #222222;
  }
  .videoInfo{
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    li{
      height: 40px;
      line-height: 40px;
      margin-right: 20px;
      font-size: 16px;
      color: #FFFFFF;
      padding: 0 10px;
      background: #0E2E68;
      &.name{
        background: #27A9E6;
      }
      &.warning{
        background: #D8271C;
        display: flex;
        align-items: center;
        .warningIcon{
          display: inline-block;
          width: 20px;
          height: 20px;
          background: url("@/assets/image/warningIcon.png") no-repeat;
          background-size: 100% 100%;
          margin-right: 3px;
        }
      }
    }
  }
}
.msgTable{
  max-height:800px;
  padding-bottom: 20px;
  overflow-y: auto;
  .unread{
    color: #FF0000;
    margin-left: 10px;
  }
  .read{
    color: #58A7E0;
  }
  :deep(.ant-table-wrapper) {
    .ant-table-thead > tr > th {
      border-bottom: 1px solid #1f3d73;
      border-inline-end: 1px solid #1f3d73;
      font-weight: 600;
      font-size: 16px;
      color: #ffffff;
    }
    .ant-table-tbody{
      height: 100px;
      overflow:hidden;
    }
    .default-row {
      td {
        background: #0b1442 !important;
        border-top: transparent;
        font-size: 16px;
      }
    }
    .double-row {
      td {
        background: #080a35 !important;
      }
    }
    td {
      color: #fff;
      border: none;
      border-inline-end: 1px solid #1f3d73;
      background: none !important;
    }
  }
}
</style>
