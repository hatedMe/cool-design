
console.log(process.env.NODE_ENV);
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
    }
};
