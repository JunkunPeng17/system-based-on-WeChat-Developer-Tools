
var app = getApp()
const db = wx.cloud.database();

Page({
  /**
  * 页面的初始数据
  */
  
  data: {
    id:"",
    openid:"",
    applicantID: "",
    teamID: "",
    num:0,
    num_set:0,
    oldmateID:[],
    updmateID:[],
    applytime: "--",
    gender: "--",
    grade: "--",
    major: "--",
    nickname: "--",
    pname:"",
    tittle_1:"Application approved",
    tittle_2:"Application failed",
    content_1:"You are approved to join ",
    content_2:"You are rejected to join ",
    teamname:"",
    toRead:true,
    buttonClicked: false
  },

  //当页面加载时
  onShow: function () {
    this.onLoad();
    wx.showLoading({
      title: 'loading',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    
  },
  
  onLoad: function(options){
    this.readInfoFromDatabase(options)

    if(this.data.num=this.data.num_set){
      this.data.buttonClicked=true
    }
    console.log(this.data.buttonClicked)

  },
    //从云台读取用户数据
  readInfoFromDatabase(options) {
      wx.cloud.database().collection("applications").doc(options.id).get({
        success: res => {
          console.log("get information successfully", res.data)
          var data= res.data
            this.setData({
              id : data._id,
              applytime: data.applytime,
              gender: data.gender,
              grade : data.grade,
              major: data.major,
              nickname: data.nickname,
              teamID: data.applyteamID,
              applicantID: data._openid,
              pname: data.projectName,
              
              
            })
          wx.cloud.database().collection("TeamInfo").doc(this.data.teamID).get({
            success: res => {
              console.log("get TeamInfo successfully", res.data)
              var data = res.data

              this.setData({
                updmateID: data.teamMateID,
                pname: data.projectName,
                openid: data._openid,
                teamname: data.teamName,
                num: data.currentNum,
                num_set: data.numOfTM
              })
              fail: res => {

                console.log("read from database failed", res)
              }

            },

          })
            fail: res => {
              console.log("read from database failed", res)
            }
        },
       
      })
  },
  //从云台读取小队数据
  readTeamDatabase(){
      wx.cloud.database().collection("TeamInfo").doc(this.data.teamID).get({
        success: res => {
          console.log("get TeamInfo successfully", res.data)
          var data = res.data

          this.setData({
            updmateID: data.teamMateID,
            pname: data.projectName,
            openid: data._openid,
            teamname: data.teamName,
            num: data.currentNum,
            num_set: data.numOfTM
          })
          fail: res => {
            
            console.log("read from database failed", res)
          }

        },

      })
  },

    
    //本地添加人员
  getMateID:function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    setTimeout(function () {
      wx.hideToast()
    }, 2000)

    wx.cloud.database().collection("TeamInfo").doc(this.data.teamID).get({
      success: res => {
        console.log("get Info successfully", res.data)
        var data = res.data

        this.setData({
          updmateID: data.teamMateID,
          pname: data.projectName,
          openid: data._openid,
          teamname: data.teamName,
          num:data.currentNum,
        })

        //给其他成员发通知
        for (var i = 0; i < this.data.updmateID.length; i++) {
          db.collection('Notifications').add({
            data: {
              leaderID: this.data.updmateID[i],
              projectName: this.data.pname,
              title: this.data.tittle_1,
              content: this.data.nickname + " joins " + this.data.teamname,
              toRead: true,
              createTime: db.serverDate()
            }
          }).then(sucs => {
            console.log(sucs)
          })
            .catch(err => {
              console.log(err)
            });
        }
        this.data.updmateID.push(this.data.applicantID)
        this.addUser()
       
        fail: res => {
          console.log("read from database failed", res)
        }

      },

    })

    wx.navigateBack({
      url: '/pages/appexpel/appexpel',
    })
  },
      //云数据库更新数据
  addUser() {
      console.log(this.data.updmateID)
      wx.cloud.callFunction({
      name: "updateTeamMate",
      data: {
        ID: this.data.teamID,
        updID: this.data.updmateID,
        Num:this.data.num+1
      },
      success: res => {
        console.log(this.data.num+1)
        console.log("Update user successfully", res)
        wx.cloud.callFunction({
          name: "delAppInformation",
          data: {
            delid: this.data.id
          },
          success: res => {
            console.log("Delete application successfully", res)

            //给队长发消息
            db.collection("Notifications").add({
              data: {
                leaderID: this.data.openid,
                projectName: this.data.pname,
                title: this.data.tittle_1,
                content: this.data.nickname + " joins " + this.data.teamname,
                toRead: true,
                createTime: db.serverDate()
              }
            }).then(sucs => {
              console.log(sucs)
            })
              .catch(err => {
                console.log(err)
              })

            //给申请者发送消息
            db.collection("Notifications").add({
              data: {
                leaderID: this.data.applicantID,
                projectName: this.data.pname,
                title: this.data.tittle_1,
                content: this.data.content_1 + this.data.teamname,
                toRead: true,
                createTime: db.serverDate()
              }
            }).then(sucs => {
              console.log(sucs)
            })
              .catch(err => {
                console.log(err)
              })
          },
          fail: res => {
            console.log("Read from database failed", res)
          }
        })
      },
      fail: res => {
        console.log("Read from database failed", res)
      }
    })
  },
  //拒绝并删除该application
  delApplication(){
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    setTimeout(function () {
      wx.hideToast()
    }, 2000)

    wx.cloud.callFunction({
      name: "delAppInformation",
      data:{
        delid:this.data.id
      },
      success: res => {
        console.log("Delete application successfully", res)
        wx.cloud.database().collection("TeamInfo").doc(this.data.teamID).get({
          success: res => {
            console.log("get Info successfully", res.data)
            var data = res.data

            this.setData({
              updmateID: data.teamMateID,
              pname: data.projectName,
              openid: data._openid,
              teamname: data.teamName,
            })
          
            //给申请者发送消息
            db.collection("Notifications").add({
              data: {
                leaderID: this.data.applicantID,
                projectName: this.data.pname,
                title: this.data.tittle_2,
                content: this.data.content_2 + this.data.teamname,
                toRead: true,
                createTime: db.serverDate()
              }
            }).then(sucs => {
              console.log(sucs)
            })
              .catch(err => {
                console.log(err)
              })

            fail: res => {
              console.log("read from database failed", res)
            }

          },

        })
      },
      fail: res => {
        console.log("Read from database failed", res)
      }
    })

    wx.navigateBack({
      url: '/pages/appexpel/appexpel',
    })
  }
})
