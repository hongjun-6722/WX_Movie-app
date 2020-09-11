// pages/comment/comment.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},
    Content:'',
    score:5,
    images:[],
    fileIds:[],
    movieid:-1,
    cover_image:[],
  },
  onContentChange:function(event){
    this.setData({
      Content:event.detail
    })
  },
  onScoreChange:function(event){
    this.setData({
      score:event.detail
    })
  },
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
      }));
    }
      Promise.all(promiseArr).then(res => {
        db.collection('comment').add({
          data:{
            Content:this.data.Content,
            score:this.data.score,
            movieid:this.data.movieid,
            fileIds:this.data.fileIds,
          }
        }).then(res=>{
          wx.hideLoading()
          wx.showToast({
            title: '评价成功',
          })
        }).catch(err=>{
          wx.hideLoading()
          wx.showToast({
            title: '评价失败',
          })
        })
      })
    
  },
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieid:options.movieid,//电影ID
    })
    console.log(options);
    wx.cloud.callFunction({
      name:'getDetail',
      data:{
        movieid:options.movieid
      }
    }).then(res =>{
      console.log(res);
      this.setData({
        detail:JSON.parse(res.result),
      })
    }).catch(err => {
      console.error(err);
    }),
    this.setData(

    )
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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