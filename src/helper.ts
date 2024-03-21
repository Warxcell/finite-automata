export function assertNever<T>(value: never, ret: T): T {
    return ret
}