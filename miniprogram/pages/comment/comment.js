// pages/comment/comment.js
const db = wx.cloud.database();//定义云数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},  //API中数据
    comment_user:{},
    Content:'', //用户评价
    score:5,  //用户评分
    images:[],  //用户上传图片
    fileIds:[], //
    movieid:-1, //电影ID
    resmovieid:'',
    cover_image:[], //电影封面
    comment_summary:[],  //电影详情
    userInfo:{          //获取到的用户信息
      nickName:'',      //用户名
      avatarUrl:'',     //用户头像
    },
  },

  onContentChange:function(event){
    this.setData({
      Content:event.detail
    })
  },  //当用户评论

  onScoreChange:function(event){
    this.setData({
      score:event.detail
    })
  },  //当用户评分

  submit:function(){
    wx.showLoading({
      title: '评论中',
    })

    let promiseArr = [];

    for( let i= 0;i < this.data.images.length;i++){
      promiseArr.push(new Promise((reslove,reject) => {

        let item = this.data.images[i];
        let suffix = /\.\w+$/.exec(item)[0]; //拓展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            console.log(res.fileID)
            this.setData({
              fileIds:this.data.fileIds.concat(res.fileID)
            })
            reslove();
          },
          fail: console.error
          })
      }))
    }

    Promise.all(promiseArr).then(res => {
      console.log("开始提交")
      db.collection('comment').add({
        data:{
          Content:this.data.Content,
          score:this.data.score,
          movieid:this.data.movieid,
          fileIds:this.data.fileIds,
          id_nickName:this.data.userInfo.nickName,
          id_avatarUrl:this.data.userInfo.avatarUrl,
        }
      }).then(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '评价成功',
        })
        this.onReady()
      }).catch(err=>{
        wx.hideLoading()
        wx.showToast({
          title: '评价失败',
        })
      })
    })
    
  },  //用户点击提交

  upLoadImg:function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success : res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this.setData({
          images:this.data.images.concat(tempFilePaths)
        })
      }
    })
  },  //用户点击上传图片


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //电影ID
    this.setData({
      movieid:options.movieid,
    })

    //保存传入对象
    this.setData({
      resmovieid:options,
    })

    //获取权限
    wx.getSetting({
      success (res) {
        console.log(res.authSetting)
        // res.authSetting = {
        //   "scope.userInfo": true,
        //   "scope.userLocation": true
        // }
      }
    })

    //获取用户信息
    var that=this;
    wx.getUserInfo({
      success: function(res) {
      // var userInfo = res.userInfo
        var nickName = 'userInfo.nickName'
        var avatarUrl = 'userInfo.avatarUrl'
        console.log(res);
        that.setData({
          [nickName]:res.userInfo.nickName,
          [avatarUrl]:res.userInfo.avatarUrl,
        });
        console.log("用户信息");
      }
    })
      console.log("获取用户信息成功")
    
    //获取电影详情
    wx.cloud.callFunction({
      name:'getDetail',
      data:{
        movieid:options.movieid
      }
    }).then(res =>{
      console.log(res);
      this.setData({
        detail:JSON.parse(res.result),
      },function(){
        if(JSON.stringify(this.data.detail)!='{}'){
          this.setData({
            comment_summary:this.data.detail.summary.replace(/\\n/g,'\n')
          })
        }
      })
    })
    .catch(err => {
      console.error(err);
    }),

    //获取评论
    wx.cloud.callFunction({
      name:'contentlist',
      data:{
        movieid:options.movieid
      }
    }).then(res =>{
      console.log(options.movieid)
      console.log(res)
      this.setData({
        comment_user:res.result,
      })
    })
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady:function () {
    console.log("刷新")
      wx.getSetting({
        success (res) {
          console.log(res.authSetting)
          // res.authSetting = {
          //   "scope.userInfo": true,
          //   "scope.userLocation": true
          // }
        }
      })
        console.log("获取用户信息");
        var that=this;
        wx.getUserInfo({
          success: function(res) {
          // var userInfo = res.userInfo
            var nickName = 'userInfo.nickName'
            var avatarUrl = 'userInfo.avatarUrl'
            console.log(res);
            that.setData({
              [nickName]:res.userInfo.nickName,
              [avatarUrl]:res.userInfo.avatarUrl,
            });
            console.log("用户信息");
          }
        })
        console.log("获取信息成功")
      
      // console.log(options);
      wx.cloud.callFunction({
        name:'getDetail',
        data:{
          movieid:this.data.resmovieid.movieid
        }
      }).then(res =>{
        console.log(res);
        this.setData({
          detail:JSON.parse(res.result),
        },function(){
          if(JSON.stringify(this.data.detail)!='{}'){
            this.setData({
              comment_summary:this.data.detail.summary.replace(/\\n/g,'\n')
            })
          }
        })
      })
      .catch(err => {
        console.error(err);
      }),
      wx.cloud.callFunction({
        name:'contentlist',
        data:{
          movieid:this.data.resmovieid.movieid
        }
      }).then(res =>{
        // console.log(options.movieid)
        console.log(res)
        this.setData({
          comment_user:res.result,
        })
      })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})