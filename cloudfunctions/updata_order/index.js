// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  return await db.collection('order').where({
    _id: event._id,
    address: {
      userInfo: event.userInfo
    }
  }).update({
    data: {status: 1}
  });
  
}