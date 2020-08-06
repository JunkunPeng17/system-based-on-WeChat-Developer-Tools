//记住，这个是在team page里的部件，因此我们要知道这在database的TeamInfo里的第几个页面，也就是index 
var app=getApp();
const APP_ID = 'wx3a0df74a4ad94035';//输入小程序appid
const APP_SECRET = 'd556c2abeda5a672cf51c230765b4c6b';//输入小程序app_secret
var WXBizDataCrypt = require('../../WXBizDataCrypt.js');
var OPEN_ID="";
var ID="";
var UserInfo=[]
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		inputVal: '',
		comment: [],
		qa_one:{},
		reply:[]
	},
	onLoad: function (options) {
		OPEN_ID = app.globalData.openid
		UserInfo=app.globalData.wxUserInfo
		console.log("userinfo",UserInfo)
		console.log("options", options)
		ID = options.id;
		console.log("ID", ID)
		//这只是每个TeamInfo页面的onload里面的一部分
		// var data = wx.cloud.database().collection("TeamInfo").doc(ID);
		// console.log("data", data)
		// data.get().then(res => {
		// 	console.log("获取成功", res)
		// 	this.setData({
		// 		reply: res.data.reply,

		// 	})
		// })
		// 	.catch(res => {
		// 		console.log("获取失败", res)
		// 	})
	},
	onShow:function(){
		console.log("comment", this.data.comment)
		//这只是每个TeamInfo页面的onload里面的一部分
		var data = wx.cloud.database().collection("TeamInfo").doc(ID);
		console.log("data", data)
		data.get().then(res => {
			console.log("获取成功", res)
			this.setData({
				reply:res.data.reply,
				comment: res.data.comment,
			})
			console.log("comment", this.data.comment)
		})
			.catch(res => {
				console.log("获取失败", res)
			})
	},
	onPullDownRefresh: function () {
		this.onShow();
		wx.stopPullDownRefresh()
	},
	/**
	 * 更改输入值
	 */
	changeInputVal(ev) {
		this.setData({
			inputVal: ev.detail.value
		});
	},
	changeComment(){
		var that=this
		var inputVal=that.data.inputVal
		// var comment=that.data.inputval
		// content.comment={}
		console.log("OPEN_ID",OPEN_ID)

		//之后的数据再加
		var one={comment:inputVal,id:OPEN_ID,avatar:UserInfo.avatarUrl,nickname:UserInfo.nickName}
		// one.OPEN_ID=content
		this.setData({
			qa_one:one,
		})
		console.log("qa_one",that.data.qa_one)
	},
	/**
	 * 添加留言板到数据中
	 */
	addMsg() {
		if(this.data.inputVal==""){
			return
		}
		this.changeComment()
		var comment=this.data.comment
		console.log("comment", comment)
		comment.push(this.data.qa_one)
		this.setData({
			comment: comment
		})
		var array=new Array()
		var reply=this.data.reply
		console.log("reply1", reply)
		reply.push(array)
		console.log("reply2", reply)
		this.setData({
			reply: reply
		})
		console.log("reply3",this.data.reply)
		this.initialize()
		wx.cloud.callFunction({
			// 需调用的云函数名
			name: 'updateComment',
			// 传给云函数的参数
			data: {
				comment: comment,
				ID: ID,
			},
			success:res=>{
				console.log("成功",res)
			},
			fail:err=>{
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
				ID: ID,
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

			
	

		
		// var data = wx.cloud.database().collection("TeamInfo").doc(ID);
		// console.log("data",data)
		// data.update({
		// 	data: {
		// 		_openid: "oxwkS5YO9Z8JZhnJeOGShwRj0GB8",
		// 		comment:comment
		// 		}
		// })
		// 	.then(res => {
		// 		console.log(res)
		// 		console.log("成功添加到数据库")
		// 		this.initialize()
		// 	})
		// 	.catch(res => {
		// 		console.log("添加到数据库失败")
		// 	})
		// var list=this.data.msgData;
		// list.push(
		// 	this.data.inputVal
		// );
		// this.setData({
		// 	msgData:list,
		// 	inputVal:""
		// });
	},
	
		

	navigateToReply:function(e){
		var that = this
		var index = e.currentTarget.dataset.index
		console.log("index", index)
		var comment = that.data.comment[index]
		console.log("comment", comment)
		var data = JSON.stringify(comment);
		wx.navigateTo({
			url: '/pages/reply/reply?comment='+data+"&openid="+OPEN_ID+"&id="+ID+"&index="+index+"&avatar="+UserInfo.avatarUrl+"&nickname="+UserInfo.nickName,
		})
	},
	// getUserInfo(e) {
	// 	var that=this
	// 	var AppId = APP_ID
	// 	var AppSecret = APP_SECRET 
	// 	if (e.detail.iv == undefined) { //如何用户拒绝授权
	// 		wx.showToast({
	// 			title: '登录失败!',
	// 			icon: 'none'
	// 		})
	// 		return
	// 	}
	// 	wx.login({    //调用登录接口，获取 code
	// 		success: function (res) {
	// 			wx.request({
	// 				url: 'https://api.weixin.qq.com/sns/jscode2session',
	// 				data: {
	// 					appid: AppId,
	// 					secret: AppSecret,
	// 					js_code: res.code,
	// 					grant_type: 'authorization_code'
	// 				},
	// 				success: function (res) {
	// 					var pc = new WXBizDataCrypt(AppId, res.data.session_key)
	// 					wx.getUserInfo({
	// 						success: function (res) {
	// 							var data = pc.decryptData(res.encryptedData, res.iv)
	// 							console.log('解密数据: ', data)

	// 							OPEN_ID=data.openId
	// 							console.log("OPEN_ID",OPEN_ID)

	// 						}
	// 					})
	// 				}
	// 			});
	// 		}
	// 	})
	// },
	initialize:function(){
		this.setData({
			inputVal: "",
			qa_one: {}
		})
		console.log("initialize")
	},
	

})

