module.exports = {
    root: true,
    env: {
        node: true
    },
    globals: {
        wx: true,
        uni: true,
        mpvue: true,
        AMap: true
    },
    extends: [
        "plugin:vue/essential",
        "@vue/standard"
    ],
    parserOptions: {
        parser: "babel-eslint"
    },
    rules: {
        "no-console": "off",
        "no-debugger": "off",
        semi: [2, "always"], // 自动补充分号
        quotes: [2, "double"],
        indent: ["error", 4],
        "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        "vue/html-indent": ["error", 4, {
            attribute: 1,
            baseIndent: 1,
            closeBracket: 0,
            alignAttributesVertically: true,
            ignores: []
        }],
        camelcase: 0, // 非驼峰
        "vue/no-parsing-error": [2, {
            "x-invalid-end-tag": false
        }],
        "no-irregular-whitespace": ["error", { skipComments: true }],
        "no-tabs": 0
    }
};
