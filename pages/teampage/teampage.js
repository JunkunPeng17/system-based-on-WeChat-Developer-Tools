// pages/teampage/teampage.js
var app = getApp()

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function buttonClicked(self) {
  self.setData({
    buttonClicked: true
  })
}
Page({
  data: {
    // role:0, direct from team square; role:1, direct from member; role:2 direct from leader
    role: 0,

    imgUrlsss: [],
    swiperIndex: 0,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1300,
    Hei: "",

    imgUrl: [],

    teamid: [],
    applyteamID: [],
    teamIntro: [],
    leadername: "",
    leaderID: "",
    teamMembername: [],
    teamMember: [],
    teamName: [],
    projectName: [],
    tags: [],
    ddl: [],
    currentNum: 1,
    numOfTM: 0,

    selfinfor: [],
    nickname: "",
    gender: "",
    major: [],
    grade: [],
    address: [],

    memberCheck: false,
    buttonClicked: false,
    isFull: false
  },

  bindchange(e) {
    this.setData({
      swiperIndex: e.detail.current
    })
  },

  imgH: function(e) {
    //获取当前屏幕的宽度
    var winWid = wx.getSystemInfoSync().windowWidth;
    //图片高度
    var imgh = e.detail.height;
    var imgw = e.detail.width;
    var swiperH = winWid * imgh / imgw + "px"
    this.setData({
      Hei: swiperH　　　　　　　　 //设置高度
    })
  },


  onLoad: function(options) {
    let that = this;

    if (options != null) {
      wx.showLoading({
        title: 'Loading...',
      })
      wx.cloud.database().collection("TeamInfo").doc(options.id).get().then(res => {
        // console.log("成功", res)
        this.setData({
          role: options.role,
          teamid: options.id,
          applyteamID: res.data._id,
          imgUrl: res.data.imgUrls,
          leaderID: res.data._openid,
          teamIntro: res.data.introduction,
          teamMember: res.data.teamMateID,
          teamName: res.data.teamName,
          projectName: res.data.projectName,
          tags: res.data.tags,
          ddl: res.data.deadline,
          currentNum: res.data.currentNum,
          numOfTM: res.data.numOfTM
        })
        // console.log("teamIntro", this.data.teamIntro),
        // console.log("img", this.data.imgUrl),
        // console.log("teamLeader", this.data.leaderID),
        // console.log("teamMember", this.data.teamMember)

        this.getLeaderName()
        this.getMemberName()

        if (this.data.leaderID == app.globalData.openid) {
          this.setData({
            memberCheck: true
          })
        }

        for (var i = 0; i < this.data.teamMember.length; i++) {
          if (this.data.teamMember[i] == app.globalData.openid) {
            this.setData({
              memberCheck: true
            })
          }
        }

        if (this.data.numOfTM == this.data.currentNum) {
          this.setData({
            isFull: true
          })
        }

        wx.cloud.database().collection("applications").where({
          _openid: app.globalData.openid,
          applyteamID: this.data.teamid
        }).get().then(res => {
          if (res.data.length != 0) {
            this.setData({
              buttonClicked: true
            })
          }
          wx.hideLoading();
        }).catch(err => {
          console.log(err);
        })
      }).catch(res => {
        console.log("失败", res)
      })

    }

    wx.cloud.database().collection("userInformation").where({
        _openid: app.globalData.openid
      }).get().then(res => {
        this.setData({
          selfinfor: res.data[0],
          nickname: res.data[0].nickname,
          gender: res.data[0].gender,
          major: res.data[0].major,
          grade: res.data[0].grade,
          address: res.data[0].address,
        })
        console.log("Info", this.data.selfinfor)
      })
      .catch(res => {
        console.log("失败", res)
      })

  },

  onShow: function() {
    //重新加载用户信息，用于判断用户是否更新了个人信息
    this.onLoad();
  },

  getLeaderName() {
    wx.cloud.database().collection("userInformation").where({
      _openid: this.data.leaderID
    }).get().then(res => {
      console.log("leaderID", this.data.leaderID, res);
      this.setData({
        leadername: res.data[0].nickname,
      })
      console.log("成功", res)
      console.log("leadername", this.data.leadername)
    })
  },

  getMemberName() {
    var count = 0
    for (var index = 0; index < this.data.teamMember.length; index++) {
      var _tempOpenid = this.data.teamMember[index]
      console.log('openid: ', _tempOpenid)
      wx.cloud.database().collection("userInformation").where({
        _openid: _tempOpenid
      }).get().then(res => {
        console.log(index, _tempOpenid, res)
        this.data.teamMembername[count] = res.data[0].nickname;
        this.setData({
          teamMembername: this.data.teamMembername,
        })
        count++
        console.log("membername", this.data.teamMembername)
      })
    }
  },

  checkapply: function() {
    wx.showToast({
      title: 'Applied yet',
    })
  },

  apply: function() {
    if (this.data.nickname == "--" || this.data.gender == "--" || this.data.major == "--" ||
      this.data.address == "--" || this.data.grade == "--") {
      ///提示用户填写完整信息，用户点击确定后进入修改信息的页面
      wx.showModal({
        title: '',
        content: 'Please Complete Your Information First!',
        showCancel: false,
        confirmText: "OK",
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../edituserinfo/edituserinfo',

            })
          }
        }
      })
    } else {
      const db = wx.cloud.database().collection("TeamInfo");
      db.where({
        _id: this.data.teamid
      }).get().then(res => {
        if (res.data.length == 0) {
          //提示用户小队已经解散，返回到组队大厅
          wx.showModal({
            title: '',
            content: 'This team has been dismissed',
            showCancel: false,
            confirmText: "OK",
            success: function(res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '../MainPage/MainPage',
                  success: function(e) {
                    var page = getCurrentPages().pop();
                    if (page == undefined || page == null) return;
                    page.onLoad();

                  }
                })
              }
            }
          })


        } else {
          buttonClicked(this);
          var time = formatTime(new Date());
          wx.cloud.database().collection('applications').add({
            data: {
              applytime: time,
              type: "application",
              toRead: true,
              nickname: this.data.nickname,
              gender: this.data.gender,
              major: this.data.major,
              grade: this.data.grade,
              address: this.data.address,
              applyteamID: this.data.applyteamID,
              projectName: this.data.projectName,
              leaderID: this.data.leaderID
            },
            success: res => {
              wx.showToast({
                title: 'Successful',
              })
              //console.log('成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                title: 'Failed'
              })
              //console.error('失败：', err)
            }
          })
        }
      })

    }

  },

  navigateToQA: function() {
    const db = wx.cloud.database().collection("TeamInfo");
    db.where({
      _id: this.data.teamid
    }).get().then(res => {
      if (res.data.length == 0) {
        //提示用户小队已经解散，返回到组队大厅
        wx.showModal({
          title: '',
          content: 'This team has been dismissed',
          showCancel: false,
          confirmText: "OK",
          success: function(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../MainPage/MainPage',
                success: function(e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();

                }
              })
            }
          }
        })
      } else {
        wx.navigateTo({
          url: '/pages/QA/QA?id=' + this.data.teamid,
        })
      }
    })

  },

  update() {
    wx.navigateTo({
      url: '../changeTeamInfo/changeTeamInfo?id=' + this.data.applyteamID
    })
  },

  dismissTeam: function() {
    this.setData({
      dialogShow: true
    });
    let that = this;
    wx.showModal({
      title: 'Warning',
      content: 'Are you sure to dismiss the team?',
      confirmText: 'Yes',
      cancelText: "No",
      success(res) {
        if (res.confirm) {
          const db = wx.cloud.database();
          //队长获取通知
          db.collection("Notifications").add({
            data: {
              leaderID: that.data.leaderID,
              projectName: that.data.projectName,
              title: "Team Dismissed",
              content: 'You have dismissed team: ' + that.data.teamName,
              toRead: true,
              createTime: db.serverDate()
            }
          }).then(res => {
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
          //队员收到解散消息
          for (var i = 0; i < that.data.teamMember.length; i++) {
            db.collection("Notifications").add({
              data: {
                leaderID: that.data.teamMember[i],
                projectName: that.data.projectName,
                title: "Team Dismissed",
                content: 'Your team leader ' + that.data.leadername + ' has dismissed team: ' + that.data.teamName,
                toRead: true,
                createTime: db.serverDate()
              }
            }).then(res => {
              console.log(res)
            }).catch(err => {
              console.log(err)
            })
          }
          //删除队伍里的照片
          wx.cloud.deleteFile({
            fileList: that.data.imgUrl
          }).then(res => {
            console.log("delete success")
          }).catch(err => {
            console.log(err)
          })

          //删除队伍并回到主页
          db.collection("TeamInfo").doc(that.data.teamid).remove()
            .then(wx.switchTab({
              url: '../MainPage/MainPage',
              success: function(e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
              }
            }))
            .catch(console.error)
        } else if (res.cancel) {
          console.log("cancel")
        }
      }
    })
  },

  quitTeam: function() {
    const db = wx.cloud.database().collection("TeamInfo");
    db.where({
      _id: this.data.teamid
    }).get().then(res => {
      if (res.data.length == 0) {
        //提示用户小队已经解散，返回到组队大厅
        wx.showModal({
          title: '',
          content: 'This team has been dismissed',
          showCancel: false,
          confirmText: "OK",
          success: function(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../MainPage/MainPage',
                success: function(e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();

                }
              })
            }
          }
        })
      } else {
        this.setData({
          dialogShow: true
        });
        let that = this;
        wx.showModal({
          title: 'Warning',
          content: 'Are you sure to quit the team?',
          confirmText: 'Yes',
          cancelText: "No",
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              //退出的用户获得消息
              wx.cloud.callFunction({
                name: "getOpenid"
              }).then(result => {
                var openid = result.result.openid
                const db = wx.cloud.database();
                db.collection('Notifications').add({
                    data: {
                      leaderID: openid,
                      projectName: that.data.projectName,
                      title: "Quit",
                      content: 'You have quitted team: ' + that.data.teamName,
                      toRead: true,
                      createTime: db.serverDate()
                    }
                  }).then(sucs => {
                    console.log(sucs)
                  })
                  .catch(err => {
                    console.log(err)
                  });
                //将退出的用户从数据库中组员名单移除
                var newTeamMember = that.data.teamMember;
                var quitName = "";
                db.collection("userInformation").where({
                  _openid: openid
                }).get().then(res => {
                  quitName = res.data[0].nickname;
                  var index = 0;
                  for (var i = 0; i < newTeamMember.length; i++) {
                    if (openid == newTeamMember[i]) {
                      index = i;
                    }
                  }
                  newTeamMember.splice(index, 1);
                  wx.cloud.callFunction({
                      name: "updateTeamMate",
                      data: {
                        ID: that.data.teamid,
                        updID: newTeamMember,
                        Num: newTeamMember.length + 1
                      }
                    }).then(sucs => {
                      console.log(sucs)
                    })
                    .catch(err => {
                      console.log(err)
                    });

                  //给其他成员发通知
                  for (var i = 0; i < newTeamMember.length; i++) {
                    db.collection('Notifications').add({
                        data: {
                          leaderID: newTeamMember[i],
                          projectName: that.data.projectName,
                          title: "Quit",
                          content: 'Your teammate ' + quitName + ' has quitted team: ' + that.data.teamName,
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
                  //给队长发消息
                  db.collection("Notifications").add({
                      data: {
                        leaderID: that.data.leaderID,
                        projectName: that.data.projectName,
                        title: "Quit",
                        content: 'Your teammate ' + quitName + ' has quitted team: ' + that.data.teamName,
                        toRead: true,
                        createTime: db.serverDate()
                      }
                    }).then(sucs => {
                      console.log(sucs)
                    })
                    .catch(err => {
                      console.log(err)
                    });

                }).catch(err => {
                  console.log(err);
                })


                //回到主页
                wx.switchTab({
                  url: '../MainPage/MainPage',
                  success: function(e) {
                    var page = getCurrentPages().pop();
                    if (page == undefined || page == null) return;
                    page.onLoad();
                  }
                })


              }).catch(err => {
                console.log(err)
              })

            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })

      }
    })

  },

})