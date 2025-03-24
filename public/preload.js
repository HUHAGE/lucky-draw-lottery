const { ipcRenderer } = require('electron')

// 将原有的 IndexedDB 存储改为 uTools 数据库存储
window.exports = {
  // 保存数据
  saveData: async (key, value) => {
    return utools.dbStorage.setItem(key, value)
  },

  // 获取数据  
  getData: async (key) => {
    return utools.dbStorage.getItem(key)
  },

  // 删除数据
  removeData: async (key) => {
    return utools.dbStorage.removeItem(key)
  },

  // 清空数据
  clearData: async () => {
    return utools.dbStorage.clear()
  }
}

// 监听主进程消息
ipcRenderer.on('toggle-audio', (event, playing) => {
  const audio = document.querySelector('#audiobg')
  if(playing) {
    audio.play()
  } else {
    audio.pause() 
  }
}) 