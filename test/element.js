import { h, Element } from "../dist/atomico.m";

describe("Element Lifecycle", () => {
    it("elementMount", done => {
        class Tag extends Element {
            elementMount() {
                assert.equal(this.innerHTML, `<div>hola!</div>`);
                done();
            }
            render() {
                return <div>hola!</div>;
            }
        }

        customElements.define("tag-test-1", Tag);

        let tag = document.createElement("tag-test-1");

        document.body.appendChild(tag);
    });

    it("elementMount and props", done => {
        let value = "hello!";

        class Tag extends Element {
            static get props() {
                return {
                    "prop-1": String
                };
            }
            elementMount() {
                assert.equal(this.props.prop1, value);
                done();
            }
            render() {
                return <div>hola!</div>;
            }
        }

        customElements.define("tag-test-2", Tag);

        let tag = document.createElement("tag-test-2");

        tag.setAttribute("prop-1", value);
        document.body.appendChild(tag);
    });

    it("elementMount force children", done => {
        let value = "hello!";

        class Tag extends Element {
            elementMount() {
                assert.equal(this.props.children.length, 0);
                done();
            }
            render() {
                return <div>hola!</div>;
            }
        }

        customElements.define("tag-test-3", Tag);

        let tag = document.createElement("tag-test-3");

        tag.innerHTML = `
                <p>1</p>
                <p>2</p>
                <p>3</p>
                <p>4</p>
            `;
        document.body.appendChild(tag);
    });

    it("Execution when deleting the element", done => {
        let value = "hello!";

        class Tag extends Element {
            elementUnmount() {
                assert.isNull(document.body.querySelector("tag-test-4"));
                done();
            }
            render() {
                return <div>hola!</div>;
            }
        }

        customElements.define("tag-test-4", Tag);

        let tag = document.createElement("tag-test-4");

        document.body.appendChild(tag);

        document.body.innerHTML = "";
    });

    it("Run event receive props, when you run setAttribute", done => {
        let value = "hello!";

        class Tag extends Element {
            static get props() {
                return ["sample"];
            }
            elementReceiveProps({ sample }) {
                assert.equal(value, sample);
                done();
            }
            render() {
                return <div>hola!</div>;
            }
        }

        customElements.define("tag-test-5", Tag);

        let tag = document.createElement("tag-test-5");

        document.body.appendChild(tag);

        setTimeout(() => {
            /**
             * The Atomico render is asynchronous, so you should wait
             * for the first render to run and then activate elementsReceiveProps
             */
            tag.setAttribute("sample", value);
        });
    });

    it("Run element Update, when generating a new render", done => {
        let value = "hello";

        class Tag extends Element {
            static get props() {
                return ["sample"];
            }
            elementUpdate() {
                assert.isNotNull(this.querySelector("#" + value));
                done();
            }
            render() {
                return (
                    <div>
                        hola!
                        <button id={this.props.sample} />
                    </div>
                );
            }
        }

        customElements.define("tag-test-6", Tag);

        let tag = document.createElement("tag-test-6");

        document.body.appendChild(tag);

        setTimeout(() => {
            /**
             * The Atomico render is asynchronous, so you should wait
             * for the first render to run and then activate elementsReceiveProps
             */
            tag.setAttribute("sample", value);
        });
    });
});
