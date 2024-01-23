import { PropType, computed, defineComponent } from "vue";
import { createNamespace } from "../../src/utils/create";
const [name, bem] = createNamespace("cascader");



export default defineComponent({
    name,
    props: {
        
    },
    setup(props, { slots }) {
        const {  } = props;
        const style = computed(() => {
            
        });

        const classLists = bem({ 
            
        })

        return () => (
            <div class={classLists} style={style.value}>
                
            </div>
        );
    },
});
