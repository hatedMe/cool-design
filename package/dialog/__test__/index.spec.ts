import { flushPromises, mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { afterEach, expect, test, vi } from "vitest";
import Dialog from "../index";
import Message from "../../message/index";
import ConfigProvider from "../../config-provider";

afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
});

test("弹窗约束焦点、支持 Esc、关闭恢复焦点和滚动", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const w = mount(Dialog, {
        attachTo: document.body,
        props: { modelValue: true, title: "编辑" },
        slots: { default: () => h("input") }
    });
    await flushPromises();
    const input = w.find("input").element;
    const close = w.find("button").element;
    expect(document.body.style.overflow).toBe("hidden");
    expect(w.find('[role="dialog"]').element.contains(document.activeElement)).toBe(true);
    input.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(close);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(w.emitted("update:modelValue")?.[0]).toEqual([false]);
    await w.setProps({ modelValue: false });
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
    w.unmount();
});

test("关闭开关有效，多弹窗保持滚动锁，主题宿主承载浮层", async () => {
    const w = mount(ConfigProvider, {
        attachTo: document.body,
        props: { theme: "dark" },
        slots: {
            default: () =>
                h(Dialog, { modelValue: true, closeOnPressEscape: false, closeOnClickModal: false }, () => "内容")
        }
    });
    await flushPromises();
    expect(document.querySelector('.i-overlay-host [role="dialog"]')).not.toBeNull();
    const dialog = w.findComponent(Dialog);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    document.querySelector(".i-dialog__mask")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(dialog.emitted("update:modelValue")).toBeUndefined();
    const second = mount(Dialog, { props: { modelValue: true }, attachTo: document.body });
    await nextTick();
    w.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    second.unmount();
    expect(document.body.style.overflow).toBe("");
});

test("支持宽度、居中和关闭后销毁内容", async () => {
    const w = mount(Dialog, { props: { modelValue: true, width: 360, center: true, destroyOnClose: true }, slots: { default: () => h("p", "内容") } });
    await nextTick();
    expect(w.get(".i-dialog").classes()).toContain("i-dialog--center");
    expect(w.get(".i-dialog").attributes("style")).toContain("width: 360px");
    await w.setProps({ modelValue: false });
    expect(w.find("p").exists()).toBe(false);
});

test("消息自动关闭，卸载后取消计时器", async () => {
    vi.useFakeTimers();
    const w = mount(Message, { props: { message: "保存成功", duration: 1000 } });
    expect(w.text()).toContain("保存成功");
    vi.advanceTimersByTime(1000);
    expect(w.emitted("close")).toHaveLength(1);
    w.unmount();
    expect(vi.getTimerCount()).toBe(0);
});
