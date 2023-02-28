import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace("cascader");
import "./index.scss";

export default createComponent({
    props: {
        value: {
            type: Number
        },
        data: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    model: {
        prop: "value",
        event: "change"
    },
    data() {
        return {
            open: false,
            treeDeepNums: [],
            resultNums: []
        };
    },
    computed: {
        resStrValue() {
            let str = "";
            let mock = {};
            this.resultNums.map((item, index) => {
                if (item === -1) return "";
                mock = index === 0 ? this.data[item] : mock.children[item];
                str += (index === 0 ? "" : "/") + mock.label;
            });
            return str;
        }
    },

    methods: {
        openCascader() {
            this.open = !this.open;
            if (this.open && this.data.length) {
                if (!this.resultNums.length) {
                    this.treeDeepNums = [
                        {
                            children: [...this.data]
                        }
                    ];
                }
            }
        },
        dataItemClick(item, index, idx) {
            if (index + 1 < this.treeDeepNums.length) {
                this.treeDeepNums.splice(index + 1);
                this.resultNums.splice(index + 1);
            }
            if (item.children) {
                this.treeDeepNums.push(item);
                this.resultNums.push(-1);
            } else {
                this.open = false;
            }
            this.$set(this.resultNums, index, idx);
        },
        getBaseItem(data, parentIndex) {
            return (
                <div class={[bem("data-list-group")]}>
                    {data.children.map((item, index) => {
                        return (
                            <p
                                class={[
                                    bem("item", {
                                        disabled: item.disabled,
                                        active:
                                            this.resultNums[parentIndex] ===
                                            index
                                    })
                                ]}
                                onClick={() =>
                                    this.dataItemClick(item, parentIndex, index)
                                }
                            >
                                {item.label}
                            </p>
                        );
                    })}
                </div>
            );
        }
    },
    render(h) {
        return (
            <div class={bem()}>
                <div onClick={() => this.openCascader()}>
                    <input
                        class={[bem("input")]}
                        placeholder="请选择"
                        readonly
                        value={this.resStrValue}
                    />
                    {this.value ? (
                        <span onClick={e => this.deleteValue(e)}>
                            <i-icon type="icon-delete" />
                        </span>
                    ) : (
                        <i-icon
                            type="icon-packup"
                            class={[bem("icon", { roter: this.open })]}
                        />
                    )}
                </div>
                {this.open && this.data.length ? (
                    <div class={[bem("data-list")]}>
                        {this.treeDeepNums.map((item, index) => {
                            return this.getBaseItem(item, index);
                        })}
                    </div>
                ) : null}
            </div>
        );
    }
});
