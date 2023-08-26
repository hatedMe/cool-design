import { nextTick } from "vue";
import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Avatar from "../index";
const { name } = Avatar

describe("test `Avatar` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Avatar);
        expect(wrapper.find('.i-avatar').exists()).toBe(true);
    });

    test("test props `size` is number type", async () => {
        const wrapper = mount(Avatar, {
            props: {
                size: 50,
            },
        });
        await nextTick();
        expect(wrapper.attributes("style")).toContain("width: 50px; height: 50px;");
    });

    test("test props `size` is string type", async () => {
        const sizes = ["large", "medium", "small"] as const;
        for (const size of sizes) {
            const wrapper = mount(Avatar, {
                props: {
                    size : size,
                },
            });
            await nextTick();
            expect(wrapper.classes()).toContain(name + "--" + size);
        }
    });
});
