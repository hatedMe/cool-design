import type { User, UserQuery, UserService } from "./types";

export function createUserService(delay = 350) {
    const names = [
        "林晓",
        "陈雨",
        "周宁",
        "王一凡",
        "赵悦",
        "李可",
        "张晨",
        "刘思远",
        "徐清",
        "孙然",
        "何嘉",
        "吴桐",
        "沈言",
        "许知",
        "郑明",
        "方舟",
        "苏禾",
        "程越",
        "陆安",
        "夏初",
        "蒋南",
        "宋远",
        "杨帆",
        "唐宁",
        "叶青",
        "冯夏",
        "韩秋",
        "谢予",
        "白露",
        "江月",
        "罗星",
        "顾风"
    ];
    const users: User[] = names.map((name, index) => ({
        id: 1001 + index,
        name,
        status: index % 4 === 1 ? "disabled" : "enabled"
    }));
    let failList = false;
    let failSave = false;
    const wait = () => new Promise((resolve) => setTimeout(resolve, delay));
    const api: UserService = {
        async listUsers(query: UserQuery) {
            const shouldFail = failList;
            failList = false;
            await wait();
            if (shouldFail) throw new Error("列表加载失败，请重试");
            let filtered = users.filter(
                (user) => user.name.includes(query.name.trim()) && (!query.status || user.status === query.status)
            );
            if (query.sortBy && query.order) {
                const key = query.sortBy as keyof User;
                if (["id", "name", "status"].includes(key)) {
                    const direction = query.order === "asc" ? 1 : -1;
                    filtered = [...filtered].sort(
                        (a, b) =>
                            direction *
                            (key === "id" ? a.id - b.id : String(a[key]).localeCompare(String(b[key]), "zh-CN"))
                    );
                }
            }
            return {
                total: filtered.length,
                items: filtered
                    .slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
                    .map((user) => ({ ...user }))
            };
        },
        async updateUser(id, draft) {
            const shouldFail = failSave;
            failSave = false;
            await wait();
            if (shouldFail) throw new Error("保存失败，请重试");
            const user = users.find((item) => item.id === id);
            if (!user) throw new Error("该用户已不存在，请刷新列表");
            Object.assign(user, { name: draft.name, status: draft.status });
            return { ...user };
        }
    };
    return {
        api,
        failNextList: () => {
            failList = true;
        },
        failNextSave: () => {
            failSave = true;
        }
    };
}
