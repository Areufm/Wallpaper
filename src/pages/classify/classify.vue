<template>
	<view class="classLayout pageBg">
		<custom-nav-bar title="分类"></custom-nav-bar>
		<view class="classify">
			<theme-item v-for="item in classifyList" :key="item._id" :item='item'></theme-item>
		</view>
		
	</view>
</template>

<script setup>
import { ref } from 'vue';
import {apiGetClassify} from '@/api/apis.js'	
import {onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'

// 获取分类壁纸的主题
const classifyList = ref([])

const getClassify = async () => {
	let res = await apiGetClassify({
		pageSize:20
	})
	classifyList.value = res.data
}



// 分享给好友
onShareAppMessage(() => {
	return {
		title:'小红帽壁纸',
		path:'/pages/index/index'
	}
})

// 分享到朋友圈
onShareTimeline(() => {
	return {
		title:'小红帽壁纸',
	}
})

getClassify()
</script>

<style lang="scss" scoped>
.classify{
	padding: 30rpx;
	display: grid;
	grid-template-columns:repeat(3,1fr);
	gap: 15rpx;
	
}
</style>
