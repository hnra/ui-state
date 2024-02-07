import { ComponentChildren, render } from "preact";
import { mkState } from "./UIState";

new EventSource('/esbuild').addEventListener('change', () => location.reload())

interface State {
    name: string;
}

const state = mkState();
state.eagerUpdate({name: "Henrik", lastName: "Andersson"});

setTimeout(() => {
    state.eagerUpdate({lastName: "Löseth"})
}, 2000);

setTimeout(() => {
    state.eagerUpdate({age: 42})
}, 1000);

setTimeout(() => {
    state.update(10, { name: "Potato", lastName: "Kartoffel", age: 100 });
}, 4000);

function App() {
    console.log("\nRender App");
    return <div>
        <SubComponent depth={1} value={state.name}>
            <SubComponent depth={2} value={state.lastName}>
            <SubComponent depth={3} value={state.age}></SubComponent>

            </SubComponent>
        </SubComponent>
    </div>;
}

function SubComponent({ depth, children, value }: {depth: number; children?: ComponentChildren, value: any}) {
    console.log(`Render depth=${depth}`);
    return <div>
        Value={value.get()}
        {children}
    </div>
}

render(<App />, document.body);