import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Row from "..";

describe("test `Row` component", () => {
    test("renders a component", async () => {
        const wrapper = mount(Row);
        expect(wrapper.exists()).toBeTruthy();
    });
});
