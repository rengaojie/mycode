<template>
  <div class="monitoringView">
    <topHeader />
    <div class="content">
      <ul class="cameraList">
        <li class="cameraItem" v-for="item in monitoringList" :key="item.deviceId">
          <div class="cameraWrap" :id="'screenFullEl'+item.deviceId">
            <div class="cameraInfo">
              <div><span class="icon"></span> {{item.deviceName}}</div>
              <div><span class="full" @click="fullScreen(item)"></span></div>
            </div>
            <div class="cameraVideoContent"></div>
          </div>
          <div class="cameraErrInfo">
            <div class="name">摄像头位置：{{item.devicePositionDesc}}</div>
            <div class="err" @click="getErrList(item)">告警:{{item.unreadWarningCount || 0}}</div>
          </div>
        </li>
      </ul>
      <div class="tool">
        <div class="page">
          <pagination :total="cameraNum" :page-size="pageSize" :current-page="currentPage" @onShowSizeChange="pageChange"/>
        </div>
      </div>
    </div>
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
          :data-source="currentErrList"
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
                @click="playBack(record)"
              >
                <span class="playIcon"></span>
                <!--<span :class="record.readMark === 0?'unread':'read'" @click="setRead(record)">{{record.readMark === 0 ?'已读':'未读'}}</span>-->
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </modal>
    <modal
      v-model:openModal="openVideoModal"
      width="1400px"
      @handle-close="closeVideoModal"
      @handle-ok="closeVideoModal"
    >
      <div class="videoContentModal">
        <div class="title">{{currentCamera.deviceName}}</div>
        <video class="videoMain" id="videoMain"></video>
      </div>
    </modal>
  </div>

</template>

<script setup>
import topHeader from '@/components/Header.vue'
import pagination from '@/components/pagination.vue'
import modal from '@/components/modal.vue'
import {ref, onMounted,nextTick} from 'vue';
import flvjs from "flv.js"
import screenFull from 'screenfull'
import {getDeviceList,getDeviceWarningList} from '@/api/index.js'
import {customHeaderRow, rowClassName} from "@/views/utils.js";

let cameraNum = ref(100)
let pageSize = ref(6)
let currentPage = ref(1)

let openMsgModal = ref(false)
let openVideoModal = ref(false)
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

onMounted(()=>{
  getDeviceListData()
})

// 获取监控列表
let monitoringList = ref([])
const getDeviceListData = ()=>{
  getDeviceList({
    isPage:true,
    pageSize:6,
    pageIndex:currentPage.value
  }).then(res=>{
    cameraNum.value = res.data.count
    monitoringList.value = res.data.data.deviceList || []
  })
}

// 获取历史告警
let currentErrList = ref([])
let currentCamera = ref({})
const getErrList = (item) => {
  if(!item.unreadWarningCount){
    return
  }
  currentCamera.value = item
  getDeviceWarningList({
    deviceId:item.deviceId,
    isPage:false,
  }).then(res=>{
    let data = res.data.data.deviceWarningList || []
    data.forEach((item,index)=>{
      item.key = index + 1
    })
    currentErrList.value = data
    openMsgModal.value = true
  })
}

// 回看
let player = ref()
const playBack = (item)=>{
  openVideoModal.value = true
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

const closeVideoModal = () => {
  openVideoModal.value = false
  if(player.value){
    player.value.destroy()
    player.value = null
  }
}

// 全屏
const fullScreen = (item) => {
  const el = document.getElementById('screenFullEl'+item.deviceId)
  screenFull.toggle(el);
}
// 分页
const pageChange = (val) => {
  currentPage.value = val
  getDeviceListData()
}

</script>

<style scoped lang='less'>
.playIcon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: url('@/assets/image/playback.png') no-repeat;
  background-size: 100% 100%;
}
.monitoringView{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  color: #adbbda;
  .content{
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .cameraList{
      flex: 1;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      overflow-y: auto;
      .cameraItem{
        flex: 0 0 33.3%;
        height: 450px;
        margin-bottom: 10px;
        padding: 0 5px;
        background: #070A37;
        display: flex;
        flex-direction: column;
        .cameraWrap{
          display: flex;
          flex: 1;
          position: relative;
          .cameraInfo{
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 40px;
            padding:0 15px;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 16px;
            color: #FFFFFF;
            div{
              display: flex;
              align-items: center;
            }
            .icon{
              display: inline-block;
              width: 23px;
              height: 23px;
              background: url("@/assets/image/aijiankong.png") no-repeat;
              background-size: 100% 100%;
              margin-right: 10px;
            }
            .full{
              display: inline-block;
              width: 23px;
              height: 23px;
              background: url("@/assets/image/full.png") no-repeat;
              background-size: 100% 100%;
              cursor: pointer;
            }
          }
          .cameraVideoContent{
            flex: 1;
            background: #222222;
          }
        }
        .cameraErrInfo{
          flex: 0 0 53px;
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #FFFFFF;
          justify-content: space-between;
          .name{
            flex: 1;
            color: #A6A9B2;
          }
          .err{
            width: 60px;
            height: 24px;
            display: flex;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            background: #FC4141;
            border-radius: 12px 0px 0px 12px;
          }
        }
      }
    }
    .tool{
      flex: 0 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .layout{
        flex: 0 0 200px;
      }
      .page{
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: end;
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