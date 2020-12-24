// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('products event ==>', event);
  
  return await db.collection('products').where({type: event.type}).get();
}