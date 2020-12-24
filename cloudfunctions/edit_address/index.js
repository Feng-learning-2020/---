// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database();

//编辑地址
 async function editAddress(event) {
  return await db.collection('address').where({
    _id: event._id,
    userInfo: event.userInfo
  }).update({
    data: event.data
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log('event ==> ', event);

  //如果是默认地址
  if (event.data.isDefault) {

    //01-查询数据库是否存在默认地址
    return await db.collection('address').where({
      isDefault: true,
      userInfo: event.userInfo
    }).get().then(async (result) => {

      if (result.data.length > 0) {
        //数据库存在默认地址
        //需要将数据默认地址修改为非默认地址
        return await db.collection('address').where({
          _id: result.data[0]._id,
          userInfo: event.userInfo
        }).update({
          data: {
            isDefault: false
          }
        }).then(async (res) => {

          if (res.stats.updated == 1) {
            //修改当前地址数据
            return await editAddress(event);
          }

        }).catch(err => {
          console.log('err ==> ', err);
        })
      } else {
        return await editAddress(event);
      }
    }).catch(err => {
      console.log('err ==> ', err);
    })
  } else {
    //不是默认地址
    return await editAddress(event);
  }

}