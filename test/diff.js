import { h } from "../src/vdom";
import { diff } from "../src/diff";

describe("diff", () => {
    it("Verify if the class property was added to the node", () => {
        let div = document.createElement("div"),
            className = "sample";

        diff(false, div, <div class={className} />);

        assert.equal(div.className, className);
    });

    it("Verify if the class property was removed from the node", () => {
        let div = document.createElement("div"),
            className = "sample";

        diff(false, div, <div class={className} />);

        diff(false, div, <div />);

        assert.equal(div.className, "");
    });

    it("Verify if the class property was removed from the node", done => {
        let div = document.createElement("div"),
            handler = event => {
                assert.equal(event.type, "click");
                done();
            };

        diff(false, div, <div click={handler} />);

        div.dispatchEvent(new CustomEvent("click"));
    });

    it("It allows to identify if the content associated to the textContent maintains the definition given in the VDOM", () => {
        let div = document.createElement("div"),
            childText = "child";

        diff(false, div, <div>{childText}</div>);

        assert.equal(div.textContent, childText);
    });

    it("It allows to identify that the persistent content will always be that of the diff algorithm", () => {
        let div = document.createElement("div");

        div.innerHTML = `
            <p>hola</p>
        `;

        diff(false, div, <div />);

        assert.equal(div.innerHTML, "");
    });

    it("It allows to identify if the div> p node has not been built again", () => {
        let div = document.createElement("div");

        let state1 = diff(
            false,
            div,
            <div>
                <p>1</p>
            </div>
        );

        let p1 = state1.querySelector("p");

        let state2 = diff(
            false,
            div,
            <div>
                <p>2</p>
            </div>
        );

        let p2 = state2.querySelector("p");

        assert.equal(p1, p2);
    });

    it("Verify if there is a change of node to base", () => {
        let div = document.createElement("div");

        diff(
            false,
            div,
            <div>
                <p>1</p>
            </div>
        );

        diff(
            false,
            div,
            <div>
                <span>2</span>
            </div>
        );

        let span = div.querySelector("span");

        assert.isNotNull(span);
    });
    it("Verify the reuse of the nodes associated with the existing node", () => {
        let div = document.createElement("div");

        let state1 = diff(
            false,
            div,
            <div>
                <div id="group">
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                </div>
            </div>
        );

        let group1 = state1.querySelector("#group>*");

        let state2 = diff(
            false,
            div,
            <div>
                <section id="group">
                    <button>1</button>
                    <button>2</button>
                    <button>3</button>
                </section>
            </div>
        );

        let group2 = state2.querySelector("#group>*");

        assert.equal(group1, group2);
    });
});
