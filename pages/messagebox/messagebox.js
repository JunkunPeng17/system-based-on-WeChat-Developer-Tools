// pages/messagebox/messagebox.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: {},
    messageNum: 0
  },

  onShow: function (options) {
    this.readMessagesFromDatabase();
  },
  //从云台读取用户数据
  readMessagesFromDatabase() {
    wx.cloud.callFunction({
      name: "getUserMessages",
      data: {
        openid: app.globalData.openid
      },
      success: res => {
        console.log("get messages successfully", res.result.data)
        if (res.result.data.length > 0) {
          var datasets = res.result.data;
          this.setData({
            messages: datasets,
            messageNum: datasets.length
          })
        // console.log(this.data);
        } else {
          console.log("no messages")
        }
      },
      fail: res => {
        console.log("get messages from database failed", res)
      }
    })
  }
})