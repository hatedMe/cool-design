import vue from 'vue'
import messageComponent from './demo'

function showMessage({ text, type, icon, closeble, duration = 1500 }) {
    // 组件构造器，构造出一个 vue组件实例
    const messageDoms = document.getElementsByClassName('i-message') || []
    const MessageConstructor = vue.extend(messageComponent)
    const messageDom = new MessageConstructor({
        el: document.createElement('div'),
        data() {
            return {
                isShow: false,
                text: text, // 文本内容
                type: type, // 类型
                duration: duration,
                total: messageDoms.length,
                timerId: null,
                closeble: closeble,
                icon: icon
            }
        },
        mounted() {
            this.deleteAllDom();
            this.isShow = true;
            this.timerId = setTimeout(() => {
                this.isShow = false
                clearTimeout(this.timerId)
            }, this.duration)
        },
        methods: {
            //清空其他消息节点
            deleteAllDom() {
                for (let i = 0; i < messageDoms.length; i++) {
                    clearTimeout(messageDoms[i].getAttribute('timerId'))
                    // messageDoms[i].remove()
                }
            },
            deleteItem(id) {
                for (let i = 0; i < messageDoms.length; i++) {
                    if (messageDoms[i].getAttribute('timerId') == id) {
                        messageDoms[i].remove()
                    }
                }
            }
        }
    })
    // 添加节点
    document.body.appendChild(messageDom.$el)
    setTimeout(() => {
        messageDom.$el.remove()
    }, duration)
}

export default showMessage
