return new Promise((resolve) => {
  try {
    // 创建一个全局回调函数
    const callbackName = 'weiboJsonpCallback_' + Math.floor(Math.random() * 1000000);
    window[callbackName] = function(data) {
      // 清理全局回调
      setTimeout(() => { delete window[callbackName]; }, 100);
      
      let result = '微博用户信息:\n';
      if (data && data.userinfo) {
        result += '登录状态: 已登录\n';
        if (data.userinfo.screen_name) result += '昵称: ' + data.userinfo.screen_name + '\n';
        if (data.userinfo.id) result += 'ID: ' + data.userinfo.id + '\n';
        if (data.userinfo.profile_image_url) result += '头像: ' + data.userinfo.profile_image_url + '\n';
      } else {
        result += '登录状态: 未登录\n';
      }
      
      resolve(result);
    };
    
    // 创建JSONP请求
    const script = document.createElement('script');
    script.src = `https://weibo.com/aj/static/connect.php?callback=${callbackName}`;
    document.body.appendChild(script);
    
    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        resolve('获取微博用户信息超时');
      }
    }, 5000);
  } catch (e) {
    resolve('获取微博用户信息失败: ' + e.message);
  }
});