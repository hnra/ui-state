import { signal } from "@preact/signals";

type Unknown<_ = any> = { _kind: "unknown"; _v: unknown };
function unknown<T = any>(): Unknown<T> {
    return {
        _kind: "unknown", _v: null
    };
}
function isUnknown(x: unknown): x is Unknown {
    return x != null && (x as Unknown)._kind === "unknown";
}

type Indeterminate<T = any> = { _kind: "indeterminate", _v: T};
function indeterminate<T = any>(v: T): Indeterminate<T> {
    return {
        _kind: "indeterminate", _v: v
    };
}
function isIndeterminate(x: unknown): x is Indeterminate {
    return x != null && (x as Indeterminate)._kind === "indeterminate";
}

type Known<T = any> = {_kind: "known", _v: T};
function known<T = any>(v: T): Known<T> {
    return {
        _kind: "known", _v: v
    };
}
function isKnown(x: unknown): x is Known {
    return x != null && (x as Known)._kind === "known";
}

type UIK<T = any> = Unknown<T> | Indeterminate<T> | Known<T>;
function isUIK(x: unknown): x is UIK {
    return isUnknown(x) || isIndeterminate(x) || isKnown(x);
}
function hasValue(x: UIK): x is Indeterminate | Known {
    return isIndeterminate(x) || isKnown(x);
}

function uiValue() {
    const vSignal = signal<UIK<any>>(unknown());

    return {
        update(newValue: UIK<any>) {
            const oldVal = vSignal.peek();
            if (oldVal._kind !== newValue._kind || oldVal._v !== newValue._v) {
                vSignal.value = newValue;
            }
        },

        isIndeterminate() {
            return isIndeterminate(vSignal.peek());
        },

        get() {
            const currVal = vSignal.value;
            if (isIndeterminate(currVal)) {
                return `¿${currVal._v}?`;
            } else if (isKnown(currVal)) {
                return `${currVal._v}`;
            }

            return "???";
        }
    };
}

export function mkState(): any {
    const state = { } as any;
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
        }
    };

    const proxy = new Proxy(state, handler);
    return proxy;

    function eagerUpdate(eagerState: any) {
        generationSignal.value++;

        for (const p in eagerState) {
            const newVal = eagerState[p];
            const uiVal = proxy[p];

            uiVal.update(indeterminate(newVal));
        }
    }

    function update(generation: number, newState: any) {
        if (generation < generationSignal.value) {
            return;
        }

        for (const p in newState) {
            const newVal = newState[p];
            const uiVal = proxy[p];

            uiVal.update(known(newVal));
        }
    }
}
