import { h, Element } from "../src";

let count = 0;
function tagName() {
    return "tag-" + count++;
}

describe("Lifecycle", () => {
    /**
     * Verify the execution of aMounted once the first
     * render of the component has been executed
     */
    it("onMounted", done => {
        let localName = tagName();
        customElements.define(
            localName,
            class extends Element {
                onMounted() {
                    expect(this.innerHTML).to.equal(`<div>hola!</div>`);
                    done();
                }
                render() {
                    return <div>hola!</div>;
                }
            }
        );

        let tag = document.createElement(localName);

        document.body.appendChild(tag);
    });
    /**
     * Verify the execution of aMounted once the first
     * render of the component has been executed
     */
    it("onUpdate property", done => {
        let localName = tagName(),
            sampleProp = "...";

        customElements.define(
            localName,
            class extends Element {
                static get props() {
                    return ["sample-prop"];
                }
                onMounted() {
                    expect(this.sampleProp).to.equal(sampleProp);
                    done();
                }
                render() {
                    return <div>hola!</div>;
                }
            }
        );

        let tag = document.createElement(localName);

        tag.sampleProp = sampleProp;
        document.body.appendChild(tag);
    });

    /**
     * Verify the execution of aMounted once the first
     * render of the component has been executed
     */
    it("onUpdated property", done => {
        let localName = tagName(),
            sampleProp = "...";

        customElements.define(
            localName,
            class extends Element {
                static get props() {
                    return ["sample-prop"];
                }
                onMounted() {
                    this.sampleProp = sampleProp;
                }
                onUpdated() {
                    expect(this.innerHTML).to.equal(`<div>hola! ...</div>`);
                    done();
                }
                render() {
                    return <div>hola! {this.sampleProp}</div>;
                }
            }
        );

        let tag = document.createElement(localName);

        document.body.appendChild(tag);
    });

    it("onUnmount", done => {
        let localName = tagName(),
            sampleProp = "...";

        customElements.define(
            localName,
            class extends Element {
                static get props() {
                    return ["sample-prop"];
                }
                onMounted() {
                    this.remove();
                }
                onUnmounted() {
                    done();
                }
                render() {
                    return <div>hola! {this.sampleProp}</div>;
                }
            }
        );

        let tag = document.createElement(localName);

        document.body.appendChild(tag);
    });
});
