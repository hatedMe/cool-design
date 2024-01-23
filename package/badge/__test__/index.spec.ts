import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Badge from "..";

describe("test `Badge` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Badge);
        expect(wrapper.exists()).toBeTruthy();
    });
});
