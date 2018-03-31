import XElement from '/libraries/x-element/x-element.js';

export default class XNoContent extends XElement {
    html() {
        return `
            <h1 class="material-icons">account_circle</h1>
            Click the menu to add an account
        `
    }
}
