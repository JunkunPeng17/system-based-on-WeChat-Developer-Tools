// pages/reply/reply.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		comment:{},
		reply:[],
		reply_one:[],
		OPEN_ID:"",
		ID:"",
		avatar:"",
		nickname:"",
		length:0,
		index:0,
		replyVal:"",
		showInput:false,
		qa_one:{},
		reply_reply:false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var comment = JSON.parse(options.comment)
		this.setData({
			comment:comment,
			OPEN_ID:options.openid,
			ID:options.id,
			avatar:options.avatar,
			nickname:options.nickname,
			index:options.index
		})
		console.log(this.data.index)
		var data = wx.cloud.database().collection("TeamInfo").doc(this.data.ID)
		data.get().then(res=>{
			var reply=res.data.reply
			console.log("reply_one1", this.data.reply_one)
			this.setData({
				reply: reply,
			})
			this.setData({
				reply_one: reply[this.data.index]
			})
			console.log("reply",this.data.reply)
			console.log("reply_one2", this.data.reply_one)
			this.setData({
				length: this.data.reply_one.length
			})
		})
		console.log("reply_one3",this.data.reply_one)
	},
	delMsg() {
		var data = wx.cloud.database().collection("TeamInfo").doc(this.data.ID)
		console.log("data",data)
		data.get().then(res=>{
			var comment=res.data.comment
			var reply=res.data.reply
			wx.showModal({
				title: 'Reminder',
				content: 'Return confirm',
				success: (res) => {
					if (res.confirm) {
						console.log('用户点击确定')
						comment.splice(this.data.index,1)
						reply.splice(this.data.index,1)
						wx.cloud.callFunction({
							// 需调用的云函数名
							name: 'updateComment',
							// 传给云函数的参数
							data: {
								comment: comment,
								ID: this.data.ID,
							},
							success: res => {
								console.log("成功", res)
							},
							fail: err => {
								console.log("失败", err)
							},
							// 成功回调
							complete: console.log
						})
						wx.cloud.callFunction({
							// 需调用的云函数名
							name: 'updateReply',
							// 传给云函数的参数
							data: {
								reply: reply,
								ID: this.data.ID,
							},
							success: res => {
								console.log("成功", res)
							},
							fail: err => {
								console.log("失败", err)
							},
							// 成功回调
							complete: console.log
						})
						wx.showToast({
							title: '成功',
							icon: 'success',
							duration: 1000
						}) 
						setTimeout((function callback() {
							wx.navigateBack({
								delta:1
							})
						}).bind(this), 1000);
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		})
	
	},
	delReply:function(ev){
		var data = wx.cloud.database().collection("TeamInfo").doc(this.data.ID)
		console.log("data", data)
		data.get().then(res => {
			var reply_one = res.data.reply[this.data.index]
			var reply=res.data.reply
			wx.showModal({
				title: 'Reminder',
				content: 'Return confirm',
				success: (res) => {
					if (res.confirm) {
						console.log('用户点击确定')
						reply_one.splice(ev.currentTarget.dataset.index, 1)
						reply.splice(this.data.index,1,reply_one)
						wx.cloud.callFunction({
							// 需调用的云函数名
							name: 'updateReply',
							// 传给云函数的参数
							data: {
								reply: reply,
								ID: this.data.ID,
							},
							success: res => {
								console.log("成功", res)
							},
							fail: err => {
								console.log("失败", err)
							},
							// 成功回调
							complete: console.log
						})
						wx.showToast({
							title: '成功',
							icon: 'success',
							duration: 1000
						})
						setTimeout((function callback() {
							this.setData({
								reply:reply,
								reply_one:reply_one,
								
							})
							this.setData({
								length: this.data.reply_one.length
							})
						}).bind(this), 1000);
					} else if (res.cancel) {
						console.log('用户点击取消')
					}
				}
			})
		})

	},
	openActionSheetComment(ev) {
		console.log(this.data.reply_one[ev.currentTarget.dataset.index].id)
		if(this.data.OPEN_ID==this.data.reply_one[ev.currentTarget.dataset.index].id){
			wx.showActionSheet({
				itemList: ['Delete', 'Reply'],
				success: res => {

					var tapIndex = res.tapIndex
					if (tapIndex == 0) {
						this.delReply(ev)
					}
					if (tapIndex == 1) {
				
						this.reply()
						this.setData({
							reply_reply: true
						})
						
					}
				},
				fail: res => {
					console.log("error", res.errMsg)
				}
			});
		}
		else {
			wx.showActionSheet({
				itemList: ['Reply'],
				success: res => {
					var tapIndex = res.tapIndex

					if (tapIndex == 0) {
						
						this.reply()
						this.setData({
							reply_reply: true
						})
					}
				},
				fail: res => {
					console.log("error", res.errMsg)
				}
			});

		}
	},
	reply:function(){
		this.setData({
			reply_reply:false,
			showInput: true
		})
	},
	changereplyVal:function(ev){
		this.setData({
			replyVal: ev.detail.value
		});
	},
	onHideInput: function () {
		if(this.data.replyVal==""){
			this.setData({
				showInput: false
			})
		}
	},

	changeReply:function(){
		var that = this
		var replyVal = that.data.replyVal
		// var comment=that.data.inputval
		// content.comment={}

		//之后的数据再加
		var one = { reply: replyVal, id: this.data.OPEN_ID,reply_reply:this.data.reply_reply,avatar:this.data.avatar,nickname:this.data.nickname}
		// one.OPEN_ID=content
		this.setData({
			qa_one: one,
		})
		console.log("qa_one", that.data.qa_one)
		console.log("reply_one", that.data.reply_one)
	},
	addReply() {
		if (this.data.replyVal == "") {
			return
		}
		this.changeReply()
		var reply_one = this.data.reply_one
		console.log("reply_one", this.data.reply_one)
		reply_one.push(this.data.qa_one)
		var reply=this.data.reply
		reply.splice(this.data.index,1,reply_one)
		this.setData({
			reply_one: reply_one,
			reply:reply
		})
		wx.cloud.callFunction({
			// 需调用的云函数名
			name: 'updateReply',
			// 传给云函数的参数
			data: {
				reply: reply,
				ID: this.data.ID,
			},
			success: res => {
				console.log("成功", res)
			},
			fail: err => {
				console.log("失败", err)
			},
			// 成功回调
			complete: console.log
		})
		this.setData({
			showInput:false,
			length: this.data.reply_one.length
		})
		setTimeout((function callback() {
			console.log("here")
			console.log("reply_one", this.data.reply_one)
			console.log("reply", this.data.reply)
			this.initialize()

		}).bind(this), 1000);
	},
	initialize:function(){
		this.setData({
			replyVal: "",
			qa_one: {}
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})