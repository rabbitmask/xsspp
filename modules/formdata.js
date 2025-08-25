try { 
  const forms = document.querySelectorAll('form'); 
  if (forms.length === 0) return '页面中没有找到表单'; 
  
  let result = '表单数据 (' + forms.length + ' 个表单):\n\n'; 
  forms.forEach((form, index) => { 
    result += '表单 ' + (index + 1) + ':\n'; 
    result += '  Action: ' + (form.action || '(未设置)') + '\n'; 
    result += '  Method: ' + (form.method || 'GET') + '\n'; 
    
    const inputs = form.querySelectorAll('input, textarea, select'); 
    result += '  字段数量: ' + inputs.length + '\n'; 
    
    inputs.forEach(input => { 
      const name = input.name || input.id || '(无名称)'; 
      const type = input.type || input.tagName.toLowerCase(); 
      const value = input.value || '(空)'; 
      result += '    ' + name + ' [' + type + ']: ' + value + '\n'; 
    }); 
    
    result += '\n'; 
  }); 
  
  return result; 
} catch (error) { 
  return '表单数据获取失败: ' + error.message; 
}