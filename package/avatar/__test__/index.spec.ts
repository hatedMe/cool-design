import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

import Avatar from "../index";
const { name } = Avatar;

describe("test `Avatar` component", () => {
  test("renders a component", async () => {
    const wrapper = mount(Avatar);
    expect(wrapper.find(".i-avatar").exists()).toBe(true);
  });

  test("test props `size` is number type", async () => {
    const wrapper = mount(Avatar, {
      props: {
        size: 50
      }
    });
    await nextTick();
    expect(wrapper.attributes("style")).toContain("width: 50px; height: 50px;");
  });

  test("test props `size` is string type", async () => {
    const sizes = ["large", "medium", "small"] as const;
    for (const size of sizes) {
      const wrapper = mount(Avatar, {
        props: {
          size: size
        }
      });
      await nextTick();
      expect(wrapper.classes()).toContain(name + "--" + size);
    }
  });

  test("动态属性更新尺寸、图片、形状和图片适配", async () => {
    const wrapper = mount(Avatar, { props: { size: 40, url: "first.png", fit: "cover" } });
    await wrapper.setProps({ size: 64, url: "second.png", shape: "circle", fit: "contain" });
    expect(wrapper.attributes("style")).toContain("width: 64px");
    expect(wrapper.classes()).toContain("i-avatar--circle");
    expect(wrapper.get("img").attributes("src")).toBe("second.png");
    expect(wrapper.get("img").classes()).toContain("i-avatar__img--contain");
  });
  test("图片失败后显示回退内容并触发 error", async () => {
    const wrapper = mount(Avatar, {
      props: { url: "broken.png", alt: "用户头像" },
      slots: { fallback: "回退" }
    });
    expect(wrapper.get("img").attributes("alt")).toBe("用户头像");
    await wrapper.get("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("回退");
    expect(wrapper.emitted("error")).toHaveLength(1);
  });
});
