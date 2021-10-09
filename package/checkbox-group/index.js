import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('checkbox-group');
import "./index.scss";

export default createComponent({
	props: {
		value : {
			type : Array ,
			default : () => []
		}
	},
	watch: {
		value(val) {
			console.log( val );
			this.$emit("change",val);
		}	
	},
	render(h) {
		return (
			<div class={bem()}>{this.$slots.default}</div>
		)
	},
});