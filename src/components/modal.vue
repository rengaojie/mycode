<template>
  <a-modal
    v-model:open="openModal"
    class="modal"
    :closable="false"
    :footer="null"
    :maskClosable="false"
    :title="title"
    :style="{ width: width }"
  >
    <div class="closeBtn" @click="handleClose"></div>
    <div class="modalContent">
      <div class="formContent">
        <slot></slot>
      </div>
      <div class="footer" v-if="footer">
        <Button v-if="needCancel" :ghost="true" text="取消" @click="handleClose" />
        <Button text="确定" @click="handleOk" v-model="loading" />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import Button from './button.vue'
import { ref, defineModel } from 'vue'

// 取消和确定的事件
let emit = defineEmits(['handleOk', 'handleClose'])

// 打开关闭弹窗的状态
let openModal = defineModel('openModal')
// 点击确定按钮的loading状态
let loading = defineModel('loading')

const props = defineProps({
  // 是否显示底部按钮
  footer: {
    type: Boolean,
    default: true
  },
  centered: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '500px'
  },
  needCancel: {
    type: Boolean,
    default: true
  }
})

let footer = ref(props.footer)
let width = ref(props.width)
let needCancel = ref(props.needCancel)

const getContent = () => {
  console.log(111)
  return document.getElementById('app')
}

const handleOk = () => {
  emit('handleOk')
}
const handleClose = () => {
  emit('handleClose')
}
</script>
<style scoped lang="less">
.modal {
  position: relative;
  .closeBtn {
    position: absolute;
    right: 15px;
    top: 15px;
    width: 12px;
    height: 12px;
    background: url('@/assets/image/closeBtn.png') no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    z-index: 100;
  }
  .modalContent {
    background: #0d1d56;
    color: #fff;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    .formContent {
      flex: 1;
    }
    .footer {
      flex: 0 0 55px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-top: 1px solid #192c7e;
    }
  }
}
</style>
