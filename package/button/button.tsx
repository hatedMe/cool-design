import { createNamespace } from "../../src/utils/index";
const [createComponent, bem] = createNamespace('button');
import { defineComponent } from "vue"
// import "./index.scss";


export default defineComponent({
	name: "Button",
	setup(props, ctx) {
		return (
			<button>555</button>
		)
	},
});