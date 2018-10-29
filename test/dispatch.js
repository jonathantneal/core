import { h, Element } from "../dist/atomico.m";

describe("Dispatch", () => {
    it("Dispatch", done => {
        let tagName = "tag-dispatch",
            detail = {};

        customElements.define(
            tagName,
            class extends Element {
                onMounted() {
                    this.dispatch("ready", detail);
                }
            }
        );

        let tag = document.createElement(tagName);

        tag.addEventListener("ready", event => {
            assert.equal(detail, event.detail);
            done();
        });

        document.body.appendChild(tag);
    });
});
