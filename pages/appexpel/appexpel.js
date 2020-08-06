// pages/messagebox/messagebox.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonIndex: 0,
    messages: [],
    messageNum: 0,
    buttonColor: ["rgb(0,228,114)","white","white"]
  },

  onShow: function (options) {
    this.onLoad();
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
    if(this.data.buttonIndex == 0){
      this.readMessagesFromDatabase("applications");
      this.readMessagesFromDatabase("expelling");

    }
    else if(this.data.buttonIndex == 1)
      this.readMessagesFromDatabase("applications");
    else if (this.data.buttonIndex == 2){
      this.readMessagesFromDatabase("expelling");
    }
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
  
  arrangeMsg(){
    var _tempMsg = this.data.messages;
    for (var i = 1; i < _tempMsg.length; i++) {
      for (var j = i; j > 0; j--) {
        var diff0 = _tempMsg[j].applytime 
        var diff1 = _tempMsg[j - 1].applytime
        if (diff0 > diff1) {
          var s = _tempMsg[j];
          _tempMsg[j] = _tempMsg[j - 1];
          _tempMsg[j - 1] = s;
        }
      }
    }
    this.setData({
      messages: _tempMsg,
      messageNum : this.data.messageNum
    })
  },

  changeButton: function(res){
    var name = res.target.id;
    if(name == "all"){
      this.setData({
        buttonIndex: 0,
        buttonColor: ["rgb(0,228,114)", "white", "white"]
      })
    }
    else if (name == "applications") {
      this.setData({
        buttonIndex: 1,
        buttonColor: ["white", "rgb(0,228,114)", "white"]
      })
    }
    else if (name == "expelling") {
      this.setData({
        buttonIndex: 2,
        buttonColor: ["white", "white", "rgb(0,228,114)"]
      })
    }
    this.onShow()
  },
  updateToRead: function(event){
    console.log(event.currentTarget.dataset.msgid);
    var msgId = event.currentTarget.dataset.msgid;
    var targetDatabase = event.currentTarget.dataset.databasename;
    wx.cloud.callFunction({
      name: "updToRead",
      data: {
        msgid: msgId,
        databasename: targetDatabase
      },
      success: res => {
        console.log("msg read", res)
      },
      fail: res => {
        console.log("fail to upd msg read", res)
      }
    })
  }
  
})