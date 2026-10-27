import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { afterEach, expect, test, vi } from "vitest";
import MessageBox, { useMessageBox } from "..";
import ConfigProvider from "../../config-provider";
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  document.body.innerHTML = "";
});
test("异步确认失败保留窗口和错误，处理中禁止重复确认与关闭，重试成功", async () => {
  let reject!: (reason: Error) => void;
  const beforeConfirm = vi
    .fn()
    .mockImplementationOnce(() => new Promise((_, fail) => (reject = fail)))
    .mockResolvedValueOnce(true);
  const w = mount(MessageBox, {
    props: { modelValue: true, title: "删除用户", message: "<b>不可恢复</b>", beforeConfirm },
    attachTo: document.body
  });
  wrappers.push(w);
  await flushPromises();
  expect(w.text()).toContain("<b>不可恢复</b>");
  expect(w.find("b").exists()).toBe(false);
  await w.get("[data-message-box-confirm]").trigger("click");
  await w.get("[data-message-box-confirm]").trigger("click");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await flushPromises();
  expect(beforeConfirm).toHaveBeenCalledTimes(1);
  expect(w.emitted("cancel")).toBeUndefined();
  reject(new Error("删除失败，请重试"));
  await flushPromises();
  expect(w.get('[role="alert"]').text()).toBe("删除失败，请重试");
  expect(w.emitted("confirm")).toBeUndefined();
  await w.get("[data-message-box-confirm]").trigger("click");
  await flushPromises();
  expect(w.emitted("confirm")).toHaveLength(1);
  expect(w.emitted("update:modelValue")).toEqual([[false]]);
});
test("函数确认与取消都返回明确结果并独立卸载", async () => {
  const first = MessageBox.confirm("确认删除？", "删除确认");
  await flushPromises();
  document.querySelector<HTMLButtonElement>("[data-message-box-confirm]")!.click();
  await expect(first).resolves.toBe("confirm");
  expect(document.querySelector(".i-message-box")).toBeNull();
  const second = MessageBox.confirm("确认删除？");
  await flushPromises();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await expect(second).resolves.toBe("cancel");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.body.style.overflow).toBe("");
});
test("组合式调用继承响应式主题，调用者卸载取消并清理弹窗", async () => {
  let result: Promise<"confirm" | "cancel"> | undefined;
  const dark = ref(true);
  const Child = defineComponent({
    setup() {
      const box = useMessageBox();
      return () => h("button", { onClick: () => (result = box.confirm("确认操作？")) }, "打开");
    }
  });
  const w = mount(
    defineComponent({
      setup: () => () => h(ConfigProvider, { theme: dark.value ? "dark" : "light" }, () => h(Child))
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  await w.get("button").trigger("click");
  await flushPromises();
  const provider = document.querySelector(".i-message-box")!.closest(".i-config-provider")!;
  expect(provider.getAttribute("data-theme")).toBe("dark");
  dark.value = false;
  await flushPromises();
  expect(provider.getAttribute("data-theme")).toBe("light");
  w.unmount();
  wrappers.pop();
  await expect(result).resolves.toBe("cancel");
  expect(document.querySelector(".i-message-box")).toBeNull();
});

test("支持消息类型样式", async () => {
  const w = mount(MessageBox, {
    props: { modelValue: true, type: "error", message: "失败" },
    attachTo: document.body
  });
  await flushPromises();
  expect(document.querySelector(".i-message-box--error")).not.toBeNull();
  w.unmount();
});
