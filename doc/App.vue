<template>
    <div id="app">
        <doc>
            <router-view />
        </doc>
    </div>
</template>

<script>
import doc from "./components";
import "highlight.js/styles/github-dark.css";
export default {
    components: {
        doc
    }
};
</script>

