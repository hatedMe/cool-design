import { mount } from "@vue/test-utils";
import { expect, test, vi } from "vitest";
import Message from "..";

test("支持完整消息类型和隐藏关闭按钮", () => {
  const w = mount(Message, { props: { type: "warning", message: "注意", showClose: false, duration: 0 } });
  expect(w.classes()).toContain("i-message--warning");
  expect(w.find("button").exists()).toBe(false);
  vi.restoreAllMocks();
});
