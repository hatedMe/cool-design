import { mount } from "@vue/test-utils";
import { h, reactive, nextTick } from "vue";
import { expect, test } from "vitest";
import Col from "..";
import Row from "../../row";
test("栅格以可覆盖的类表达基本与断点宽度，零宽度和位移可响应更新", async () => {
    const w = mount(Col, {
        props: { span: 12, push: 2, pull: 1, xs: 0, sm: { span: 8, offset: 2 }, md: { span: 6, push: 0 } }
    });
    expect(w.classes()).toEqual(
        expect.arrayContaining([
            "i-col-12",
            "i-col-push-2",
            "i-col-pull-1",
            "i-col-xs-0",
            "i-col-sm-8",
            "i-col-sm-offset-2",
            "i-col-md-6",
            "i-col-md-push-0"
        ])
    );
    expect((w.element as HTMLElement).style.flex).toBe("");
    await w.setProps({ span: 0, sm: 12 });
    expect(w.classes()).toContain("i-col-0");
    expect(w.classes()).toContain("i-col-sm-12");
    expect(w.classes()).not.toContain("i-col-sm-offset-2");
    w.unmount();
});
test("嵌套 Row 各自提供动态 gutter，不相互覆盖", async () => {
    const state = reactive({ outer: 24, inner: 8 });
    const w = mount({
        setup: () => () =>
            h(Row, { gutter: state.outer }, () =>
                h(Col, { span: 12 }, () => h(Row, { gutter: state.inner }, () => h(Col)))
            )
    });
    const cols = w.findAll(".i-col");
    expect((cols[0].element as HTMLElement).style.paddingLeft).toBe("12px");
    expect((cols[1].element as HTMLElement).style.paddingLeft).toBe("4px");
    state.inner = 16;
    await nextTick();
    expect((cols[0].element as HTMLElement).style.paddingLeft).toBe("12px");
    expect((cols[1].element as HTMLElement).style.paddingLeft).toBe("8px");
    w.unmount();
});
