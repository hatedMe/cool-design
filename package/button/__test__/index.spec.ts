import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Button from "..";

describe("test `Button` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Button);
        expect(wrapper.exists()).toBeTruthy();
    });
});
