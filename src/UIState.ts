import { signal } from "@preact/signals";

function uiValue() {
    const kindSignal = signal<"unknown" | "indeterminate" | "known">("unknown");
    const valueSignal = signal<any>(undefined);

    const state = {};

    const handler: ProxyHandler<any> = {
        get(target, p) {
            if (p === "update") {
                return update;
            }
            if (p === "render") {
                return render;
            }
            if (p === "eager") {
                return eager;
            }
            if (p === "isKnown") {
                // valueSignal.value; // Subscribe
                return () => kindSignal.value === "known";
            }
            if (p === "isIndeterminate") {
                // valueSignal.value; // Subscribe
                return () => kindSignal.value === "indeterminate";
            }
            if (p === "isUnknown") {
                valueSignal.value; // Subscribe
                return () => kindSignal.peek() === "unknown";
            }
            if (p === "get") {
                return get;
            }

            if (!(p in target)) {
                target[p] = uiValue();
            }

            return target[p];
        },
    };

    const proxy = new Proxy(state, handler);

    return proxy;

    function get() {
        return valueSignal.value;
    }

    function update(newValue: any) {
        if (typeof newValue === "object") {
            for (const k in newValue) {
                const uiVal = proxy[k];
                uiVal.update(newValue[k]);
            }
        } else {
            if (kindSignal.value !== "known") {
                kindSignal.value = "known";
            }

            if (valueSignal.value !== newValue) {
                valueSignal.value = newValue;
            }
        }
    }

    function eager(newValue: any) {
        if (typeof newValue === "object") {
            for (const k in newValue) {
                const uiVal = proxy[k];
                uiVal.eager(newValue[k]);
            }
        } else {
            if (kindSignal.value !== "indeterminate") {
                kindSignal.value = "indeterminate";
            }

            if (valueSignal.value !== newValue) {
                valueSignal.value = newValue;
            }
        }
    }

    function render() {
        if (kindSignal.value === "indeterminate") {
            return `¿${valueSignal.value}?`;
        } else if (kindSignal.value === "known") {
            return `${valueSignal.value}`;
        }

        return "???";
    }
}

export function mkState(): any {
    const state = {} as any;
    const generationSignal = signal(0);

    const handler: ProxyHandler<any> = {
        get(target, p) {
            if (p === "update") {
                return update;
            }

            if (p === "eagerUpdate") {
                return eagerUpdate;
            }

            if (!(p in target)) {
                target[p] = uiValue();
            }

            return target[p];
        },
    };

    const proxy = new Proxy(state, handler);
    return proxy;

    function eagerUpdate(eagerState: any) {
        generationSignal.value++;

        for (const p in eagerState) {
            const newVal = eagerState[p];
            const uiVal = proxy[p];

            uiVal.eager(newVal);
        }
    }

    function update(generation: number, newState: any) {
        if (generation < generationSignal.value) {
            return;
        }

        for (const p in newState) {
            const newVal = newState[p];
            const uiVal = proxy[p];

            uiVal.update(newVal);
        }
    }
}
