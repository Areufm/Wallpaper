<template>
	<view class="preview" v-if="currentInfo">
		<swiper circular :current="currentIndex" @change="swiperChange">
			<swiper-item v-for="(item, index) in classList" :key="item._id">
				<image v-if="readImgs.includes(index)" @click="maskChange" :src="item.picurl" mode=""></image>
			</swiper-item>
		</swiper>

		<view class="mask" v-show="isMask">
			<view class="goBack" @click="goBack" :style="{ top: getStatusBarHeight() + 'px' }">
				<uni-icons type="back" size="18" color="#fff"></uni-icons>
			</view>
			<view class="count">{{ currentIndex + 1 }} / {{ classList.length }}</view>
			<view class="time">
				<uni-dateformat :date="new Date()" format="hh:mm"></uni-dateformat>
			</view>
			<view class="date">
				<uni-dateformat :date="new Date()" format="MM月dd日"></uni-dateformat>
			</view>
			<view class="footer">
				<view class="box" @click="clickInfo">
					<uni-icons type="info" size="25"></uni-icons>
					<view class="text">信息</view>
				</view>
				<view class="box" @click="clickScore">
					<uni-icons type="star" size="25"></uni-icons>
					<view class="text">{{ currentInfo?.score }}分</view>
				</view>
				<view class="box" @click="clickDownload">
					<uni-icons type="download" size="25"></uni-icons>
					<view class="text">下载</view>
				</view>
			</view>
		</view>

		<uni-popup ref="infoPopup" type="bottom" :safe-area="false">
			<view class="infoPopup">
				<view class="popHeader">
					<view></view>
					<view class="title">壁纸信息</view>
					<view class="close" @click="clickInfoClose">
						<uni-icons type="closeempty" size="18" color="#999"></uni-icons>
					</view>
				</view>

				<scroll-view scroll-y="true">
					<view class="content">
						<view class="row">
							<view class="lable">壁纸ID：</view>
							<text selectable class="value">{{ currentInfo?._id }}</text>
						</view>
						<!-- <view class="row">
							<view class="lable">分类：</view>
							<text selectable class="value">明星美女</text>
						</view> -->
						<view class="row">
							<view class="lable">发布者：</view>
							<text selectable class="value">{{ currentInfo?.nickname }}</text>
						</view>
						<view class="row">
							<view class="lable">评分：</view>
							<view selectable class="value roteBox">
								<uni-rate readonly touchable="false" :value="currentInfo?.score" />
								<text class="score">{{ currentInfo?.score }}分</text>
							</view>
						</view>
						<view class="row">
							<view class="lable">摘要：</view>
							<text selectable class="value">{{ currentInfo?.description }}</text>
						</view>
						<view class="row">
							<view class="lable">标签：</view>
							<view selectable class="value tabs">
								<view class="tab" v-for="tab in currentInfo?.tabs" :key="tab">
									{{ tab }}
								</view>
							</view>
						</view>
						<view class="safe-area-inset-bottom"></view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>

		<uni-popup ref="scorePopup" :is-mask-click="false">
			<view class="scorePopup">
				<view class="popHeader">
					<view></view>
					<view class="title">{{ isScore ? '评分过了~' : '壁纸评分' }}</view>
					<view class="close" @click="clickScoreClose">
						<uni-icons type="closeempty" size="18" color="#999"></uni-icons>
					</view>
				</view>

				<view class="content">
					<uni-rate v-model="userScore" allowHalf :readonly="isScore"></uni-rate>
					<text class="text">{{ userScore }}分</text>
				</view>

				<view class="footer">
					<button @click="submitScore" :disabled="!userScore || isScore" type="default" size="mini" plain>确认评分</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { getStatusBarHeight } from '@/utils/system.js';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { apiGetSetupScore, apiWriteDownload, apiGetDetailWall } from '@/api/apis.js';

