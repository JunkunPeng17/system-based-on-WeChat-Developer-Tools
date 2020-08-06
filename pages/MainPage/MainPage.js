// pages/MainPage/MainPage.js
var app = getApp()
var PageNo = 0; //页码
var Limit = 20;
var TotalNum = 0;
var NowNum = 0;
var Clock = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamInfo: [],
		searchTeamInfo:[],
    SearchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    SearchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
		Login: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		inputShowed: false,
		inputVal: "",
		select: ["ProjectName", "Taps"],
		selectIndex: 0,
		selectArray: [{
			"id": "0",
			"text": "ProName"
		}, {
			"id": "1",
			"text": "Tabs"
		}]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({ title: 'loading…' })
    var that = this;
		this.setData({
			search: that.search.bind(that)
		})
		var data = wx.cloud.database().collection("TeamInfo").orderBy("createTime", "desc")

    data.count().then(res => {
      TotalNum = res.total
    })
    setTimeout((function callback() {
      that.getFirstPage()
    }).bind(that), 1000);

  },

	onPullDownRefresh:function(){
		this.onLoad();
		wx.stopPullDownRefresh()
	},
	getDate: function (e) {
		this.setData({
			selectIndex:e.detail.id
		})
		console.log("id", e.detail.id)
	},
	bindSelectChange: function (e) {
		console.log('picker 发生选择改变，携带值为', e.detail.value);
		this.setData({
			selectIndex: e.detail.value
		})
	},
	search: function (value) {
		if(value==""){
			this.setData({
				inputShowed: false
			})
		}
		this.setData({
			searchTeamInfo: []
		})
		var teamInfo=this.data.teamInfo
		var searchTeamInfo=this.data.searchTeamInfo
		console.log("input",value)
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				if (this.data.selectIndex == 0) {
					this.setData({
						inputShowed : true
					})
					for (var i = 0; i < teamInfo.length;i++){
						if (teamInfo[i].projectName.toLowerCase().search(value.toLowerCase())!=-1){
							searchTeamInfo.unshift(teamInfo[i])
							this.setData({
								searchTeamInfo:searchTeamInfo
							})
						}
					}
					console.log("searchTeamInfo",this.data.searchTeamInfo)
					console.log("inputShowed", this.data.inputShowed)
				}
				else if(this.data.selectIndex==1){
					this.setData({
						inputShowed: true
					})
					for (var i = 0; i < teamInfo.length; i++) {
						for (var j=0;j<teamInfo[i].tags.length;j++){
							if (teamInfo[i].tags[j].toLowerCase().search(value.toLowerCase()) != -1) {
								searchTeamInfo.unshift(teamInfo[i])
								this.setData({
									searchTeamInfo: searchTeamInfo
								})
								break
						}
							
						}
					}
				}
			}, 200)
		})
	},
  onShow:function(){

  },
	clear:function(){
		this.setData({
			searchTeamInfo:[],
			inputShowed: false
		})
	},
	// blur:function(){
	// 	this.setData({
	// 		inputShowed: false
	// 	})
	// },

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
		var data = wx.cloud.database().collection("TeamInfo").orderBy("createTime", "desc")
    if (TotalNum > Limit) {
      data.limit(Limit).get().then(res => {
        NowNum += Limit
        that.setData({
          teamInfo: res.data
        })
				console.log("teamInfo",this.data.teamInfo)
      })
      wx.hideLoading()
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
				console.log("teamInfo", this.data.teamInfo)
        console.log("over", that.data.SearchLoadingComplete)
      })
      wx.hideLoading()
    }
  },




/**
   * 跳转到其他页面
   */
  navigate:function(e) {
		var that=this
		if (app.globalData.hasLogin) {
			console.log("hasLogin", app.globalData.hasLogin)
			this.setData({
				Login: true
			})
		}
		else {
			console.log("hasLogin", app.globalData.hasLogin)
			this.setData({
				Login: false
			})
		}
		if (that.data.Login == false) {
			wx.showToast({
				title: 'Please log in',//提示文字
				duration: 2000,//显示时长
				mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false  
				icon: 'none', //图标，支持"success"、"loading"  
			})
		}
		else{
			var id = e.currentTarget.dataset.index
			console.log("id", id)
			wx.navigateTo({
				url: '/pages/teampage/teampage?id=' + id+"&role="+0,
			})
		}
		
  },
/**
   * 当拖动到底部，触发
   */
  onReachBottom: function() {
    if (Clock) {
      // wx.showLoading({
      // 	title:"Loading..."
      // })
      var that = this;
			var data = wx.cloud.database().collection("TeamInfo").orderBy("createTime", "desc")
      if (!that.data.SearchLoadingComplete) {
        if (TotalNum - NowNum > Limit) {
          that.setData({
            SearchLoading: true
          })

          data.skip(NowNum).limit(Limit).get().then(res => {
            for (var i = 0; i < res.data.length; i++) {
              that.data.teamInfo.push(res.data[i])
            }
            that.setData({
              teamInfo: that.data.teamInfo
            })
            Clock = false
          });
          setTimeout((function callback() {
            NowNum += Limit
            that.setData({
              SearchLoading: false
            })
            Clock = true
            // wx.hideLoading()
          }).bind(that), 1000);

          // wx.hideLoading()
        } else {
          that.setData({
            SearchLoading: true
          })
          data.skip(NowNum).limit(TotalNum - NowNum).get().then(res => {
            for (var i = 0; i < res.data.length; i++) {
              that.data.teamInfo.push(res.data[i])
            }
            that.setData({
              teamInfo: that.data.teamInfo
            })
            Clock = false
          });
          setTimeout((function callback() {
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

  }

})