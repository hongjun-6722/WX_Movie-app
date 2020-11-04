// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
const db = cloud.database()

exports.main = async (event, context) => {
  console.log('1')
  return await db.collection('comment').where({
      movieid: event.movieid
  }).get({
    success: function(res) {
    // 输出 [{ "title": "The Catcher in the Rye", ... }]
    console.log(res);
    return('1')
   }
  })

}