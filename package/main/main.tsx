import { defineComponent } from "vue";
export default defineComponent({
    name: "i-main",
    setup(_, { slots }) {
        return () => <main class="i-main">{slots.default?.()}</main>;
    }
});
