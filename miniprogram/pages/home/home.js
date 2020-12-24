// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据 类似vue的data
   */
  data: {
    //骨架屏的加载
    loading: true,

    //分类列表数据
    classifyList: [],
    
    //激活的下标
    activeIndex: 0,

    //商品数据
    products: [],

    //购物车商品数量
    shopCartCount: 0,

    isAdd: false,

    //购物车是否隐藏
    isHidden: true,

    //购物车商品数据
    shopcartData: [],

    //是否编辑购物车
    isEdit: false,

    //最终确认要购买的商品的_id集合
    _ids: [],

  },

  /**
   * 生命周期函数--监听页面加载,一般用于初始化页面数据(类似vue的created)
   */
  onLoad: function (options) {
    
    //获取菜单列表数据
    this.getMenuList();
    //获取购物车数据
    this.getShopcartData();
    //根据商品类型获取商品数据
    this.getProductByType('zhou');

    setTimeout(() => {
      this.setData({
        loading: false
      })
    }, 1200)

  },

  //页面显示执行
  onShow() {
    //每次切换页面隐藏购物车
    this.setData({
      isHidden: true
    })
    //获取购物车数据
    this.getShopcartData();
    //根据商品类型获取商品数据
    this.getShopcartContent();
  },

  //获取购物车数据
  getShopcartData() {
    //开启加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_shopcart】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_shopcart',

      //成功执行
      success: result => {
  
        //关闭加载提示
        wx.hideLoading();

        // console.log(result);
        // console.log('getShopcartData result ==> ', result);

        let data = result.result.data;

        if (Array.isArray(data)) {
          this.setData({
            shopcartData: data,
            shopCartCount: data.length
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
  },

  //添加购物车成功后，累加数量
  modifyShopcartCount(e) {
    // console.log('modifyShopcartCount e.detail ==> ', e.detail);
    this.setData({
      shopCartCount: ++this.data.shopCartCount,
      isAdd: true
    })
    //延迟关闭动画效果
    setTimeout(() => {
      this.setData({
        isAdd: false
      })
    }, 600)

    //获取购物车的商品具体数据
    this.getShopcartContent();

    },

  //获取菜单列表数据
  getMenuList(){
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数 get_menu_list
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_menu_list',

      //成功执行
      success: result =>{
        //关闭加载提示
        wx.hideLoading();

        // console.log('调用云函数成功');
        // console.log('result ==>', result);
        this.setData({
          classifyList: result.result.data
        })
      },
      // 失败
      fail: err =>{
        //关闭加载提示
        wx.hideLoading();

        console.log(err)
      }
    })
  },

  //点击切换菜单分类
  toggleMenuList(e){
    // console.log('e==>', e)
    if(this.data.activeIndex == e.currentTarget.dataset.index){
      return;
    }
    this.setData({
      activeIndex: e.currentTarget.dataset.index,
    })

    //根据商品类型获取商品数据
    this.getProductByType(e.currentTarget.dataset.type)

  },

  //根据商品类型获取商品数据
  getProductByType(type){
    //加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'get_products',
      data: {
        type
      },

      success: result => {
        wx.hideLoading();
        // console.log(result);

        result.result.data.map(v => {
          v.rules.map(item => {
            item.currentIndex = -1;
          })
        })

        this.setData({
          products: result.result.data,
          loading: false
        })

        // console.log('products==>', this.data.products)s

      },
      fail: err => {
        wx.hideLoading();
        console.log(err)
      }
    })

  },

  //修改currentIndex
  changeCurrentIndex(e){

    let index = e.currentTarget.dataset.index;
    // console.log('modifyCurrentIndex index ==> ', index);
    
    this.data.products[index].rules[e.detail.rulesIndex].currentIndex = e.detail.index;

    this.setData({
      products: this.data.products
    })
  },

  //打开,关闭购物车
  toggleShopcart(e){

    let hidden = e.currentTarget.dataset.hidden;
    if(e.currentTarget.dataset.rule == "1"){
      return;
    }
    this.setData({
      isHidden: !!Number(hidden),
      //关闭购物车编辑状态
      isEdit: false
    })

  },

  //获取购物车的商品具体数据
  getShopcartContent(){
    //开启加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_shopcart】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_shopcart',

      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        let data = result.result.data
        data.map(v=>{
          v.isSelete = false
        })
        this.setData({
          shopcartData: data
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

  //编辑购物车
  editShopcart(){

    this.setData({
      isEdit: !this.data.isEdit
    })

    let data = this.data.shopcartData;
    data.map(v=>{
      v.isSelete = false
    })
    this.setData({
      shopcartData: data
    })

  },

  //选择购物车商品
  seleteShopcartProduct(e){
    //点击的商品的下标
    let index = e.currentTarget.dataset.index;

    let data = this.data.shopcartData
    data[index].isSelete = !data[index].isSelete;
    this.setData({
      shopcartData: data
    })
    // console.log('this.data.shopcartData==>',this.data.shopcartData);
  },

  //删除购物车商品
  deleteShopcartProduct(){
    //获取带有标记(isSelete: true)的商品的_id
    let data = this.data.shopcartData;
    //存储商品的pid(即商品的_id)
    let ids = [];
    for(let i=0;i<data.length;i++){
      if(data[i].isSelete){
        ids.push(data[i]._id)
      }
    }
    if(ids.length == 0){
      wx.showToast({
        title: '请选择商品',
        mask: true,
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    // console.log('ids==>',ids)
    
    ids.map(v=>{
      //开启加载提示
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      //调用云函数【delete_shopcart】
      wx.cloud.callFunction({
        //云函数名称
        name: 'delete_shopcart',
        data: {
          _id: v
        },

        //成功执行
        success: result => {
          //关闭加载提示
          wx.hideLoading();
          // console.log('delete_shopcart==>', result)

          //获取购物车的商品具体数据
          this.getShopcartContent()

          //减少购物车显示的数量
          this.setData({
            shopCartCount:this.data.shopCartCount - ids.length
          })

        },
        fail: err => {
          //关闭加载提示
          wx.hideLoading();
          console.log('err ==> ', err);
        }
      })

    })
  },


  //去结算
  toPay() {
    //初始化_ids
    this.data._ids = [];

    //获取最终确认要购买的商品的_id
    let data = this.data.shopcartData;
    //存储商品的pid(即商品的_id)
    for(let i=0;i<data.length;i++){
      this.data._ids.push(data[i]._id)
    }

    this.setData({
      _ids: this.data._ids
    })

    // console.log('获取最终确认要购买的商品的_id集合==>',this.data._ids)

    //跳转到非tabbar页面
    wx.navigateTo({
      url: '../pay/pay?_ids=' +this.data._ids.join('-')
    })
  }
})