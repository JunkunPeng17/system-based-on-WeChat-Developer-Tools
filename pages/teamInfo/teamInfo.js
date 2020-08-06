// pages/teamInfo/teamInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamName:"",
    projectName:"",
    introduction:"",
    oneTag:"",
    tags:[],
    numOfTMindex: 0,
    numRange:["Not Specified",3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    start:"",
    end: "",
    date:"",
    checked:false,
    files: [],
    imgUrls: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate()+1;
    var startDate = year + "-" + month + "-" + day;
    var endDate = (year + 1) + "-" + month + "-" + day;
    this.setData({
      teamName: "",
      projectName: "",
      introduction: "",
      oneTag:"",
      tags:[],
      numOfTMindex: 0,
      start: startDate,
      date: startDate,
      end: endDate,
      checked:false,
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },

  /**
   * 增加一个新标签
   */
  addTag: function(){
    if(this.data.tags.length==5){
      wx.showToast({
        icon: 'none',
        title: 'No more than 5 tags'
      });
      return;
    }
    if(this.data.oneTag==""){
      wx.showToast({
        icon:"none",
        title: 'please Input Something for the team tag',
      })
      return;
    }
    var newTags = this.data.tags;
    newTags.push(this.data.oneTag);
    this.setData({
      tags: newTags
    })
    this.setData({
      oneTag:""
    })
    
  },

  deleteTag(ev){
    var newTags = this.data.tags;
    newTags.splice(ev.target.dataset.index, 1);
    this.setData({
      tags: newTags
    })
    console.log(this.data.tags);
  },

  /**
   * 以下函数：根据用户输入的内容改变data里的值
   */
  changeTeamName(ev){
    this.setData({
      teamName: ev.detail.value
    })
  },

  changeProjectName(ev){
    this.setData({
      projectName: ev.detail.value
    })
  },

  changeIntro(ev){
    this.setData({
      introduction: ev.detail.value
    });
  
  },

  changeOneTag(ev){
    this.setData({
      oneTag: ev.detail.value
    })
  },

  changeNumOfTM(ev) {
    this.setData({
        numOfTMindex: ev.detail.value
      })
      
  },

  changeDate(ev){
    this.setData({
      date: ev.detail.value
    });
    
  },

  changeCheckbox(ev){
    if (this.data.checked==true){
      this.setData({
        checked: false
      })
    }
    else{
      this.setData({
        checked: true
      })
    }
    console.log(this.data.checked)
  },
  
  
  /**
   * 提交小组信息
   */
  submit(){
    
    
    const teamInfo_database = wx.cloud.database().collection("TeamInfo");
    if (this.data.numOfTMindex!=0){
      teamInfo_database.add({
        data: {
          teamName: this.data.teamName,
          projectName: this.data.projectName,
          introduction: this.data.introduction,
          tags: this.data.tags,
          deadline: this.data.date,
          numOfTM: this.data.numRange[this.data.numOfTMindex],
          currentNum: 1,
          teamMateID:[],
          imgUrls: this.data.imgUrls,
          comment: [],
          reply: [],
          startDate:this.data.start,
          createTime: wx.cloud.database().serverDate()
        }
      }).then(res => {
        console.log("成功添加到数据库");
        wx.switchTab({
          url: '../MainPage/MainPage',
          success:function(e){
            var page = getCurrentPages().pop();
            if(page==undefined || page ==null) return;
            page.onLoad();
          }
        })
      })
        .catch(res => {
          console.log("添加到数据库失败")
        })
    }else{
      teamInfo_database.add({
        data: {
          teamName: this.data.teamName,
          projectName: this.data.projectName,
          introduction: this.data.introduction,
          tags: this.data.tags,
          deadline: this.data.date,
          numOfTM: -1,
          currentNum: 1,
          teamMateID:[],
          imgUrls: this.data.imgUrls,
          comment: [],
          reply: [],
          startDate: this.data.start,
          createTime: wx.cloud.database().serverDate()
        }
      }).then(res => {
        console.log("成功添加到数据库");
        wx.switchTab({
          url: '../MainPage/MainPage',
          success: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      })
        .catch(res => {
          console.log("添加到数据库失败")
        })
    }

    
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
        console.log(this.data.files);
      },
      fail: console.error
    })
    
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },
  uplaodFile(files) {
    console.log('upload files', files);
    var obj = {};
    var uploadUrls = [];
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      for(var i = 0; i < files.tempFiles.length; i++){
        var date = new Date();
        var fileName = date.getTime() + i;
        fileName += ".jpg";
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: files.tempFiles[i].path,
          success: res => {
            var urls = this.data.imgUrls;
            urls.push(res.fileID);
            uploadUrls.push(res.fileID);
            obj['urls'] = uploadUrls;
            console.log(obj)
            if(uploadUrls.length == files.tempFiles.length){
              console.log(this.data.imgUrls)
              resolve(obj);
            }
            
          },
          fail: err => {
            reject("some error")
          }

        });
      }
      
    })
  },

  deleteImg: function (e) {
    var imgUrls = this.data.imgUrls;
    var item = e.detail.item;
    var index = 0;
    for(var i = 0; i < imgUrls.length; i++){
      if (imgUrls[i]==item.url){
        index = i;
      }
    }
    imgUrls.splice(index, 1);
    this.setData({
      imgUrls: imgUrls
    });
    var fileIDs = [];
    fileIDs.push(item.url)
    
    wx.cloud.deleteFile({
      fileList: fileIDs
    }).then(res => {
      console.log(res);
    })
  },
  
  uploadError(e) {
    console.log('upload error', e.detail)
  },

  uploadSuccess(e) {
    console.log('upload success', e.detail)
  },
  
})
