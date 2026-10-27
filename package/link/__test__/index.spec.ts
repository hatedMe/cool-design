import { mount } from "@vue/test-utils";
import { h } from "vue";
import { expect, test } from "vitest";
import Link from "..";
import ConfigProvider from "../../config-provider";
test("禁用时移除导航并阻止点击，恢复后保留原生链接和安全新窗口属性", async () => {
  const w = mount(Link, {
    props: { href: "/users", target: "_blank", disabled: true },
    attrs: { rel: "nofollow" },
    slots: { default: "用户列表" }
  });
  expect(w.attributes("href")).toBeUndefined();
  expect(w.attributes("tabindex")).toBe("-1");
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  w.element.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(w.emitted("click")).toBeUndefined();
  await w.setProps({ disabled: false });
  expect(w.attributes("href")).toBe("/users");
  expect(w.attributes("rel")?.split(" ")).toEqual(expect.arrayContaining(["nofollow", "noopener", "noreferrer"]));
  await w.trigger("click");
  expect(w.emitted("click")).toHaveLength(1);
  w.unmount();
});
test("无href的操作可用键盘激活并继承尺寸，支持图标和下划线布尔兼容", async () => {
  const w = mount(ConfigProvider, {
    props: { size: "large" },
    slots: { default: () => h(Link, { icon: "icon-search", underline: false }, () => "查询") }
  });
  const a = w.get("a");
  expect(a.attributes("role")).toBe("button");
  expect(a.classes()).toContain("i-link--large");
  expect(a.classes()).toContain("i-link--underline-never");
  expect(w.find(".icon-search").exists()).toBe(true);
  await a.trigger("keydown", { key: "Enter" });
  expect(w.findComponent(Link).emitted("click")).toHaveLength(1);
  w.unmount();
});

test("保留显式 tabindex，禁用状态优先禁止聚焦", async () => {
  const w = mount(Link, { attrs: { tabindex: -1 } });
  expect(w.attributes("tabindex")).toBe("-1");
  await w.setProps({ disabled: true });
  expect(w.attributes("tabindex")).toBe("-1");
  w.unmount();
});
test("调用方取消键盘默认行为后不再激活点击", async () => {
  let calls = 0;
  const w = mount(Link, {
    attrs: {
      onKeydown: (event: KeyboardEvent) => {
        calls++;
        event.preventDefault();
      }
    }
  });
  await w.trigger("keydown", { key: "Enter" });
  expect(calls).toBe(1);
  expect(w.emitted("click")).toBeUndefined();
  w.unmount();
});
