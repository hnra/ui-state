import { mkState } from "./UIState";

export class WebView<TState> {
    private _state: any = mkState();

    constructor() {}

    get state() {
        // Type this without mutatation api
        return this._state;
    }

    public setAge(args: any, eager: TState) {
        this._state.eagerUpdate(eager);
        modify("setAge", this._state.generation, eager);
    }

    // Don't care about read methods other than getState
}

function modify(method: string, generation: number, args: any) {
    // Exec
}
