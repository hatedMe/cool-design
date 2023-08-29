import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Radio from "..";

describe("test `Radio` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Radio);
        expect(wrapper.exists()).toBeTruthy();
    });
});
