// 使用 uTools 数据库替代 IndexedDB
export const database = {
  get: async (key) => {
    return window.exports.getData(key)
  },
  
  set: async (key, value) => {
    return window.exports.saveData(key, value) 
  },

  remove: async (key) => {
    return window.exports.removeData(key)
  },

  clear: async () => {
    return window.exports.clearData()
  }
}

export const DB_STORE_NAME = 'luckydraw'
