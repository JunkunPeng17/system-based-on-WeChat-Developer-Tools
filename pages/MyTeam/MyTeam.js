//index.js
const DB = wx.cloud.database().collection("list")
const order = ['demo1', 'demo2', 'demo3']
var PageNo = 0; //页码
var Limit = 5;
var TotalNum = 0;
var NowNum = 0;
var Clock = true;
var ID = "0"
var app = getApp()
app.getId = ""

Page({

  onShareAppMessage() {
    return {
      title: 'scroll-view',
      path: 'pages/index/index'
    }
  },

  data: {
    toView: 'green',
    teamInfo: [],
    SearchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    SearchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
    datalist:[],
    openid:"",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  upper(e) {
    console.log(e)
  },

  lower(e) {
    console.log(e)
  },

  scroll(e) {
    console.log(e)
  },

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },

  tap() {
    for (let i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1],
          scrollTop: (i + 1) * 200
        })
        break
      }
    }
  },

  tapMove() {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  getData(){
    let that = this
    wx.cloud.database().collection("TeamInfo").get({
      success(res){
        console.log("Database obtain succuess", res.data)
        that.setData({
          datalist: res.data
        })
      },
      fail(res){
        console.log("Database obtain fail", res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: 'loading',
    })
    console.log("enter")
    var that = this;
    var data = wx.cloud.database().collection("TeamInfo")
    console.log("1")
    data.count().then(res => {
      TotalNum = res.total
      console.log("2")
      console.log("totalnum", TotalNum)
    })
    that.getData()
    that.getopenid()
    wx.stopPullDownRefresh()
    setTimeout((function callback() {
      that.getFirstPage()
    }).bind(that), 1000);
    wx.hideLoading()
  },
  /**
   * 睡眠函数
   */
  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  },
/**
   * 第一次进入页面，获取第一页
   */
  getFirstPage() {
    var that = this;
    var data = wx.cloud.database().collection("TeamInfo")
    console.log("3")
    if (TotalNum > Limit) {
      data.limit(Limit).get().then(res => {
        console.log("query", res)
        console.log("enter1")
        console.log("Limit", Limit)
        NowNum += Limit
        that.setData({
          teamInfo: res.data
        })
      })
    } else {
      data.limit(TotalNum).get().then(res => {
        console.log("query", res)
        console.log("enter2")
        console.log("Limit", Limit)
        that.setData({
          SearchLoadingComplete: true
        })

        NowNum = TotalNum
        that.setData({
          teamInfo: res.data
        })
        console.log("over", that.data.SearchLoadingComplete)
      })
    }
  },
  /**
   * 跳转到其他页面
   */
  navigate:function(e) {
		var that=this
		var index=e.currentTarget.dataset.index
		console.log("index",index)
		var id=that.data.teamInfo[index]._id
		console.log("id",id)
    wx.navigateTo({
      url: '/pages/QS/QS?id='+id,
    })
		console.log("enter")
  },
  /**
   * 当拖动到底部，触发
   */
  onReachBottom: function() {
    if (Clock) {
      console.log("hhhh")
      // wx.showLoading({
      // 	title:"Loading..."
      // })
      var that = this;
      var data = wx.cloud.database().collection("TeamInfo")
      if (!that.data.SearchLoadingComplete) {
        if (TotalNum - NowNum > Limit) {
          that.setData({
            SearchLoading: true
          })
          console.log("4")
          console.log("nownum", NowNum)

          data.skip(NowNum).limit(Limit).get().then(res => {
            console.log("redata", res)
            console.log("5")
            for (var i = 0; i < res.data.length; i++) {
              that.data.teamInfo.push(res.data[i])
            }

            console.log("teaminfo", that.data.teamInfo)
            that.setData({
              teamInfo: that.data.teamInfo
            })
            Clock = false
          });
          setTimeout((function callback() {
            console.log("6")
            NowNum += Limit
            that.setData({
              SearchLoading: false
            })
            Clock = true
            // wx.hideLoading()
          }).bind(that), 1000);

          // wx.hideLoading()
        } else {
          console.log("7")
          console.log("nownum", NowNum)
          that.setData({
            SearchLoading: true
          })
          data.skip(NowNum).limit(TotalNum - NowNum).get().then(res => {
            console.log("redata", res)
            console.log("8")
            for (var i = 0; i < res.data.length; i++) {
              that.data.teamInfo.push(res.data[i])
            }


            console.log("teaminfo", that.data.teamInfo)
            that.setData({
              teamInfo: that.data.teamInfo
            })
            Clock = false
          });
          setTimeout((function callback() {
            console.log("9")
            NowNum = TotalNum
            that.setData({
              SearchLoading: false,
              SearchLoadingComplete: true
            })
            Clock = true
            // wx.hideLoading()
          }).bind(that), 1000);
        }
      }
    }
  },
  getopenid(){
    let that = this
    wx.cloud.callFunction({
      name:"getopenid",
      success(res){
        console.log("get success", res.result.openid)
        that.setData({
          openid: res.result.openid
        })
      },
      fail(res){
        console.log("get fail", res)
      }
    })
  },
  onclick: function (e) {
    
    ID = e.currentTarget.dataset.text;
    console.log(ID)
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.wxUserInfo = e.detail.userInfo
    this.setData({
      wxUserInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // member
  selfT(e){
    wx.navigateTo({
      url: '/pages/teampage/teampage?id=' + e.currentTarget.dataset.text + '&role=' + 2,
    })
  },
  // leader
  selfS(e){
    wx.navigateTo({
      url: '/pages/teampage/teampage?id=' + e.currentTarget.dataset.text + '&role=' + 1,
    })
  },
  onShow: function (options) {
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
    console.log(this.data.wxUserInfo);
    var that = this
    if(that.data.hasUserInfo == false){
      wx.showToast({
        title: 'Please log in to get more information',
        duration: 3000,
        icon: 'none', 
        mask: true,
      })
    }
    this.onLoad();
  },
  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      currentTab: 0 //当前页的一些初始数据，视业务需求而定
    })
    this.onLoad(); //重新加载onLoad()
  },
})
