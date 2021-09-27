import { createNamespace } from "../../src/utils/index";
const [createComponent, bem] = createNamespace('button');
import "./index.scss";

export default createComponent({
	props: {
		type: {
			type: String,
			default: "primary",
		},
	},
	render(h) {
		return (
			<button class={[bem({ [this.type]: true, active: true })]}>
				{this.$slots.default}
			</button>
		)
	},
});