import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";
import Icon from "../index";

test("使用字体实际定义的类名，更新 type 后替换图标", async () => {
  const wrapper = mount(Icon, { props: { type: "icon-close" } });
  expect(wrapper.classes()).toContain("iconfont");
  expect(wrapper.classes()).toContain("icon-close");
  await wrapper.setProps({ type: "icon-search" });
  expect(wrapper.classes()).toContain("icon-search");
  expect(wrapper.classes()).not.toContain("icon-close");
});

test("支持可访问名称与显式图标尺寸", async () => {
  const w = mount(Icon, { props: { label: "搜索", size: 24, color: "red" } });
  expect(w.attributes("role")).toBe("img");
  expect(w.attributes("aria-label")).toBe("搜索");
  expect(w.attributes("style")).toContain("24px");
  await w.setProps({ label: "" });
  expect(w.attributes("aria-hidden")).toBe("true");
  w.unmount();
});

test("自定义 SVG 优先，不同时叠加字体字形", () => {
  const w = mount(Icon, {
    props: { type: "icon-search" },
    slots: { default: '<svg viewBox="0 0 24 24" fill="none"><path d="M1 1h2" /></svg>' }
  });
  expect(w.find("svg").exists()).toBe(true);
  expect(w.classes()).not.toContain("iconfont");
  expect(w.classes()).not.toContain("icon-search");
  w.unmount();
});
