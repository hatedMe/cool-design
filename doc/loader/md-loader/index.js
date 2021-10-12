const parser = require("./parser");
module.exports = function (source) {
    const content = parser.render(source);
    return `
<template>
    <section class="markdown-body">
    ${content}
    </section>
</template>
`;
};
