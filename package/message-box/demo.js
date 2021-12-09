import { createNamespace } from "@/utils/index";
const [createComponent, bem] = createNamespace('message-box');
import "./index.scss";

export default createComponent({
    render(h) {
        return (
            <div class={bem()}>
                <i-mask onClick={() => this.clickMaskHandle()}></i-mask>
                <div class={bem('box')}>
                    <p class={bem('title')}>
                        <span>{this.title || '标题'}</span>
                        {
                            this.showClose ? <span onClick={() => this.closeBox()}><i-icon type="icon-close"></i-icon></span> : null
                        }
                    </p>
                    <p>{this.message}</p>
                    <p class={bem('action')}>
                        <i-button onClick={() => this.onClickCancelHandle()}>{this.cancelButtonText}</i-button>
                        <i-button onClick={() => this.onClickSureHandle()}>{this.confirmButtonText}</i-button>
                    </p>
                </div>
            </div>
        )
    },
});
