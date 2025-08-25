return new Promise((resolve) => {
  try {
    // 创建一个全局回调函数
    const callbackName = 'baiduJsonpCallback_' + Math.floor(Math.random() * 1000000);
    window[callbackName] = function(data) {
      // 清理全局回调
      setTimeout(() => { delete window[callbackName]; }, 100);
      
      let result = '百度用户信息:\n';
      if (data && data.data) {
        if (data.data.isLogin === '1') {
          result += '登录状态: 已登录\n';
          if (data.data.username) result += '用户名: ' + data.data.username + '\n';
          if (data.data.portraitUrl) result += '头像: ' + data.data.portraitUrl + '\n';
          if (data.data.displayName) result += '显示名称: ' + data.data.displayName + '\n';
        } else {
          result += '登录状态: 未登录\n';
        }
      } else {
        result += '未获取到用户信息\n';
      }
      
      resolve(result);
    };
    
    // 创建JSONP请求
    const script = document.createElement('script');
    script.src = `https://passport.baidu.com/v2/api/?getinfo&callback=${callbackName}`;
    document.body.appendChild(script);
    
    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        resolve('获取百度用户信息超时');
      }
    }, 5000);
  } catch (e) {
    resolve('获取百度用户信息失败: ' + e.message);
  }
});