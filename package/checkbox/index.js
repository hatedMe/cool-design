import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('checkbox');
import Icon from "../icon";
import "./index.scss";

export default createComponent({
	props: {
		name: null,
	},
	computed: {
		checkout: {
			get() {
				return this.$parent.value.indexOf(this.name) !== -1;
			},
			set(val) {
				this.setParentVal(val);
			}
		}
	},
	methods: {
		clickHandle() {
			this.checkout = !this.checkout;
		},
		setParentVal(val) {
			const value = this.$parent.value.slice();
			if (val) {
				if (value.indexOf(this.name) === -1) {
					value.push(this.name);
					this.$parent.$emit('input', value);
				}
			} else {
				const index = value.indexOf(this.name);
				if (index !== -1) {
					value.splice(index, 1);
					this.$parent.$emit('input', value);
				}
			}
		}
	},
	render(h) {
		return (
			<div class={bem()} onClick={this.clickHandle}>
				<Icon type={ this.checkout ? "icon-success_fill" : "icon-success" } class="size24"></Icon>
				<span>{this.$slots.default}</span>
			</div>
		)
	},
});