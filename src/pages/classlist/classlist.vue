<template>
	<view class="classlistLayout">
		<view class="loadingLayout" v-if="!classList.length && !noData">
			<uni-load-more status="loading"></uni-load-more>
		</view>
		
		<view class="content">
			<navigator :url="'/pages/preview/preview?id=' + item._id" class="item" v-for="item in classList" :key="item._id">
				<image :src="item.smallPicurl" mode="aspectFill"></image>				
			</navigator>
		</view>
		
		<view class="loadingLayout" v-if="classList.length || noData">
			<uni-load-more :status="noData?'noMore':'loading'"></uni-load-more>
		</view>
		
		<view class="safe-area-inset-bottom"></view>
	</view>
</template>

<script setup>
import {ref} from 'vue';
import {apiGetClassList, apiGetHistoryList} from '@/api/apis.js'
import {onLoad, onUnload, onReachBottom, onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'


const classList = ref([])
const queryParams = {
	pageNum:1,
	pageSize:12
}
const noData = ref(false)
let pageName


// 获取每个页面的壁纸
const getClassList = async () => {
	let res;
	if(queryParams.classid) res = await apiGetClassList(queryParams)
	if(queryParams.type) res = await apiGetHistoryList(queryParams)
	
	if (res.data.length < queryParams.pageSize) noData.value = true
	classList.value = [...classList.value, ...res.data]
	uni.setStorageSync('storgClassList', classList.value)
}


onLoad((e) => {
	let {id=null, name=null, type=null} = e;
	if(type) queryParams.type = type
	if(id) queryParams.classid = id;
	pageName = name
	uni.setNavigationBarTitle({
		title:pageName
	})
	
	getClassList()
})

onReachBottom(() => {
	if (noData.value) return;
	queryParams.pageNum ++
	getClassList()
})

// 分享给好友
onShareAppMessage(() => {
	return {
		title:'小红帽壁纸-' + pageName,
		path:'/pages/classlist/classlist?id=' + queryParams.classid + '&name=' + pageName
	}
})

// 分享到朋友圈
onShareTimeline(() => {
	return {
		title:'小红帽壁纸',
	}
})

onUnload(() => {
	uni.removeStorageSync('storgClassList')
})

</script>

<style lang="scss" scoped>
.classlistLayout{
	.content{
		display: grid;
		grid-template-columns: repeat(3,1fr);
		gap: 5rpx;
		padding: 5rpx;
		.item{
			height: 440rpx;
			image{
				width: 100%;
				height: 100%;
				display: block;
			}
		}
	}
}

</style>
