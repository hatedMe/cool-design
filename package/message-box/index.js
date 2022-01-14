import vue from 'vue'
import messageBoxComponent from './demo'

function showMessage({ title, message, ...options }) {
    // 组件构造器，构造出一个 vue组件实例
    const MessageConstructor = vue.extend(messageBoxComponent)
    const messageBoxDom = new MessageConstructor({
        el: document.createElement('div'),
        data() {
            return {
                title: title,
                message: message,
                confirmButtonText: "",
                cancelButtonText: "",
                showClose: false,
                closeOnClickModal: false
            }
        },
        mounted() {
            const { confirmButtonText, cancelButtonText, showClose, closeOnClickModal } = options
            this.confirmButtonText = confirmButtonText || '确认'
            this.cancelButtonText = cancelButtonText || '取消'
            this.showClose = !!showClose
            this.closeOnClickModal = !!closeOnClickModal
            console.log(options, 'options')
        },
        methods: {
            closeBox() {
                const boxs = document.getElementsByClassName('i-message-box')
                for (let i = 0; i < boxs.length; i++) {
                    boxs[i].remove()
                }
            },
            onClickSureHandle() {
                this.closeBox()
                options.callback('confirm')
            },
            onClickCancelHandle() {
                this.closeBox()
                options.callback('cancel')
            },
            clickMaskHandle(){
                if(!this.closeOnClickModal) return;
                this.closeBox()
            }
        }
    })
    // 添加节点
    document.body.appendChild(messageBoxDom.$el)
}

export default showMessage
