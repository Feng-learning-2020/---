let app = getApp();

Component({
  /**
   * 组件的属性列表,一般用于父子组件传值
   */
  properties: {
    productData:{
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //是否隐藏选择规格窗口
    isHidden: true,
    //弹出层的top
    top: "100%",
    //选择的数量
    currentProduct:{
      count: 1
    },
    //选择的规格
    rules: [],
    //是否授权
    isAuth: false
    
  },

  //组件的生命周期
  lifetimes: {

    created() {
      //获取用户授权信息
      wx.getSetting({
        success: res => {
          // console.log('获取用户授权信息 res ==> ', res);
          
          //isAuth: 是否授权
          app.globalData.isAuth = res.authSetting['scope.userInfo'];

          this.setData({
            isAuth: res.authSetting['scope.userInfo']
          })
        }
      })
    },

  },

  /**
   * 组件的方法列表
   */
  methods: {

    //显示，隐藏规格窗口
    toggleRuleBox(e){
      // console.log("选规格e ==>",e)
      let dataset = e.currentTarget.dataset;

      //如果点击rules，则不关闭规格面板
      if (dataset.rules == '1') {
        // console.log('不关闭');
        return;
      }

      //如果是隐藏，延迟隐藏面板
      if (dataset.hidden == '1') {
        setTimeout(() => {
          this.setData({
            isHidden: !!Number(dataset.hidden),
            rules: ''
          })
        }, 310)
      } else {
        this.setData({
          isHidden: !!Number(dataset.hidden)
        })
      }

      this.setData({
        top: dataset.top
      })
    },

    //改变数量
    changeCount(e){
      let count = Number(e.currentTarget.dataset.count) + this.data.currentProduct.count;
      this.data.currentProduct.count = count < 1 ? 1 : count;

      this.setData({
        currentProduct: this.data.currentProduct
      })
    },

    //选择规格
    selectRule(e){
      // console.log("选择规格==>", e)
      let dataset = e.currentTarget.dataset;
      //当前点击的下标
      let index = dataset.index;
      //选中的下标
      let currentIndex = dataset.currentIndex;
      //点击的类别在relus数组的下标
      let rulesIndex = dataset.rulesIndex;

      //点击同一个
      if (currentIndex == index) {
        // console.log('相同的规格');
        return;
      }

      //子组件通过触发自定义事件通知父组件(home页面), 并且携带参数{index}
      this.triggerEvent('currentIndexEvent', {index, rulesIndex});

      //获取选择规格
      let rules = [];
      this.properties.productData.rules.map(v => {
        if (v.currentIndex > -1) {
          let rule = v.rule[v.currentIndex];
          rules.push(rule);
        }
      })

      this.setData({
        rules: rules.join('/')
      })
    },

    //加入购物车
    addShopCart(){
      //判断是否选择规格
      let rules = this.properties.productData.rules;
      for (let i = 0; i < rules.length; i++) {
        if (rules[i].currentIndex == -1) {
          //提示用户选择规格
          wx.showToast({
            title: '请选择规格',
            icon: 'none',
            duration: 2000,
            mask: true
          })
          return;
        }
      }

      //执行加入购物车
      //获取商品id, 选择的规格, 商品数量
      let _id =  this.properties.productData._id;
      let rule = this.data.rules;
      let count = this.data.currentProduct.count;

      wx.showLoading({
        title: '加载中...',
        mask: true
      })        

      //调用云函数
      wx.cloud.callFunction({
        name: "add_shop_cart",
        data: {
          pid: _id,
          rule,
          count
        },
        success: result=> {
          wx.hideLoading();
          // console.log('addshopcart.result==>',result)

          this.setData({
            top: '100%'
          })

          setTimeout(() => {
            this.setData({
              isHidden: true
            })
          }, 310)

          if (result.result._id) {
            wx.showToast({
              title: '加入购物成功',
              icon: 'none',
              duration: 2000,
              mask: true
            })

            //触发定义时间
            this.triggerEvent('addShopcart', {count: 1});
            
          } else {
            wx.showToast({
              title: '加入购物失败',
              icon: 'none',
              duration: 2000,
              mask: true
            })
          }
          
        },
        fail: err=> {
          wx.hideLoading();
          console.log(err)
        }
      })


    },

    //获取用户授权
    getUserAuthInfo(res) {
      console.log('用户授权 res ==> ', res);
      if (res.detail.userInfo) {
        app.globalData.isAuth = true;
        this.setData({
          isAuth: true
        })
      }
    }
  }


})
