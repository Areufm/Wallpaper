<template>
	<view class="layout">
		<view class="navbar">
			<view class="statusBar" :style="{height:getStatusBarHeight()+'px'}">
				
			</view>
			
			<view class="titleBar" :style="{height:getTitleBarHeight() + 'px'}">
				<view class="title">
					{{title}}
				</view>
				<navigator url="/pages/search/search" class="search">
					<uni-icons type="search" size="18" color="#888"></uni-icons>
					<text>搜索</text>
				</navigator>
			</view>
		</view>
		
		<view class="fill" :style="{height:getNavBarHeight()+'px'}">
			
		</view>
	</view>
</template>

<script setup>
import {ref} from 'vue'
import {getStatusBarHeight, getTitleBarHeight, getNavBarHeight} from "@/utils/system.js"

defineProps({
	title:{
		type: String,
		default:"壁纸"
	}
})
</script>

<style lang="scss" scoped>
.layout{
	.navbar{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 10;
		background: linear-gradient(to bottom, rgba(0,0,0,0), #fff 400rpx),
		linear-gradient(to right, #beecd8 20%, #f4e2d8);
		.statusBar{
			
		}
		.titleBar{
			display: flex;
			padding: 0 30rpx;
			align-items: center;
			.title{
				font-size: 40rpx;
				font-weight: 700;
				color: $text-font-color-1;
			}
			.search{
				width: 220rpx;
				height: 50rpx;
				border-radius: 60rpx;
				background: rgba(255,255,255,0.4);
				border: 1px solid #fff;
				margin-left: 30rpx;
				color: #999;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				.text{
					padding-left: 10rpx;
				}
				.icon{
					margin-left: 5rpx;
				}
			}
		}
	}
	.fill{
		
	}
}
</style>