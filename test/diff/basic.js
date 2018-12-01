import { h, createRender } from "../../src";

describe("<host>", () => {
    it("define properties in host", () => {
        let container = document.createElement("div");

        let render = createRender(container);

        render(<host id="id-1" class="class-1" />);

        expect(container.id).to.equal("id-1");
        expect(container.className).to.equal("class-1");
    });

    it("define property listener", done => {
        let container = document.createElement("div");

        let render = createRender(container);

        render(<host click={() => done()} />);

        container.dispatchEvent(new Event("click"));
    });
});

describe("children", () => {
    it("define properties in children", () => {
        let container = document.createElement("div");

        let render = createRender(container);

        render(<div id="id-1" class="class-1" />);

        if (
            container.querySelector("#id-1") &&
            container.querySelector(".class-1")
        ) {
            expect(container.querySelector(".class-1").tagName).to.equal("DIV");
        }
    });

    it("define svg", () => {
        let container = document.createElement("div");

        let render = createRender(container);

        render(
            <svg height="100" width="100">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="black"
                    stroke-width="3"
                    fill="red"
                />
            </svg>
        );

        expect(container.innerHTML).to.equal(
            `<svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg>`
        );
    });
});
