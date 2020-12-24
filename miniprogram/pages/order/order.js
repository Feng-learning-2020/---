
import {utils} from "../../js/utils"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //骨架屏开关
    loading: true,

    //订单数量偏移量
    offset: 0,

    //每次查询订单数据量
    count: 5,

    //订单数据
    orderData: [],

    //是否存在数据加载
    // isHas: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取所有订单信息
    this.getOrderInfo()
  },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },



  //获取所有订单信息
  getOrderInfo(){

    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_order】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_order',

      data: {
        offset: this.data.offset,
        count: this.data.count
      },  

      //成功执行
      success: result => {
        //关闭骨架屏
        if (this.data.loading) {
          this.setData({
            loading: false
          })
        }
        //关闭加载提示
        wx.hideLoading();

        result.result.data.map(v => {
          //处理订单日期
          v.date = utils.formatDate(v.date, 'yyyy-MM-dd hh:mm:ss');

          //处理地址
          v.address.detailAddress = v.address.area.join('') + v.address.detail;

          //记录订单的商品数量和总价
          v.productCount = 0;
          v.total = 0;
          v.products.map(item => {
            v.productCount += item.count;
            v.total += item.count * item.product.price;
          })
        })

        // console.log('getOrderData result ==> ', result);
        this.data.orderData = result.result.data;
  
        this.setData({
          orderData: this.data.orderData,
        })

        // console.log('this.data.orderData ==> ', this.data.orderData);
  
      },
      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        
        console.log('err ==> ', err);
      }
    })
  },


  //点击确认收货
  finishOrder(e){

    let _id = e.currentTarget.dataset.id;
    
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【updata_order】
    wx.cloud.callFunction({
      //云函数名称
      name: 'updata_order',

      data: {
        _id,
      },  

      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        console.log(result)
        
        wx.showToast({
          title: '确认收货成功',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        //重新获取数据
        this.getOrderInfo()

      },
      // 失败
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        console.log('err ==> ', err);
      }
    })

  }

 
})