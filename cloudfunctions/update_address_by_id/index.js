// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  // return event;
  return await db.collection('address').where({
    _id: event._id,
    userInfo: event.userInfo
  }).update({
    data: event.updateData
  });
  
}