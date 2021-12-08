import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('message');
import "./index.scss";

export default createComponent({
    render(h) {
        return (
            <div class={bem()} timerId={this.timerId} style={{ '--totaltop': this.total * 50 }}>
                {this.isShow ? (
                    <div class={[bem('content', { [this.type]: true })]}>
                        <span class={[bem('content-text')]}>
                            {this.icon ? <i-icon type={this.icon}></i-icon> : null}
                            {this.text}
                        </span>
                        {
                            !!this.closeble ? <span onClick={() => this.deleteItem(this.timerId)}><i-icon type="icon-close"></i-icon></span> : null
                        }
                    </div>
                ) : null}
            </div>
        )
    },
});
