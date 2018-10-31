import { h, diff } from "../../src/diff/index.js";

describe("diff in root tag", () => {
    it("set simple attribute", () => {
        let div = document.createElement("div"),
            id = "#id";

        diff(false, div, <host id={id} />);

        assert.equal(div.id, id);
    });

    it("set attribute style", () => {
        let div = document.createElement("div"),
            style = { background: "black" };
        diff(false, div, <host style={style} />);

        assert.equal(div.style.background, style.background);
    });

    it("register event", () => {
        let div = document.createElement("div"),
            handler = ({ target }) => {
                assert.equal(div, target);
            };

        diff(false, div, <host click={handler} />);

        div.dispatchEvent(new CustomEvent("click"));
    });
});
describe("diff in children", () => {
    it("children slot exist", () => {
        let div = document.createElement("div"),
            slots = {
                img: new Image()
            };

        diff(
            false,
            div,
            <host>
                <slot name="img" />
            </host>,
            slots
        );

        assert.equal(div.querySelector("img"), slots.img);
    });

    it("children slot add attribute", () => {
        let div = document.createElement("div"),
            slots = {
                img: new Image()
            },
            img = "sample.jpg";

        diff(
            false,
            div,
            <host>
                <slot name="img" src={img} />
            </host>,
            slots
        );

        assert.equal(div.querySelector("img").getAttribute("src"), img);
    });
});
