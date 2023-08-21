import { defineComponent } from "vue";
import {createNamespace} from "../../src/utils/create";
const [name , bem] = createNamespace('button');



export default defineComponent({
	name,
	setup(_props, _ctx) {
		return (
			<button class={bem()}>555</button>
		)
	},
});