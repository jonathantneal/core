import { h, Element } from "../dist/atomico.m";

describe("Context", () => {
    it("Context", done => {
        let count = 10;
        customElements.define(
            "tag-child",
            class extends Element {
                onMounted() {
                    assert.equal(this.context.count, count);
                    assert.equal(this.content.innerHTML, `<div>${count}</div>`);
                    done();
                }
                render() {
                    return <div>{this.context.count}</div>;
                }
            }
        );
        customElements.define(
            "tag-parent",
            class extends Element {
                getContext() {
                    return { count };
                }
                render() {
                    return (
                        <div>
                            hola!
                            <tag-child />
                        </div>
                    );
                }
            }
        );

        let tag = document.createElement("tag-parent");

        document.body.appendChild(tag);
    });
});
