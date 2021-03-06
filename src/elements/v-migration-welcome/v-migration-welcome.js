import XElement from '../../lib/x-element/x-element.js'
import MixinModal from '../mixin-modal/mixin-modal.js'

export default class VMigrationWelcome extends MixinModal(XElement) {
    html() {
        return '<migration-welcome link="https://medium.com/nimiq-network/the-biggest-release-since-mainnet-launch-f8096e33dab9" @finished="finished" ref="migrationWelcome"></migration-welcome>'
    }

    onCreate() {
        super.onCreate()
        const self = this

        this.vue = new Vue({
            el: this.$('migration-welcome'),
            methods: {
                finished() {
                    self.hide()
                },
                reset() {
                    this.$refs.migrationWelcome.reset()
                },
            },
            components: {
                'migration-welcome': NimiqVueComponents.MigrationWelcome,
            }
        })
    }

    onShow() {
        this.vue.reset()
    }

    allowsHide(incomingModal) {
        // let this modal have precedence over other modals
        return !incomingModal;
    }
}

