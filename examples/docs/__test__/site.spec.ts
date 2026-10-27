import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import App from "../../../doc/App.vue";

const wrappers: ReturnType<typeof mount>[] = [];
async function open(hash = "#/components/button") {
  window.location.hash = hash;
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const wrapper = mount(App, { attachTo: document.body });
  wrappers.push(wrapper);
  await flushPromises();
  return wrapper;
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  window.location.hash = "";
  vi.restoreAllMocks();
});

describe("PC 组件文档站", () => {
  it("开发指南按安装、快速上手、自定义主题、过渡动画排列", async () => {
    const wrapper = await open("#/guide/install");
    const guide = wrapper.findAll(".docs-nav-group").find((group) => group.get("h2").text() === "开发指南")!;
    expect(guide.findAll("a").map((link) => link.text())).toEqual(["安装", "快速上手", "自定义主题", "过渡动画"]);
    expect(wrapper.get("h1").text()).toBe("安装");
  });

  it("过渡动画指南提供可切换演示及源码，不生成组件引入说明", async () => {
    const wrapper = await open("#/guide/transition");
    expect(wrapper.get("h1").text()).toBe("过渡动画");
    expect(wrapper.find("#registration").exists()).toBe(false);
    const toggle = wrapper.get('button[aria-controls="guide-transition-panel"]');
    await toggle.trigger("click");
    expect(wrapper.find("#guide-transition-panel").exists()).toBe(false);
    await toggle.trigger("click");
    expect(wrapper.find("#guide-transition-panel").exists()).toBe(true);
    await wrapper.get(".demo-toolbar button").trigger("click");
    expect(wrapper.get(".demo-source").text()).toContain("prefers-reduced-motion");
  });

  it("直接访问组件地址，展示实际组件、API 和同源演示代码", async () => {
    const wrapper = await open();
    expect(wrapper.get("h1").text()).toBe("Button 按钮");
    expect(wrapper.findAll(".demo-preview .i-button").length).toBeGreaterThan(4);
    expect(wrapper.text()).toContain("nativeType");
    await wrapper.get(".demo-toolbar button").trigger("click");
    expect(wrapper.get(".demo-source").text()).toContain('from "cool-design"');
    expect(wrapper.get(".demo-source .hljs-keyword").text()).toBe("import");
    expect(wrapper.get("#registration .hljs-keyword").text()).toBe("import");
  });

  it("响应 hash 导航与浏览器返回，切换后不保留上页演示状态", async () => {
    const wrapper = await open();
    window.location.hash = "#/components/table";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("Table 表格");
    expect(wrapper.find(".i-table").exists()).toBe(true);
    window.location.hash = "#/components/button";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("Button 按钮");
    expect(wrapper.find(".demo-source").exists()).toBe(false);
  });

  it("搜索中英文组件名，空结果有提示，清空后恢复导航", async () => {
    const wrapper = await open();
    const search = wrapper.get('input[type="search"]');
    await search.setValue("表格");
    expect(wrapper.findAll(".docs-sidebar a").map((link) => link.text())).toEqual(["Table 表格"]);
    await search.setValue("没有这个组件");
    expect(wrapper.get(".docs-sidebar").text()).toContain("未找到组件");
    await search.setValue("");
    expect(wrapper.findAll(".docs-sidebar a").length).toBeGreaterThan(24);
  });

  it("代码可复制，剪贴板不可用时提示手动复制", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const wrapper = await open();
    await wrapper.get('[data-action="copy"]').trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("<Button"));
    expect(wrapper.text()).toContain("已复制");
    writeText.mockRejectedValue(new Error("denied"));
    await wrapper.get('[data-action="copy"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("请展开代码手动复制");
  });

  it("未知地址可返回快速开始，不显示空白页面", async () => {
    const wrapper = await open("#/components/missing");
    expect(wrapper.get("h1").text()).toBe("页面未找到");
    expect(wrapper.find('a[href="#/guide/quickstart"]').exists()).toBe(true);
  });

  it("填完邮箱后立即提交，可在一次操作中完成表单校验", async () => {
    const wrapper = await open("#/components/form");
    await wrapper.get('input[placeholder="请输入用户名称"]').setValue("测试用户");
    const email = wrapper.get('input[placeholder="name@example.com"]');
    await email.setValue("test@example.com");
    const blur = email.trigger("blur");
    const submit = wrapper.get("form").trigger("submit");
    await Promise.all([blur, submit]);
    await flushPromises();
    expect(wrapper.text()).toContain("已保存：测试用户");
  });
});

it("色彩与边框页面只引入样式，不生成不存在的组件导入", async () => {
  for (const name of ["color", "border"]) {
    const wrapper = await open(`#/components/${name}`);
    expect(wrapper.get("#registration").text()).toContain("引入样式");
    expect(wrapper.get("#registration code").text()).toBe('import "cool-design/style.css";');
    expect(wrapper.find(".demo-preview").exists()).toBe(true);
  }
});
