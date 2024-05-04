export default interface Logger {
    info(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        ...args: unknown[]
    ): void;
    error(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        error: Error | undefined,
        ...args: unknown[]
    ): void;
    warning(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        error: Error | undefined,
        ...args: unknown[]
    ): void;
    debug(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        ...args: unknown[]
    ): void;
}
