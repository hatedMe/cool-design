import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Version from "../views/version.vue";
import Components from "../views/components.vue";
// const requireComponent = require.context("../../package/", true, /\.md$/);
// console.log("requireComponent.keys():", requireComponent.keys());

import Button from "../../package/button/README.md";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: "/version",
        component: Version
    },
    {
        path: "/components",
        component: Components,
        children: [
            {
                path: "button",
                component: Button,
            }
        ]
    },
];

const router = new VueRouter({
    mode: "hash",
    base: process.env.BASE_URL,
    routes
});

export default router;
