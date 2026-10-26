import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, expect, test, vi } from "vitest";
import UserManagement from "../index.vue";
import type { User, UserService } from "../types";

const first: User = { id: 1001, name: "林晓", status: "enabled" };
const second: User = { id: 1002, name: "陈雨", status: "disabled" };
const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    wrappers.length = 0;
    document.body.innerHTML = "";
});
function create(service?: Partial<UserService>) {
    const api: UserService = {
        listUsers: vi.fn().mockResolvedValue({ items: [{ ...first }, { ...second }], total: 32 }),
        updateUser: vi.fn().mockImplementation(async (id, draft) => ({ id, ...draft })),
        ...service
    };
    const w = mount(UserManagement, { props: { service: api }, attachTo: document.body });
    wrappers.push(w);
    return { w, api };
}

test("查询、重置和分页各请求一次，查询条件按提交值保持", async () => {
    const { w, api } = create();
    await flushPromises();
    await w.get('[data-test="query-name"]').setValue("林");
    await w.get('[data-test="query-form"]').trigger("submit");
    await flushPromises();
    expect(api.listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ name: "林", page: 1 }));
    await w.get('[data-test="query-name"]').setValue("未提交");
    await w.get('[aria-label="下一页"]').trigger("click");
    await flushPromises();
    expect(api.listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ name: "林", page: 2 }));
    await w.get('[data-test="reset"]').trigger("click");
    await flushPromises();
    expect(api.listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ name: "", page: 1 }));
    expect(api.listUsers).toHaveBeenCalledTimes(4);
    await w.get('[aria-label="每页条数"]').setValue("20");
    await flushPromises();
    expect(api.listUsers).toHaveBeenCalledTimes(5);
    expect(api.listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
});

test("取消不污染原行，校验阻止空白提交，切换记录重置使用本次初值", async () => {
    const { w, api } = create();
    await flushPromises();
    await w.findAll('[data-test="edit"]')[0].trigger("click");
    await flushPromises();
    const input = () => document.querySelector<HTMLInputElement>('[data-test="edit-name"]')!;
    input().value = "改动";
    input().dispatchEvent(new Event("input", { bubbles: true }));
    await w.get('[data-test="cancel"]').trigger("click");
    await flushPromises();
    expect(w.get("tbody").text()).toContain("林晓");
    expect(w.get("tbody").text()).not.toContain("改动");
    await w.findAll('[data-test="edit"]')[1].trigger("click");
    await flushPromises();
    expect(input().value).toBe("陈雨");
    input().value = "   ";
    input().dispatchEvent(new Event("input", { bubbles: true }));
    await w.get('[data-test="edit-form"]').trigger("submit");
    await flushPromises();
    expect(document.body.textContent).toContain("请输入姓名");
    expect(document.activeElement).toBe(input());
    expect(api.updateUser).not.toHaveBeenCalled();
    await w.get('[data-test="reset-edit"]').trigger("click");
    await flushPromises();
    expect(input().value).toBe("陈雨");
});

test("保存失败保留草稿，重试期间禁止重复提交和关闭，成功刷新列表", async () => {
    let finish!: (user: User) => void;
    const updateUser = vi
        .fn()
        .mockRejectedValueOnce(new Error("保存失败，请重试"))
        .mockImplementationOnce(() => new Promise<User>((resolve) => (finish = resolve)));
    const { w, api } = create({ updateUser });
    await flushPromises();
    await w.findAll('[data-test="edit"]')[0].trigger("click");
    await flushPromises();
    await w.get('[data-test="edit-name"]').setValue("新姓名");
    await w.get('[data-test="edit-form"]').trigger("submit");
    await flushPromises();
    expect(document.body.textContent).toContain("保存失败，请重试");
    expect(w.get('[data-test="edit-name"]').element.value).toBe("新姓名");
    await w.get('[data-test="edit-form"]').trigger("submit");
    await w.get('[data-test="edit-form"]').trigger("submit");
    await flushPromises();
    expect(updateUser).toHaveBeenCalledTimes(2);
    expect(w.get('[data-test="cancel"]').attributes("disabled")).toBeDefined();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    finish({ ...first, name: "新姓名" });
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.textContent).toContain("保存成功");
    expect(api.listUsers).toHaveBeenCalledTimes(2);
});

test("新查询先完成时，旧结果不会覆盖；失败可重试", async () => {
    let completeOld!: (result: { items: User[]; total: number }) => void;
    const listUsers = vi
        .fn()
        .mockImplementationOnce(() => new Promise((resolve) => (completeOld = resolve)))
        .mockResolvedValueOnce({ items: [second], total: 1 })
        .mockRejectedValueOnce(new Error("加载失败"))
        .mockResolvedValueOnce({ items: [], total: 0 });
    const { w } = create({ listUsers });
    await w.get('[data-test="query-name"]').setValue("陈");
    await w.get('[data-test="query-form"]').trigger("submit");
    await flushPromises();
    expect(w.get("tbody").text()).toContain("陈雨");
    completeOld({ items: [first], total: 1 });
    await flushPromises();
    expect(w.get("tbody").text()).not.toContain("林晓");
    await w.get('[data-test="query-form"]').trigger("submit");
    await flushPromises();
    expect(w.text()).toContain("加载失败");
    await w.get('[data-test="retry"]').trigger("click");
    await flushPromises();
    expect(w.text()).toContain("没有符合条件的数据");
});

test("保存成功但刷新失败时区分提示，不保留可重复提交的编辑窗口", async () => {
    const listUsers = vi
        .fn()
        .mockResolvedValueOnce({ items: [first], total: 1 })
        .mockRejectedValueOnce(new Error("网络中断"));
    const { w } = create({ listUsers });
    await flushPromises();
    await w.get('[data-test="edit"]').trigger("click");
    await flushPromises();
    await w.get('[data-test="edit-form"]').trigger("submit");
    await flushPromises();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.textContent).toContain("保存成功，列表刷新失败");
});

test("排序刷新后保留排序指示，重新查询清空同一记录的选择", async () => {
    const { w, api } = create();
    await flushPromises();
    await w.get("thead button").trigger("click");
    await flushPromises();
    expect(api.listUsers).toHaveBeenLastCalledWith(expect.objectContaining({ sortBy: "id", order: "asc" }));
    expect(w.get('[aria-sort="ascending"]').text()).toContain("用户 ID");
    await w.get("tbody input").setValue(true);
    expect(w.text()).toContain("已选择 1 项");
    await w.get('[data-test="query-form"]').trigger("submit");
    await flushPromises();
    expect((w.get("tbody input").element as HTMLInputElement).checked).toBe(false);
});
