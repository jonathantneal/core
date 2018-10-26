import { h, Element } from "../dist/atomico.m";

describe("Lifecycle", () => {
    /**
     * Verify the execution of aMounted once the first
     * render of the component has been executed
     */
    it("onMounted", done => {
        let tagName = "test-1";
        customElements.define(
            tagName,
            class extends Element {
                onMounted() {
                    assert.equal(this.content.innerHTML, `<div>hola!</div>`);
                    done();
                }
                render() {
                    return <div>hola!</div>;
                }
            }
        );

        let tag = document.createElement(tagName);

        document.body.appendChild(tag);
    });
    /**
     * Verify that onUpdate is running before the component update
     */
    it("onUpdate", done => {
        let tagName = "test-2";
        customElements.define(
            tagName,
            class extends Element {
                static get props() {
                    return ["property"];
                }
                onMounted() {
                    this.setAttribute("property", 10);
                }
                onUpdate() {
                    assert.equal(this.content.innerHTML, `<div></div>`);
                    done();
                }
                render() {
                    return <div>{this.props.property}</div>;
                }
            }
        );

        let tag = document.createElement(tagName);

        document.body.appendChild(tag);
    });
    /**
     * Compare the update of the component,
     * comparing it with the expected state
     */
    it("onUpdated", done => {
        let tagName = "test-3";
        customElements.define(
            tagName,
            class extends Element {
                static get props() {
                    return ["property"];
                }
                onMounted() {
                    this.setAttribute("property", 10);
                }
                onUpdated() {
                    assert.equal(
                        this.content.innerHTML,
                        `<div>${this.props.property}</div>`
                    );
                    done();
                }
                render() {
                    return <div>{this.props.property}</div>;
                }
            }
        );

        let tag = document.createElement(tagName);

        document.body.appendChild(tag);
    });
    /**
     * This test verifies that onUpdate prevents the
     * execution of setState, by returning false.
     */
    it("prevent onUpdate", done => {
        let tagName = "test-4";
        customElements.define(
            tagName,
            class extends Element {
                static get props() {
                    return ["property"];
                }
                onMounted() {
                    this.setAttribute("property", 10);
                }
                onUpdate() {
                    setTimeout(() => {
                        assert.equal(this.content.innerHTML, `<div></div>`);
                        done();
                    });
                    return false;
                }
                render() {
                    return <div>{this.props.property}</div>;
                }
            }
        );

        let tag = document.createElement(tagName);

        document.body.appendChild(tag);
    });
    /**
     * This test verifies that onUpdate prevents the
     * execution of setState, by returning false.
     */
    it("prevent onUnmounted", done => {
        let tagName = "test-5";
        customElements.define(
            tagName,
            class extends Element {
                static get props() {
                    return ["property"];
                }
                onUnmounted() {
                    done();
                }
                render() {
                    return <div>{this.props.property}</div>;
                }
            }
        );

        let tag = document.createElement(tagName);

        document.body.appendChild(tag);

        document.body.removeChild(tag);
    });
});
