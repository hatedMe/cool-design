import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { afterEach, expect, test } from "vitest";
import Popconfirm from "..";
import Dialog from "../../dialog";
import ConfigProvider from "../../config-provider";
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers.length = 0;
  document.body.innerHTML = "";
});
test("确认只触发一次，外部点击视为取消并支持受控关闭", async () => {
  const w = mount(Popconfirm, {
    props: { title: "删除用户？" },
    slots: { default: () => h("button", "删除") },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get("button").trigger("click");
  await flushPromises();
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain("删除用户？");
  const confirm = document.querySelector<HTMLButtonElement>("[data-popconfirm-confirm]")!;
  confirm.click();
  confirm.click();
  await flushPromises();
  expect(w.emitted("confirm")).toHaveLength(1);
  expect(document.querySelector(".i-popconfirm")).toBeNull();
  await w.get("button").trigger("click");
  await flushPromises();
  document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  await flushPromises();
  expect(w.emitted("cancel")).toHaveLength(1);
  expect(document.querySelector(".i-popconfirm")).toBeNull();
  await w.setProps({ modelValue: true });
  await flushPromises();
  expect(document.querySelector(".i-popconfirm")).not.toBeNull();
  await w.setProps({ modelValue: false });
  await flushPromises();
  expect(document.querySelector(".i-popconfirm")).toBeNull();
});
test("弹窗内气泡确认的 Esc 仅关最上层，焦点恢复且继承主题宿主", async () => {
  const open = ref(true);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(ConfigProvider, { theme: "dark" }, () =>
          h(Dialog, { modelValue: open.value, "onUpdate:modelValue": (v: boolean) => (open.value = v) }, () =>
            h(Popconfirm, { title: "确认删除？" }, () => h("button", { id: "delete-trigger" }, "删除"))
          )
        )
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  await flushPromises();
  const trigger = document.querySelector<HTMLButtonElement>("#delete-trigger")!;
  trigger.focus();
  trigger.click();
  await flushPromises();
  expect(document.querySelector(".i-overlay-host .i-popconfirm")).not.toBeNull();
  expect(document.activeElement?.textContent).toBe("取消");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await flushPromises();
  expect(document.querySelector(".i-popconfirm")).toBeNull();
  expect(open.value).toBe(true);
  expect(document.activeElement).toBe(trigger);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await flushPromises();
  expect(open.value).toBe(false);
});

test("受控气泡实际关闭后恢复焦点，确认取消和 Esc 均有效", async () => {
  const open = ref(false);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(Popconfirm, { modelValue: open.value, "onUpdate:modelValue": (value: boolean) => (open.value = value) }, () =>
          h("button", { id: "controlled-trigger" }, "删除")
        )
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  const trigger = w.get("button").element as HTMLButtonElement;
  for (const action of ["escape", "cancel", "confirm"]) {
    trigger.focus();
    trigger.click();
    await flushPromises();
    if (action === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    else
      document
        .querySelector<HTMLButtonElement>(action === "confirm" ? "[data-popconfirm-confirm]" : ".i-popconfirm button")!
        .click();
    await flushPromises();
    expect(open.value).toBe(false);
    expect(document.activeElement).toBe(trigger);
  }
});
test("同一次遮罩手势只关闭气泡，下一次才关闭底层弹窗", async () => {
  const open = ref(true);
  const w = mount(
    defineComponent({
      setup: () => () =>
        h(ConfigProvider, {}, () =>
          h(Dialog, { modelValue: open.value, "onUpdate:modelValue": (value: boolean) => (open.value = value) }, () =>
            h(Popconfirm, { title: "确认？" }, () => h("button", { id: "mask-trigger" }, "删除"))
          )
        )
    }),
    { attachTo: document.body }
  );
  wrappers.push(w);
  await flushPromises();
  document.querySelector<HTMLButtonElement>("#mask-trigger")!.click();
  await flushPromises();
  const mask = document.querySelector(".i-dialog__mask")!;
  mask.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  await flushPromises();
  mask.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
  await flushPromises();
  expect(document.querySelector(".i-popconfirm")).toBeNull();
  expect(open.value).toBe(true);
  mask.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  mask.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
  await flushPromises();
  expect(open.value).toBe(false);
});

test("支持按钮类型、隐藏图标和面板宽度", async () => {
  const w = mount(Popconfirm, {
    props: { hideIcon: true, width: 280, confirmButtonType: "danger", cancelButtonType: "plain" },
    slots: { default: () => h("button", "删除") },
    attachTo: document.body
  });
  wrappers.push(w);
  await w.get("button").trigger("click");
  await flushPromises();
  const panel = document.querySelector<HTMLElement>(".i-popconfirm")!;
  expect(panel.querySelector("span")).toBeNull();
  expect(panel.style.width).toBe("280px");
});
