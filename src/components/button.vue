<template>
    <a-button
      class="btn"
      :loading="loading"
      :class="size"
      type="primary"
      :style="{'background': ghost ?'': color, 'color': ghost ?'#3AC7E7':'#fff'}"
      :ghost="ghost"
    >
     {{ text }}
    </a-button>
</template>

<script setup>
import {ref,defineModel} from 'vue';

let loading = defineModel()

const props =  defineProps({
		size: {
				type: String,
				default: 'default'
		},
		color: {
				type: String,
				default: '#0390D3'
		},
    text: {
        type: String,
        default: '按钮'
    },
    ghost:{
        type: Boolean,
        default: false
    }
})

const color = ref(props.color)
const size = ref(props.size)
const text = ref(props.text)
const ghost = ref(props.ghost)

</script>

<style scoped lang='less'>
.btn{
		height: 37px;
		border-radius: 2px;
	  // 文字超出
	  overflow: hidden;
	  text-overflow: ellipsis;
	  white-space: nowrap;
		// 文字居中
		display: flex;
		justify-content: center;
		align-items: center;
	  margin-left: 10px;
    color: #e2f2fc !important;
    font-size: 18px;
    &.ant-btn-background-ghost{
      border-color: #3A7ABD;
    }
		&.default{
      width: 112px;
		}
    &.small{
        width: 112px;
    }
    &.large{
        width: 110px;
    }
}

</style>