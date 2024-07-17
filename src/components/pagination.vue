<template>
  <div class="pagination">
      <a-pagination
        class="list"
        :current="current"
        :showSizeChanger="false"
        :showQuickJumper="true"
        :total="total"
        :page-size="pageSize"
        @change="onShowSizeChange"
      />
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'


const emit = defineEmits(['onShowSizeChange'])
const props = defineProps({
    showSizeChanger: {
      type: Boolean,
      default: true,
    },
    showQuickJumper: {
      type: Boolean,
      default: true,
    },
    showRecord:{
      type: Boolean,
      default: true,
    },
    total:{
      type: Number,
      default: 1
    },
    currentPage:{
      type: Number,
      default: 1
    },
   pageSize:{
     type: Number,
     default: 10
   }
  },)

let current = ref(props.currentPage)
let pageSize = props.pageSize

const onShowSizeChange = (page, pageSize)=> {
  current.value = page;
  emit('onShowSizeChange', page, pageSize);
}

watch(()=> props.currentPage,(val)=>{
  current.value = val;
})

</script>

<style lang="less" scoped>
:deep(.ant-pagination) {
  .ant-pagination-item a{
    color: #fff;
  }
  .ant-pagination-item-link{
    background-color: transparent !important;
    color: #fff !important;
  }
  .ant-pagination-options-quick-jumper{
    background-color: transparent !important;
    color: #fff !important;
  }
  .ant-pagination-item-active{
    background: #009DFF;
    border-radius: 2px;
    width: 28px;
    height: 29px;
    min-width: 28px !important;
  }
  input{
    border-radius: 2px;
    background: rgba(0,58,134,0.2);
    border: 1px solid #13519C;
    color: #fff !important;
  }
  .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis{
    color: #fff;
  }
  .ant-pagination-jump-prev {
    .ant-pagination-item-container .ant-pagination-item-ellipsis{
      color: #fff;
    }
  }
}

.pagination {
  box-sizing: content-box;
  padding: 15px 30px;
  .pn-hint {
    display: block;
    float: left;
    width: 230px;
    height: 32px;
    line-height: 32px;
    color: #fff;
  }
  .list {
    display: block;
    float: right;
  }
}
</style>
