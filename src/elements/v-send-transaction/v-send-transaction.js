import XElement from '../../lib/x-element/x-element.js'
import MixinRedux from '../mixin-redux.js'
import MixinModal from '../mixin-modal/mixin-modal.js'
import ReduxProvider from '../../../node_modules/vuejs-redux/bundle.es.js';
import { setContact } from '../v-contact-list/contacts-redux.js'
import { walletsArrayWithAccountMap$ } from '../../selectors/wallet$.js'
import hubClient from '../../hub-client.js';

export default class VSendTransaction extends MixinModal(XElement) {
    html() {
        return `<div class="body vue-send-tx">
                    <redux-provider :map-state-to-props="mapStateToProps" :store="store">
                        <send-tx
                            slot-scope="{contacts, wallets}"
                            :contacts="contacts"
                            :wallets="wallets"
                            :preselectedSender="sender"
                            @login="login"
                            @scan-qr="scan-qr"
                            @send-tx="send-tx"
                            @contact-added="contactAdded"
                            @create-cashlink="createCashlink"
                            />
                    </redux-provider>
                </div>
                <transition class="qr-scanner" enter-active-class="fade-in" leave-active-class="fade-out">
                    <qr-scanner v-if="shown" @result="onQrScanned" @cancel="closeQrScanner"></qr-scanner>
                </transition>`;
    }

    static get actions() {
        return {
            setContact,
        }
    }

    onCreate() {
        super.onCreate();
        const self = this;

        this.vue = new Vue({
            el: this.$('.vue-send-tx'),
            data: {
                store: MixinRedux.store,
                isLoading: this.isLoading,
                sender: this.sender,
            },
            methods: {
                mapStateToProps(state) {
                    return {
                        contacts: Object.values(state.contacts),
                        wallets: walletsArrayWithAccountMap$(state),
                    };
                },
                login() {
                    hubClient.onboard();
                },
                ScanQr() {

                },
                sendTx(tx) {
                    this.fire('x-send-transaction', tx);
                },
                contactAdded(contact) {
                    VSendTransaction.actions.setContact(contact.label, contact.address);
                },
                createCashlink(account) {
                    hubClient.cashlink(account.address, account.balance);
                },
            },
            components: {
                'redux-provider': ReduxProvider,
                'send-tx': NimiqVueComponents.SendTx,
            }
        })
    }

    set sender(sender) {
        this.sender = sender;
    }

    set loading(isLoading) {
        this._isLoading = !!isLoading;
    }


    onShow(address, mode, amount, message, freeze) {

    }

    hide() {

    }

    _getQrScanner() {
        if (this._qrScanner) return this._qrScanner;
        this._qrScanner = new Vue({
            el: this.$('.qr-scanner'),
            data: () => ({
                shown: false,
            }),
            methods: {
                onQrScanned: this._onQrScanned.bind(this),
                closeQrScanner: this._closeQrScanner.bind(this),
            },
            components: {
                'qr-scanner': NimiqVueComponents.QrScanner,
                // @asset(/node_modules/@nimiq/vue-components/dist/qr-scanner-worker.min.js)
            }
        });
        return this._qrScanner;
    }

    _openQrScanner() {
        this._getQrScanner().shown = true;
    }

    _closeQrScanner(codeFound = false) {
        if (!this._qrScanner) return;
        if (codeFound || !this._isQrScanMode) {
            this._isQrScanMode = false;
            this._qrScanner.shown = false;
        }
        else if (this.hide) this.hide();
    }

    _onQrScanned(scanResult) {
        let recipient, amount, message;
        const parsedRequestLink = parseRequestLink(scanResult);
        if (parsedRequestLink) {
            ({ recipient, amount, message } = parsedRequestLink);
        } else if (ValidationUtils.isValidAddress(scanResult)) {
            recipient = scanResult;
        } else {
            return;
        }
        this.recipient = recipient; // required
        if (amount) this.amount = amount;
        if (message) this.message = message;
        this._closeQrScanner(true);
        this.validateAllFields();
    }
}
