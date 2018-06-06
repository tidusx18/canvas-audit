const path = require('path');

module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'CanvasAuditBuild.user.js',
        path: path.resolve(__dirname, 'dist')
    }
};