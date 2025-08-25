return new Promise((resolve) => {
  try {
    // 创建一个全局回调函数
    const callbackName = 'taobaoJsonpCallback_' + Math.floor(Math.random() * 1000000);
    window[callbackName] = function(data) {
      // 清理全局回调
      setTimeout(() => { delete window[callbackName]; }, 100);
      
      let result = '淘宝/阿里用户信息:\n';
      if (data && data.data && data.data.login) {
        result += '登录状态: 已登录\n';
        if (data.data.nick) result += '昵称: ' + data.data.nick + '\n';
        if (data.data.userId) result += '用户ID: ' + data.data.userId + '\n';
        if (data.data.avatar) result += '头像: ' + data.data.avatar + '\n';
      } else {
        result += '登录状态: 未登录\n';
      }
      
      resolve(result);
    };
    
    // 创建JSONP请求
    const script = document.createElement('script');
    script.src = `https://acs.m.taobao.com/h5/mtop.user.getusersimple/1.0/?callback=${callbackName}`;
    document.body.appendChild(script);
    
    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        resolve('获取淘宝/阿里用户信息超时');
      }
    }, 5000);
  } catch (e) {
    resolve('获取淘宝/阿里用户信息失败: ' + e.message);
  }
});