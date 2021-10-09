const path = require("path");
module.exports = {
    pages: {
        index: {
            entry: "doc/main.js",
            template: "public/index.html",
            filename: "index.html"
        }
    },
    productionSourceMap: process.env.NODE_ENV !== "production",
    css: {
        extract: false
    },
    chainWebpack: config => {
        // config.module
        //     .rule("js")
        //     .include
        //     .add("/package/")
        //     .end()
        //     .use("babel")
        //     .loader("babel-loader")
        //     .end()
        //     .use('vue-loader')
        //     .loader('vue-loader')
        //     .tap(options => {
        //         return options;
        //     });

    },
    configureWebpack: config => {
        config.module.rules.push({
            test: /\.md$/,
            use: ["vue-loader", path.resolve(__dirname, "./doc/loader/md-loader/index.js")]
        });
    }
};
