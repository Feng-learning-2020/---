// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event==>',event)
  //生成加入购物车时间
  let currentDate = new Date();

  event.time = currentDate;

  return await db.collection('shop_cart').add({
    data: event
  })
}