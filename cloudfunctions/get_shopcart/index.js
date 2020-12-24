// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

let db = cloud.database();

//获取查询指令引用
let _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  
  //获取当前时间
  let currentTime = new Date().getTime() - 30 * 60 * 1000;

  let currentDate = new Date(currentTime);


  //查询距离当前时间的半小时内购物车数据，集合的shopcart的time字段 >= currentDate
  return await db.collection('shop_cart').where({
    time: _.gte(currentDate),
    userInfo: event.userInfo
  }).get().then(async(result) =>{
    // console.log(result)
    //当商品pid = 商品集合的_id
    let pids = [];
    result.data.map(v => {
      pids.push(v.pid);
    })
    //根据pids查询商品集合数据
    return await db.collection('products').where({
      _id: _.in(pids)
    }).get().then(async (res) => {
      // console.log('根据pids查询商品集合数据 res ==> ', res);

      //将购物车的数据和商品数据合并
      result.data.map(v => {

        //根据商品pid查找商品数据
        for (let i = 0; i < res.data.length; i++) {
          if (v.pid == res.data[i]._id) {
            v.product = res.data[i];
            break;
          }
        }
      })

      //返回合并后的数据
      return result;
      
    })
    
  });

}