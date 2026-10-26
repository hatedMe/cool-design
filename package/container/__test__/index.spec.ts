import { mount } from "@vue/test-utils";
import { Fragment, h, ref, nextTick } from "vue";
import { expect, test } from "vitest";
import Container from "..";
import Header from "../../header";
import Footer from "../../footer";
import Aside from "../../aside";
import Main from "../../main";
test("自动方向识别 Fragment 内的页头页脚，动态变化后重新判断，显式方向优先", async () => {
    const show = ref(true);
    const w = mount({
        setup: () => () =>
            h(Container, {}, () =>
                h(Fragment, {}, [
                    show.value ? h(Header, {}, () => "页头") : h(Aside, {}, () => "侧栏"),
                    h(Main, {}, () => "正文")
                ])
            )
    });
    expect(w.get(".i-container").classes()).toContain("i-container--vertical");
    show.value = false;
    await nextTick();
    expect(w.get(".i-container").classes()).toContain("i-container--horizontal");
    w.unmount();
    const explicit = mount(Container, { props: { direction: "horizontal" }, slots: { default: () => h(Footer) } });
    expect(explicit.classes()).toContain("i-container--horizontal");
    explicit.unmount();
});
test("各区域使用语义标签并响应自定义尺寸", async () => {
    const a = mount(Aside, { props: { width: 220 } });
    expect(a.element.tagName).toBe("ASIDE");
    expect((a.element as HTMLElement).style.width).toBe("220px");
    await a.setProps({ width: "20%" });
    expect((a.element as HTMLElement).style.width).toBe("20%");
    a.unmount();
    for (const Component of [Header, Footer]) {
        const w = mount(Component, { props: { height: 48 } });
        expect((w.element as HTMLElement).style.height).toBe("48px");
        await w.setProps({ height: "4rem" });
        expect((w.element as HTMLElement).style.height).toBe("4rem");
        w.unmount();
    }
    const main = mount(Main);
    expect(main.element.tagName).toBe("MAIN");
    main.unmount();
});

test("忽略 Fragment 中的空节点和文本，仍识别页头", () => {
    const w = mount(Container, {
        slots: { default: () => h(Fragment, null, [null, false, "正文", h(Header), h(Main)]) }
    });
    expect(w.classes()).toContain("i-container--vertical");
    w.unmount();
});
