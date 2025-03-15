export function assert(value: any, msg?: string): asserts value {
    if (!value) {
        throw Error(msg ?? "Assertion failed");
    }
}