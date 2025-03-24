const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// 创建插件包目录
const pluginDir = path.resolve(__dirname, '../dist')
const outputPath = path.resolve(__dirname, '../release')

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath)
}

// 创建一个文件来写入
const output = fs.createWriteStream(path.join(outputPath, 'lucky-draw.upx'))
const archive = archiver('zip', {
  zlib: { level: 9 }
})

output.on('close', () => {
  console.log('Plugin package has been created!')
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)

// 添加构建后的文件到压缩包
archive.directory(pluginDir, false)

archive.finalize() 