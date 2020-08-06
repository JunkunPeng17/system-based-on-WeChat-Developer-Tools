// pages/usercenter/usercenter.js
var app = getApp()
const db = wx.cloud.database().collection("userInformation");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickname: "--",
    gender: "--",
    major: "--",
    grade: "--",
    address: "--",
    wxUserInfo: {},
    hasUserInfo: false,
    registered: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    messages: [],
    toReadMsgApp: 0,
    toReadMsgNot: 0
  },
  //获取用户
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.wxUserInfo = e.detail.userInfo
    app.globalData.hasLogin = true
    this.setData({
      wxUserInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //当页面加载时
  onShow: function(options) {
    wx.showLoading({
      title: 'loading',
    })
    wx.hideTabBarRedDot({
      index: 2,
    })
    console.log(this.data.wxUserInfo);
    //从云后台获取用户数据
    if (app.globalData.hasLogin)
      this.readInfoFromDatabase()
    // if (!this.data.registered){
    //   console.log('create');
    //   this.createNewUser()
    // }
    //如果已经获取用户信息
    if (app.globalData.wxUserInfo) {
      console.log("getting userinform 01")
      this.setData({
        wxUserInfo: app.globalData.wxUserInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log("getting userinform 02")
        this.setData({
          wxUserInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      console.log("getting userinform 03")
      wx.getUserInfo({
        success: res => {
          app.globalData.wxUserInfo = res.userInfo
          this.setData({
            wxUserInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })

    }
    this.data.messages = [];
    this.data.toReadMsgApp = 0;
    this.data.toReadMsgNot = 0;
    this.updateMessageNum("applications");
    this.updateMessageNum("expelling");
    this.updateMessageNum("Notifications");
    // console.log(this.data.wxUserInfo);
    wx.hideLoading()
  },
  onPullDownRefresh: function () {
    this.onShow();
    wx.stopPullDownRefresh()
  },
  updateMessageNum(database) {
    wx.cloud.callFunction({
      name: "getUserMessages",
      data: {
        openid: app.globalData.openid,
        databaseName: database
      },
      success: res => {
        if (res.result.data.length > 0) {
          var datasets = res.result.data;
          // this.data.messages = this.data.messages.concat(datasets)
          var _toReadMsg = 0;
          for (var index = 0; index < datasets.length; index++) {
            if (datasets[index].toRead) {
              _toReadMsg++
            }
          }
          console.log('_toReadMsg,', _toReadMsg, database)
          if (database == "applications" || database == "expelling") {
            this.setData({
              toReadMsgApp: this.data.toReadMsgApp + _toReadMsg
            })
          }
          else{
            this.setData({
              toReadMsgNot: this.data.toReadMsgNot + _toReadMsg
            })
          }
        } else {
          console.log("no messages")
        }
      },
      fail: res => {
        console.log("get messages from database failed", res)
      }
    })
  },
  //从云台读取用户数据
  readInfoFromDatabase() {
    wx.cloud.callFunction({
      name: "getUserInformation",
      data: {
        openid: app.globalData.openid
      },
      success: res => {
        console.log("get userinformation successfully", res.result.data)
        if (res.result.data.length > 0) {
          var data = res.result.data[res.result.data.length - 1]
          this.setData({
            registered: true,
            nickname: data.nickname,
            gender: data.gender,
            major: data.major,
            grade: data.grade,
            address: data.address
          })
        } else {
          console.log("user did not exist")
          this.createNewUser()
        }
      },
      fail: res => {
        console.log("read from database failed", res)
      }
    })
  },
  createNewUser() {
    db.add({
      data: {
        nickname: this.data.nickname,
        gender: this.data.gender,
        major: this.data.major,
        grade: this.data.grade,
        address: this.data.address,
        avatar: this.data.wxUserInfo.avatarUrl
      },
      success(res) {
        console.log("create a new user", res)
      },
      fail(res) {
        console.log("fail to create a new user", res)
      }
    })

  }
})