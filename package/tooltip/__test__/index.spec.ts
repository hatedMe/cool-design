import { mount, flushPromises } from "@vue/test-utils";
import { h } from "vue";
import { afterEach, expect, test, vi } from "vitest";
import Tooltip from "..";
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers.length = 0;
    vi.restoreAllMocks();
    document.body.innerHTML = "";
});
test("聚焦显示纯文本说明，Esc 隐藏并解除关联，禁用不显示", async () => {
    const w = mount(Tooltip, {
        props: { content: "<b>说明</b>" },
        slots: { default: () => h("button", "帮助") },
        attachTo: document.body
    });
    wrappers.push(w);
    await w.get("button").trigger("focusin");
    await flushPromises();
    const tip = document.querySelector('[role="tooltip"]')!;
    expect(tip.textContent).toBe("<b>说明</b>");
    expect(tip.querySelector("b")).toBeNull();
    expect(w.get("button").attributes("aria-describedby")).toBe(tip.id);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await flushPromises();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(w.get("button").attributes("aria-describedby")).toBeUndefined();
    await w.setProps({ disabled: true });
    await w.get("button").trigger("focusin");
    await flushPromises();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
test("视口顶部放不下时翻转，滚动更新坐标，卸载移除监听和 DOM", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        return this.classList.contains("i-tooltip__trigger")
            ? { x: 100, y: 2, left: 100, top: 2, right: 160, bottom: 22, width: 60, height: 20, toJSON() {} }
            : { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40, toJSON() {} };
    });
    const remove = vi.spyOn(window, "removeEventListener");
    const w = mount(Tooltip, {
        props: { content: "说明", placement: "top" },
        slots: { default: () => h("button", "帮助") },
        attachTo: document.body
    });
    wrappers.push(w);
    await w.get("button").trigger("focusin");
    await flushPromises();
    const tip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tip.dataset.placement).toBe("bottom");
    expect(tip.style.top).toBe("30px");
    window.dispatchEvent(new Event("scroll"));
    await flushPromises();
    expect(tip.style.left).toBe("80px");
    w.unmount();
    wrappers.pop();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(remove.mock.calls.some((call) => call[0] === "scroll")).toBe(true);
});
