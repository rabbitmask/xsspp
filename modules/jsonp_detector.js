return new Promise((resolve) => {
  try {
    // 要探测的服务列表
    const services = [
      {
        name: '百度',
        url: 'https://passport.baidu.com/v2/api/?getinfo&callback=callback',
        check: (data) => data && data.data && data.data.isLogin === '1'
      },
      {
        name: 'QQ',
        url: 'https://qfwd.qq.com/?g_tk=&ptlang=2052&callback=callback',
        check: (data) => data && data.result === 0
      },
      {
        name: '微博',
        url: 'https://weibo.com/aj/static/connect.php?callback=callback',
        check: (data) => data && data.userinfo
      },
      {
        name: '淘宝',
        url: 'https://acs.m.taobao.com/h5/mtop.user.getusersimple/1.0/?callback=callback',
        check: (data) => data && data.data && data.data.login
      },
      {
        name: '京东',
        url: 'https://passport.jd.com/user/petName/getUserInfoForMiniJd.action?callback=callback',
        check: (data) => data && data.nick
      }
    ];
    
    let results = [];
    let completed = 0;
    
    // 对每个服务进行探测
    services.forEach(service => {
      // 创建一个全局回调函数
      const callbackName = 'jsonpDetector_' + service.name + '_' + Math.floor(Math.random() * 1000000);
      window[callbackName] = function(data) {
        // 清理全局回调
        setTimeout(() => { delete window[callbackName]; }, 100);
        
        try {
          if (service.check(data)) {
            results.push(`${service.name}: 已登录`);
          } else {
            results.push(`${service.name}: 未登录`);
          }
        } catch (e) {
          results.push(`${service.name}: 检测失败`);
        }
        
        completed++;
        checkCompleted();
      };
      
      // 创建JSONP请求
      const script = document.createElement('script');
      script.src = service.url.replace('callback=callback', `callback=${callbackName}`);
      document.body.appendChild(script);
      
      // 设置单个服务的超时
      setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          results.push(`${service.name}: 检测超时`);
          completed++;
          checkCompleted();
        }
      }, 3000);
    });
    
    // 检查是否所有服务都已完成
    function checkCompleted() {
      if (completed === services.length) {
        resolve('用户登录状态检测:\n' + results.join('\n'));
      }
    }
    
    // 设置总体超时
    setTimeout(() => {
      if (completed < services.length) {
        resolve('用户登录状态检测 (部分结果):\n' + results.join('\n'));
      }
    }, 8000);
  } catch (e) {
    resolve('JSONP探测失败: ' + e.message);
  }
});