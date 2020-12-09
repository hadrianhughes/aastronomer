const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './index',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'static' }
      ]
    })
  ]
}
