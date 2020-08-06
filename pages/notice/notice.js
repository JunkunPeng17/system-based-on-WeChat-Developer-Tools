// pages/messagebox/messagebox.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    messageNum: 0,
    slideButtons: [
    {
      type: 'warn',
      text: 'delete',
      extClass: '',
      // src: '/page/weui/cell/icon_del.svg', // icon的路径
    }],
  },

  onShow: function (options) {
    wx.showLoading({
      title: 'loading',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 700)
    this.setData({
      messages: [],
      messageNum: 0
    })

      this.readMessagesFromDatabase("Notifications");

  },

  //从云台读取用户数据
  readMessagesFromDatabase(database) {
    wx.cloud.callFunction({
      name: "getUserMessages",
      data: {
        openid: app.globalData.openid,
        databaseName: database
      },
      success: res => {
        // console.log("get messages successfully", res.result.data)
        if (res.result.data.length > 0) {
          var datasets = res.result.data;

          this.data.messages = this.data.messages.concat(datasets),
            this.data.messageNum = datasets.length
          this.arrangeMsg()
          console.log(this.data.messages);
          // console.log(this.data);
        } else {
          console.log("no messages")
        }
      },
      fail: res => {
        console.log("get messages from database failed", res)
      }
    })
  },

  arrangeMsg() {
    var _tempMsg = this.data.messages;
    for (var i = 1; i < _tempMsg.length; i++) {
      for (var j = i; j > 0; j--) {
        var diff0 = _tempMsg[j].createTime
        var diff1 = _tempMsg[j - 1].createTime
        if (diff0 > diff1) {
          var s = _tempMsg[j];
          _tempMsg[j] = _tempMsg[j - 1];
          _tempMsg[j - 1] = s;
        }
      }
    }
    this.setData({
      messages: _tempMsg,
      messageNum: this.data.messageNum
    })
  },

  updateToRead: function (event) {
    var msgId = event.currentTarget.dataset.msgid;
    var status = event.currentTarget.dataset.status;
    var targetDatabase = event.currentTarget.dataset.databasename;
    wx.cloud.callFunction({
      name: "updToRead",
      data: {
        msgid: msgId,
        databasename: targetDatabase
      },
      success: res => {
        if(status)
          this.onShow();
        console.log("msg read", res)
      },
      fail: res => {
        console.log("fail to upd msg read", res)
      }
    })
  },

  slideButtonTap(e) {
    console.log('slide button tap', e)
    var msgId = e.currentTarget.dataset.msgid;
    wx.cloud.callFunction({
      name: "deleteNotice",
      data: {
        msgid: msgId,
        databaseName: "Notifications"
      },
      success: res => {
        this.onShow();
        console.log("msg deleted", res)
      },
      fail: res => {
        console.log("fail to delete msg", res)
      }
    })
  }

})