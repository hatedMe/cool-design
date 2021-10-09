const parser = require("./parser");
module.exports = function (source) {
    let content = parser.render(source);
    return `
<template>
    <section>
    ${content}
    </section>
</template>
`;
};
