//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    //地址列表信息
    addressListData: {},

    //是否是选择地址
    selete: '',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)

    //此页面的app.globaData是为了订单结算页面的selete,防止编辑地址或者新建地址回来后缺失selete
    if (app.globalData.selete) {
      this.data.selete = app.globalData.selete;
      this.setData({
        selete: this.data.selete
      })
    } else {
      this.data.selete = options.selete;
      this.setData({
        selete: this.data.selete
      })
    }
    

    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 1200)

    //获取地址列表数据
    this.getAddressList()

  },

  onShow() {
    //删除全局selete
    delete app.globalData.selete;
    //获取地址列表数据
    this.getAddressList()
  },
  


   //新增地址
   addAddress(){
    //储存订单结算页面的selete,防止编辑地址或者新建地址回来后缺失selete
    app.globalData.selete = this.data.selete;
    wx.redirectTo({
      url: '../edit_address/edit_address'
    })
   },

  //  获取地址列表信息
  getAddressList(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_address】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_address',

      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('result ==> ', result);

        let data = result.result.data;
        //把地区信息(数组)改为字符串
        data.map(v => {
          for(let key in v){
            if(key == 'area'){
              v[key] = v[key].join('')
            }
          }
        })
        //把默认地址放到第一位
        for(let i=0;i<data.length;i++){
          if(data[i].isDefault){
            let obj = data[i];
            data.splice(i,1);
            data.unshift(obj)
            break;
          }
        }

        this.setData({
          addressListData: data
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

  //编辑地址
  editAddress(e){
    // console.log('e==>',e.currentTarget.dataset._id)
    let _id = e.currentTarget.dataset._id;

    //储存订单结算页面的selete,防止编辑地址或者新建地址回来后缺失selete
    app.globalData.selete = this.data.selete;
    wx.redirectTo({
      url: '../edit_address/edit_address?_id=' + _id,
    })
  },

  //如果是选择地址,点击地址后返回结算订单页面
  seleteAddress(e){
    // console.log('e ==> ', e);
    //获取地址_id,返回给订单页面的地址_id
    let _id = e.currentTarget.dataset._id;

    wx.navigateTo({
      url: '../pay/pay?aid=' + _id
    })
  }



})