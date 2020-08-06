var app = getApp()
const DB = wx.cloud.database().collection("userInformation")
let openid = ""
// let gender = ""
// let grade = ""
// let major = ""
// let nickname = ""


Page({
  data: {
    genders: ["--","Male", "Female"],
    genderIndex: 0,
    nickname: "--",
    gender: "--",
    major: "--",
    grade: "--",
    address: "--",
    focus: false,
    inputValue: ''
  },
  onShow: function (options) {
    wx.showLoading({
      title: 'loading',
    })
    this.setData({
      openid: app.globalData.openid
    })
    this.readInfoFromDatabase();

  },

  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  //要修改的id
  // updDataInput(event) {
  //   openid = event.detail.value
  // },
  //要修改的性别
  // updGender(event) {
  //   this.setData({
  //     gender: event.detail.value
  //   })
  // },
  bindGenderChange: function (e) {
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);
    var _index = e.detail.value
    this.setData({
      genderIndex: e.detail.value,
      gender: this.data.genders[_index]
    })
  },
  //要修改的年级
  updGrade(event) {
    this.setData({
      grade: event.detail.value
    })
  },
  //要修改的专业
  updMajor(event) {
    this.setData({
      major: event.detail.value
    })
  },
  //要修改的姓名
  updNickname(event) {
    this.setData({
      nickname: event.detail.value
    })
  },
  //要修改的address
  updAddress(event) {
    this.setData({
      address: event.detail.value
    })
  },

  //修改数据
  updData() {
    DB.where({
      _openid: openid
    }).update({
      data: {
        grade: this.data.grade,
        major: this.data.major,
        gender: this.data.gender,
        nickname: this.data.nickname,
        address: this.data.address
      },
      success(res) {
        console.log("修改成功", res)
      },
      fail(res) {
        console.log("修改失败", res)
      }
    })
    wx.showToast({
      title: '保存成功',
      icon: 'succes',
      duration: 450,
      mask: true
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
        console.log("get userinformation success02", res.result.data)
        if (res.result.data.length > 0) {
          var data = res.result.data[res.result.data.length - 1]
          var _genderIndex = 0;
          if (data.gender == "Male") _genderIndex = 1;
          else if (data.gender == "Female") _genderIndex = 2;
          else _genderIndex = 0;
          this.setData({
            nickname: data.nickname,
            gender: data.gender,
            major: data.major,
            grade: data.grade,
            address: data.address,
            genderIndex: _genderIndex
          })
          wx.hideLoading()
        } else {
          wx.hideLoading()
          console.log("user did not exist")
        }
      },
      fail: res => {
        wx.hideLoading()
        console.log("fail", res)
      }
    })
  }
})