const bundle = require('bundle-js');
bundle({
    entry: './dist/index.js',
    dest: './dist/bundle.js',
    print: false,
    disablebeautify: false
});