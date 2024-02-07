import { ComponentChildren, render } from "preact";
import { mkState } from "./UIState";
import { DepthLogger, KnownRenderer, ValueRender } from "./Components";

new EventSource("/esbuild").addEventListener("change", () => location.reload());

interface State {
    name: string;
    lastName: string;
    metadata: {
        age: number;
        moreMeta: {
            length: number;
        };
    };
}

const state = mkState();
eager({ name: "henrik", lastName: "andersson" }, 1);
update({ name: "henrik", lastName: "andersson!" }, 2);
eager({ metadata: { age: 42 } }, 3);
update({ metadata: { age: 42 } }, 4);
eager({ metadata: { moreMeta: { length: 175 } } }, 5);
// update({ metadata: { age: 42 } }, 4);

function App() {
    console.log("\nRender App");

    return (
        <DepthLogger depth={1}>
            <ValueRender value={state.name} label="name" />
            <DepthLogger depth={2}>
                <ValueRender value={state.lastName} label="lastName" />
                <DepthLogger depth={3}>
                    <KnownRenderer
                        value={state.metadata.age}
                        label="metadata.age"
                    />
                    <DepthLogger depth={4}>
                        <ValueRender
                            value={state.metadata.moreMeta.length}
                            label="length"
                        />
                    </DepthLogger>
                </DepthLogger>
            </DepthLogger>
        </DepthLogger>
    );
}

render(<App />, document.body);

function eager(s: any, m: number) {
    setTimeout(() => {
        console.log(`\n--- eager ${m}`);
        state.eagerUpdate(s);
    }, m * 1000);
}

function update(s: any, m: number) {
    setTimeout(() => {
        console.log(`\n--- update ${m} ---`);
        state.update(2, s);
    }, m * 1000);
}
