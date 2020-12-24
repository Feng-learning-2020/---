//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //骨架屏
    loading: true,
    //订单的商品的_id集合
    _ids: [],
    //地址信息
    addressInfo: {},
    //订单商品数据
    productData: [],
    count: 0,
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //此页面的app.globaData是为了存储购物车商品的_ids,防止选择地址回来后缺失购物车商品的_ids
    if (app.globalData._ids) {
      this.data._ids = app.globalData._ids.split('-');
    } else {
      this.data._ids = options._ids.split('-');
    }

    //options.aid: 选择的地址发回来的地址_id
    if (options.aid) {
      //根据地址_id查询地址信息
      this.getDefaultAddress('_id', options.aid);
    } else {
      //获取默认地址
      this.getDefaultAddress('isDefault', true);
    }

    //根据_ids获取订单商品全部数据并计算
    this.getProductData();

  },

  onShow() {
    //删除全局_ids
    delete app.globalData._ids;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 1200)
  },

  //获取默认地址
  getDefaultAddress(key, value){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_address_by_key】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_address_by_key',

      data: {
        key,
        value
      },  
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('getDefaultAddress result ==> ', result);

        // 如果存在默认地址
        if(result.result.data.length > 0){
          let data = result.result.data[0]
          //把地区格式改为字符串
          data.area = data.area.join('')
          // console.log(data)

          this.setData({
            addressInfo: data
          })
        }else{
          // wx.showToast({
          //   title: '没有默认地址',
          //   icon: 'none',
          //   duration: 2000,
          //   mask: true
          // })
        }
        

      },
      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading(); 
        console.log('err ==> ', err);
      }
    })
  },

  //根据_ids获取订单商品全部数据并计算
  getProductData(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_shopcart_pay】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_shopcart_pay',

      data: {
        _ids: this.data._ids
      },  
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();

        //reverse():把数组里的元素顺序颠倒
        result.result.data.reverse();

        this.data.productData = result.result.data;

        //计算商品数量和总价
        this.data.count = 0;
        this.data.total = 0;

        this.data.productData.map(v=>{
          this.data.count += v.count;
          this.data.total += v.count*v.product.price;
        })

        this.setData({
          productData: result.result.data,
          count: this.data.count,
          total: this.data.total
        })

      },
      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('err ==> ', err);
      }
    })
  },

  //点击选择收货地址>跳到地址页面
  selectAddress(e){
    // console.log('e==>',e)
    let selete = e.currentTarget.dataset.selete

    //储存购物车商品的_ids,防止选择地址回来后缺失购物车商品的_ids
    app.globalData._ids = this.data._ids.join('-');
    wx.navigateTo({
      url: '../address/address?selete=' + selete
    })
  },


  //点击结算
  settleOrder(){
    // console.log(this.data.addressInfo)
    // 如果没有地址
    if(!this.data.addressInfo._id){
      wx.showToast({
        title: '请选择地址',
        icon: 'none',
        duration: 1500,
        mask: true
      })
      return;
    }else{

      //获取地址_id
      let aid = this.data.addressInfo._id;

      //获取购物车的id集合
      let sid = this.data._ids;

      wx.showModal({
        title: '提示',
        content: '立即结算订单',
        confirmColor: '#ff0033',
        success (res) {
          if (res.confirm) {

            // console.log(sid);

            //启动加载提示
            wx.showLoading({
              title: '加载中...',
              mask: true
            })
            //调用云函数【add_order】
            wx.cloud.callFunction({
              //云函数名称
              name: 'add_order',

              data: {
                aid,
                sid
              },  
              //成功执行
              success: result => {
                //关闭加载提示
                wx.hideLoading();

                if (result.result.stats.removed > 0) {
                  //添加订单成功
                  wx.showToast({
                    title: '结算成功',
                    mask: true,
                    icon: 'none',
                    duration: 1500 
                  })
                  setTimeout(()=>{
                    wx.switchTab({
                      url: '../order/order'
                    })
                  },1000)
                  
                } else {
                  wx.showToast({
                    title: '结算失败',
                    mask: true,
                    icon: 'none',
                    duration: 2000 
                  })
                }
              },
              // 失败
              fail: err => {
                //关闭加载提示
                wx.hideLoading();
                console.log('err ==> ', err);
              }
            })

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    }

    
  }


})