// miniprogram/pages/edit_address/edit_address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //骨架屏
    loading: true,

    //地址信息
    addressInfo: {
      receiver: '',
      tel: '',
      area: '选择省/市/区',
      detail: '',
      isDefault: false
    },

    //编辑地址的_id
    _id: '',

    //保存编辑地址数据副本, 以便对比用户是否编辑过地址信息
    copyAddressInfo: {}
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options: 参数对象
    //截取参数
    let _id = options._id;

    if (_id) {
      //如果_id存在，则表明是编辑地址
      this.setData({ _id })
      //修改导航标题
      wx.setNavigationBarTitle({
        title: '编辑地址'
      })
      //编辑地址时，根据地址_id查询地址信息
      this.findAddressBy_id(_id);

    } else {
      setTimeout(() => {
        this.setData({
          loading: false
        })
      }, 1000)
    }
  },


  //修改文本框的数据
  changeInput(e){

    let key = e.currentTarget.dataset.key;
    this.data.addressInfo[key] =  e.detail.value;

    this.setData({
      addressInfo: this.data.addressInfo
    })
  },

  //验证用户填写信息
  checkAddressInfo(){

    //验证输入的内容是否规范
    let data = this.data.addressInfo;
    for(let key in data){
      //布尔值false == '', 所以这里要用 ===
      if(data[key] ==='' || data[key] == '选择省/市/区'){
        wx.showToast({
          title: '请填写完整的地址信息',
          icon: 'none',
          duration: 2000,
          //防止点击穿透
          mask: true
        })
        return false;
      }
    }

    //验证手机号
    if( !/^1[3-9]\d{9}$/.test(data.tel) ){
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000,
        //防止点击穿透
        mask: true
      })
      return false;
    }
  },

  //查询数据库里的默认地址
  getDefaultAddress(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【get_default_address】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_default_address',
      data: {
        key: 'isDefault',
        value: true
      },
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        console.log('getDefaultAddress得到的默认地址 ==> ', result);

        //如果存在默认地址
        if(result.result.data.length > 0){
          // 获取该地址的_id
          let _id = result.result.data[0]._id;
          //根据_id修改相应地址的信息
          this.updateAddress(_id);
        }else{
          //否则,保存地址
          this.saveAddress()
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

  //修改地址信息
  updateAddress(_id){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【update_address_by_id】
    wx.cloud.callFunction({
      //云函数名称
      name: 'update_address_by_id',
      data: {
        _id,
        //更新的数据
        updateData: {isDefault: false} 
      },
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        console.log('update_address_by_id.result ==> ', result);

        //如果修改成功,保存新地址
        if(result.result.stats.updated == 1){
          // 保存新地址
          this.saveAddress()
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

  //保存地址信息
  saveAddress(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【add_address】
    wx.cloud.callFunction({
      //云函数名称
      name: 'add_address',
      data: this.data.addressInfo,
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('result ==> ', result);

        if (result.result._id){
          wx.showToast({
            title: '保存地址成功',
            icon: 'none',
            duration: 2000,
            //防止点击穿透
            mask: true
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '../address/address',
            })
          },1000)
          
        }else{
          wx.showToast({
            title: '保存地址失败',
            icon: 'none',
            duration: 2000,
            //防止点击穿透
            mask: true
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

  //保存新建地址信息
  addAddress(){
    
    //如果地址表单验证不通过，则拦截
    if(this.checkAddressInfo() == false){
      // console.log("拦截")
      return;
    }
    //如果是设置默认地址，先查询数据库是否存在默认地址，如果存在，则先将数据库的默认地址修改为非默认地址
    if (this.data.addressInfo.isDefault) {
      //查询默认地址
      this.getDefaultAddress();
    } else {
      //新增地址
      this.saveAddress();
    }
    
  },

  //保存编辑地址信息
  saveEditAddress(){

    //判断用户是否编辑过地址
    let editAddressData = {};
    for (let key in this.data.addressInfo) {
      if (key == 'area') {
        //把地址格式改为字符串(本来是数组)方便比较是否等值
        let area = this.data.addressInfo[key].join('');
        let copyArea = this.data.copyAddressInfo[key].join('');

        if (area != copyArea) {
          editAddressData[key] = this.data.addressInfo[key];
        }
        continue;
      }

      if (this.data.addressInfo[key] != this.data.copyAddressInfo[key]) {
        editAddressData[key] = this.data.addressInfo[key];
      }
    }

    //如果没有编辑过地址
    //判断editAddressData是否为空对象
    if (JSON.stringify(editAddressData) == '{}') {
      //直接返回上一级
      return wx.navigateBack();
    } 

    //判断地址表单是否填写正确
    if (this.checkAddressInfo() == false) {
      return;
    }else{
      //发起编辑地址请求
      this.editAddress(editAddressData);
    }

  },

  // 编辑地址时，根据地址_id查询地址信息
  findAddressBy_id(_id){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数get_address_by_key】
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_address_by_key',

      data: {
        key: '_id',
        value: _id
      },
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('调用云函数成功');
        // console.log('findAddressBy_id result ==> ', result);
        let data = result.result.data[0];
        let addressInfo = this.data.addressInfo;
        for (let key in addressInfo) {
          addressInfo[key] = data[key];
          //保存地址副本
          this.data.copyAddressInfo[key] = data[key];
        }

        this.setData({
          loading: false,
          addressInfo 
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

  //删除地址
  deleteAddress(){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【remove_address】
    wx.cloud.callFunction({
      //云函数名称
      name: 'remove_address',

      data: {
        _id: this.data._id
      },
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('调用云函数成功');
        // console.log('result ==> ', result);

        if(result.result.stats.removed == 1){
          wx.showToast({
            title: '删除地址成功',
            duration: 1000,
            mask: true,
            icon: 'none'
          })
          setTimeout(()=>{
            wx.redirectTo({
              url: '../address/address'
            })
          },1000)
        }else{
          wx.showToast({
            title: '删除地址失败',
            duration: 2000,
            mask: true,
            icon: 'none'
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

  //发起编辑地址请求
  editAddress(data){
    //启动加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //调用云函数【edit_address】
    wx.cloud.callFunction({
      //云函数名称
      name: 'edit_address',

      data: {
        _id: this.data._id,

        //编辑地址数据
        data
      },
      //成功执行
      success: result => {
        //关闭加载提示
        wx.hideLoading();
        // console.log('editAddress result ==> ', result);

        if (result.result.stats.updated == 1) {
          wx.redirectTo({
            url: '../address/address'
          })
        } else {
          wx.showToast({
            title: '修改地址失败',
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
  }


})