const isMask = ref(true); // 是否遮罩
const infoPopup = ref(null); // 信息弹窗
const scorePopup = ref(null); // 评分弹窗
const userScore = ref(0); // 用户评分
const classList = ref([]); // 照片列表
const currentId = ref(null); // 当前壁纸id
const currentIndex = ref(0); // 当前壁纸索引
const currentInfo = ref(null); // 当前壁纸信息
const readImgs = ref([]); // 已经预览过的照片
const isScore = ref(false); // 是否已经评分

const storgClassList = uni.getStorageSync('storgClassList') || []; // 读取缓存

classList.value = storgClassList.map((item) => {
	return {
		...item,
		picurl: item.smallPicurl.replace('_small.webp', '.jpg')
	};
});

onLoad(async (e) => {
	currentId.value = e.id;
	if(e.type == 'share'){
		let res = await apiGetDetailWall({id:currentId.value});
		classList.value = res.data.map(item => {
			return {
				...item,
				picurl: item.smallPicurl.replace('_small.webp', '.jpg')
			};
		})
	}
	currentIndex.value = classList.value.findIndex((item) => item._id == currentId.value);
	currentInfo.value = classList.value[currentIndex.value];
	readImgsFun();
});

const swiperChange = (e) => {
	currentIndex.value = e.detail.current;
	currentInfo.value = classList.value[currentIndex.value];
	readImgsFun();
};

// 遮罩状态
const maskChange = () => {
	isMask.value = !isMask.value;
};

// 点击信息弹窗
const clickInfo = () => {
	infoPopup.value.open();
};
// 点击关闭信息弹窗
const clickInfoClose = () => {
	infoPopup.value.close();
};

// 点击评分弹窗
const clickScore = () => {
	if (currentInfo.value.userScore) {
		isScore.value = true;
		userScore.value = currentInfo.value.userScore;
	}
	scorePopup.value.open();
};

// 点击关闭评分弹窗
const clickScoreClose = () => {
	scorePopup.value.close();
	userScore.value = 0;
	isScore.value = false;
};

// 提交评分
const submitScore = async () => {
	uni.showLoading({
		title: '加载中...'
	});
	let { classid, _id: wallId } = currentInfo.value;
	let res = await apiGetSetupScore({
		classid,
		wallId,
		userScore: userScore.value
	});
	uni.hideLoading();
	if (res.errCode == 0) {
		uni.showToast({
			title: '评分成功',
			icon: 'none'
		});
		classList.value[currentIndex.value].userScore = userScore.value;
		uni.setStorageSync('storgClassList', classList.value);
		clickScoreClose();
	}
};

// 返回上一页
const goBack = () => {
	uni.navigateBack({
		success: () => {
			
		},
		fail: () => {
			uni.reLaunch({
				url:'/pages/index/index'
			})
		}
	});
};

