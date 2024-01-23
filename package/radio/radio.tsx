import { defineComponent } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("radio");

export default defineComponent({
    name,
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    setup(props, ctx) {
        const { disabled } = props;
        const onChange = () => {
            if (disabled) {
                return;
            }   
            ctx.emit("change");
        }

        return () => (
            <div
                class={bem({
                    "active": disabled
                })}>
                <div
                    class={[
                        bem("input", {
                            disabled: disabled,
                            checked: true
                        })
                    ]}>
                    <input type="radio" onChange={onChange} disabled={disabled} />
                    <span></span>
                </div>
                <div>{ctx.slots.default?.()}</div>
            </div>
        );
    }
});
