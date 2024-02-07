import { signal } from "@preact/signals";

function uiValue() {
    const kindSignal = signal<"unknown" | "indeterminate" | "known">("unknown");
    const valueSignal = signal<any>(undefined);

    const state = {};
    const api = {
        update,
        eager,
        isKnown,
        isIndeterminate,
        isUnknown,
        get,
    };

    const handler: ProxyHandler<any> = {
        get(target, p) {
            if (p in api) {
                return api[p as keyof typeof api];
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

    function isKnown() {
        return kindSignal.value === "known";
    }

    function isIndeterminate() {
        return kindSignal.value === "indeterminate";
    }

    function isUnknown() {
        valueSignal.value; // Subscribe
        return () => kindSignal.peek() === "unknown";
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
            if (p === "generation") {
                return generationSignal.peek();
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