const clickDownload = async () => {
	// #ifdef H5
	uni.showModal({
		content: '请长按保存图片',
		showCancel: false
	});
	// #endif

	// #ifndef H5

	try {
		uni.showLoading({
			title: '下载中',
			mask: true
		});

		let { classid, _id: wallId } = currentInfo.value;
		let res = await apiWriteDownload({
			classid,
			wallId
		});
		if (res.errCode != 0) {
			throw res;
		}

		uni.getImageInfo({
			src: currentInfo.value.picurl,
			success: (res) => {
				uni.saveImageToPhotosAlbum({
					filePath: res.path,
					success: (res) => {},
					fail: (err) => {
						if (err.errMsg == 'saveImageToPhotosAlbum:fail cancel') {
							uni.showToast({
								title: '保存失败，请重新保存',
								icon: 'none'
							});
							return;
						}

						uni.showModal({
							title: '提示',
							content: '需要授权使用相册',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting({
										success: (setting) => {
											console.log(setting);
											if (setting.authSetting['scope.writePhotosAlbum']) {
												uni.showToast({
													title: '获取授权成功',
													icon: 'none'
												});
											} else {
												uni.showToast({
													title: '获取授权失败',
													icon: 'none'
												});
											}
										}
									});
								}
							}
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			}
		});
	} catch (err) {
		console.log(err);
		uni.hideLoading();
	}

	// #endif
};

const readImgsFun = () => {
	readImgs.value.push(
		currentIndex.value <= 0 ? classList.value.length - 1 : currentIndex.value - 1,
		currentIndex.value,
		currentIndex.value >= classList.value.length - 1 ? 0 : currentIndex.value + 1
	);
	readImgs.value = [...new Set(readImgs.value)];
};

// 分享给好友
onShareAppMessage(() => {
	return {
		title:'小红帽壁纸' ,
		path:'/pages/preview/preview?id=' + currentId.value + '&type=share'
	}
})
</script>

<style lang="scss" scoped>
.preview {
	width: 100%;
	height: 100vh;
	position: relative;
	swiper {
		width: 100%;
		height: 100%;
		image {
			width: 100%;
			height: 100%;
		}
	}
	.mask {
		& > view {
			position: absolute;
			left: 0;
			right: 0;
			margin: auto;
			width: fit-content;
			color: #fff;
		}
		.goBack {
			width: 38px;
			height: 38px;
			background: rgba(0, 0, 0, 0.5);
			left: 30rpx;
			margin-left: 0;
			border-radius: 100px;
			backdrop-filter: blur(10rpx);
			border: 1px solid rgba(255, 255, 255, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.count {
			top: 10vh;
			background: rgba(0, 0, 0, 0.3);
			font-size: 28rpx;
			color: #fff;
			border-radius: 40rpx;
			padding: 8rpx 20rpx;
			backdrop-filter: blur(10rpx);
		}
		.time {
			font-size: 140rpx;
			top: calc(10vh + 80rpx);
			font-weight: 100;
			line-height: 1em;
			text-shadow: 0 4rpx rgba(0, 0, 0, 0.3);
		}
		.date {
			font-size: 34rpx;
			top: calc(10vh + 230rpx);
			text-shadow: 0 2rpx rgba(0, 0, 0, 0.3);
		}
		.footer {
			background: rgba(255, 255, 255, 0.8);
			bottom: 10vh;
			width: 65vw;
			height: 120rpx;
			color: #000;
			border-radius: 120rpx;
			display: flex;
			justify-content: space-around;
			align-items: center;
			box-shadow: 0 2rpx 0 rgba(0, 0, 0, 0.1);
			backdrop-filter: blur(20rpx);
			.box {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				padding: 2rpx 12rpx;
				.text {
					font-size: 26rpx;
					color: $text-font-color-2;
				}
			}
		}
	}

	.popHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.title {
			color: $text-font-color-2;
			font-size: 26rpx;
		}
		.close {
			padding: 6rpx;
		}
	}

	.infoPopup {
		background: #fff;
		padding: 30rpx;
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;

		scroll-view {
			max-height: 60vh;
			.content {
				.row {
					display: flex;
					padding: 16rpx 0;
					font-size: 32rpx;
					line-height: 1.7em;
					.lable {
						color: $text-font-color-3;
						width: 140rpx;
						text-align: right;
						font-size: 30rpx;
					}
					.value {
						flex: 1;
						width: 0;
					}
					.roteBox {
						display: flex;
						align-items: center;
						.score {
							font-size: 26rpx;
							color: $text-font-color-2;
							padding: 10rpx;
						}
					}
					.tabs {
						display: flex;
						flex-wrap: wrap;
						.tab {
							border: 1px solid $brand-theme-color;
							color: $brand-theme-color;
							font-size: 22rpx;
							padding: 10rpx 30rpx;
							border-radius: 40rpx;
							line-height: 1em;
							margin: 0 10rpx 10rpx 0;
						}
					}
				}
			}
		}
	}

	.scorePopup {
		background: #fff;
		padding: 30rpx;
		width: 70vw;
		border-radius: 30rpx;
		.content {
			padding: 30rpx 0;
			display: flex;
			justify-content: center;
			align-items: center;
			.text {
				color: #ffca3e;
				padding-left: 10rpx;
				width: 80rpx;
				line-height: 1em;
				text-align: right;
			}
		}
		.footer {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10rpx 0;
		}
	}
}
</style>
