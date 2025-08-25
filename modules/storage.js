try { 
  let result = '浏览器存储信息:\n\n'; 
  
  result += 'LocalStorage (' + localStorage.length + ' 项):\n'; 
  if (localStorage.length > 0) { 
    for (let i = 0; i < localStorage.length; i++) { 
      const key = localStorage.key(i); 
      const value = localStorage.getItem(key); 
      result += '  ' + key + ': ' + (value.length > 50 ? value.substring(0, 50) + '...' : value) + '\n'; 
    } 
  } else { 
    result += '  (空)\n'; 
  } 
  
  result += '\nSessionStorage (' + sessionStorage.length + ' 项):\n'; 
  if (sessionStorage.length > 0) { 
    for (let i = 0; i < sessionStorage.length; i++) { 
      const key = sessionStorage.key(i); 
      const value = sessionStorage.getItem(key); 
      result += '  ' + key + ': ' + (value.length > 50 ? value.substring(0, 50) + '...' : value) + '\n'; 
    } 
  } else { 
    result += '  (空)\n'; 
  } 
  
  return result; 
} catch (error) { 
  return '存储信息获取失败: ' + error.message; 
}