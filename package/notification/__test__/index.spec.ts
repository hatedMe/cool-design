import { mount } from "@vue/test-utils";
import { createApp } from "vue";
import { afterEach, expect, test, vi } from "vitest";
import Notification from "../notification";
import Notify from "../index";

const handles: Array<{ close(): void }> = [];
afterEach(() => {
  handles.forEach((handle) => handle.close());
  handles.length = 0;
});

test("通知渲染标题和纯文本内容，关闭按钮发出事件", async () => {
  const wrapper = mount(Notification, { props: { title: "保存结果", message: "<b>已保存</b>" } });
  expect(wrapper.classes()).toContain("i-notification");
  expect(wrapper.text()).toContain("保存结果");
  expect(wrapper.text()).toContain("<b>已保存</b>");
  expect(wrapper.find("b").exists()).toBe(false);
  await wrapper.get("button").trigger("click");
  expect(wrapper.emitted("close")).toHaveLength(1);
  wrapper.unmount();
});

test("函数式通知能单独关闭并卸载，不删除其他实例，回调只触发一次", () => {
  const onClose = vi.fn();
  const first = Notify({ title: "第一条", message: "内容一", onClose });
  handles.push(first);
  const second = Notify({ title: "第二条", message: "内容二" });
  handles.push(second);
  expect(document.querySelectorAll(".i-notification")).toHaveLength(2);
  first.close();
  first.close();
  expect(document.body.textContent).not.toContain("第一条");
  expect(document.body.textContent).toContain("第二条");
  expect(onClose).toHaveBeenCalledTimes(1);
  second.close();
  expect(document.querySelectorAll(".i-notification")).toHaveLength(0);
});

test("通知插件可以通过 app.use 注册", () => {
  const app = createApp({});
  app.use(Notify);
  expect(app.config.globalProperties.$notify).toBe(Notify);
});
