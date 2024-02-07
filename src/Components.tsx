import { ComponentChildren } from "preact";

export function DepthLogger({
    depth,
    children,
}: {
    depth: number;
    children?: ComponentChildren;
}) {
    console.log(`Render depth=${depth}`);
    return <div>{children}</div>;
}

export function KnownRenderer({ label, value }: { label: string; value: any }) {
    console.log(`KnownRenderer ${label}`);
    if (value.isKnown()) {
        return (
            <>
                {label}: {value.get()}
            </>
        );
    } else {
        return <>{label}: Unknown or Indeterminate</>;
    }
}

export function ValueRender({ label, value }: { label: string; value: any }) {
    console.log(`ValueRender ${label}`);
    if (!value.isUnknown()) {
        return (
            <>
                {label}: {value.get()}
            </>
        );
    } else {
        return <>{label}: Unknown</>;
    }
}
