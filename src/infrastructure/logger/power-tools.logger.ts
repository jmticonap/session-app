import { LogFormatter, Logger as PowerTools } from '@aws-lambda-powertools/logger';
import { singleton } from 'tsyringe';
import Logger from './logger';
import { NumbersInWords } from './utils/numbers-to-words';
import { StringsUtils } from './utils/strings-utils';
import { Context } from 'aws-lambda/handler';
import { LogAttributes, UnformattedAttributes } from '@aws-lambda-powertools/logger/lib/types';

class CustomLambdaFormat extends LogFormatter {
    public formatAttributes(attributes: UnformattedAttributes): LogAttributes {
        return {
            level: attributes.logLevel,
            message: attributes.message,
            service: attributes.serviceName,
            timestamp: attributes.timestamp,
            xray_trace_id: attributes.xRayTraceId,
            awsRequestId: attributes.lambdaContext?.awsRequestId,
        };
    }
}

interface Argument {
    [key: string]: any;
}

const fieldsToMask = ['dni'];

const maskObject = (object: any, fieldsToMask: string[]) => {
    if (!object) return;
    if (!fieldsToMask.length) return;

    const keys = Object.keys(object);
    keys.map((key) => {
        const isObject = typeof object[key] === 'object';
        const isArray = Array.isArray(object[key]);
        if (isObject && !isArray) {
            maskObject(object[key], fieldsToMask);
        } else {
            if (fieldsToMask.includes(key)) {
                object[key] = '*******';
            }
        }
    });
};

const cloneDeep = (obj: any) => {
    if (obj === null) return null;
    const clone = Object.assign({}, obj);
    Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? cloneDeep(obj[key]) : obj[key]));
    if (Array.isArray(obj)) {
        clone.length = obj.length;
        return Array.from(clone);
    }
    return clone;
};

@singleton()
export default class PowerToolsLogger implements Logger {
    private _logger: PowerTools;

    constructor() {
        this._logger = new PowerTools({
            logFormatter: new CustomLambdaFormat(),
            serviceName: 'session-app',
        });
    }

    setContext(context: Context) {
        this._logger.addContext(context);
    }

    extractExtraInfo(args: any, extraInfo: Argument = {}): Argument {
        for (const [argName, argData] of Object.entries(args)) {
            if (typeof argData === 'object') {
                this.extractExtraInfo(argData, extraInfo);
            } else {
                const key: string = isNaN(Number(argName))
                    ? argName
                    : StringsUtils.convertToCamelCase(
                          `extra info ${NumbersInWords.numberToWords(Object.keys(extraInfo).length + 1)}`,
                      );
                extraInfo[key] = argData;
            }
        }
        return extraInfo;
    }

    replaceParams(originalString: string, ...params: (string | undefined)[]): string {
        let currentIndex = 0;

        const replacedString = originalString.replace(/%[sd]/g, (match) => {
            if (match === '%s' || match === '%d') {
                const param = params[currentIndex++];
                return param !== null && param !== undefined ? param.toString() : '';
            } else {
                return match;
            }
        });

        return replacedString;
    }

    info(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        ...args: unknown[]
    ): void {
        const extraInfo = this.extractExtraInfo(args);

        const data = cloneDeep(object);

        maskObject(data, fieldsToMask);

        this._logger.info(this.replaceParams(msg, ...Object.values(extraInfo)), {
            data: { ...data },
            executionTime,
            className,
            operation,
            ...extraInfo,
        });
    }

    error(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        error: Error | undefined,
        ...args: unknown[]
    ): void {
        const data = cloneDeep(object);

        maskObject(data, fieldsToMask);

        const extraInfo = this.extractExtraInfo(args);

        this._logger.error(this.replaceParams(msg, ...Object.values(extraInfo)), {
            data: { ...data },
            error,
            executionTime,
            className,
            operation,
            ...extraInfo,
        });
    }

    warning(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        error: Error | undefined,
        ...args: unknown[]
    ): void {
        const data = cloneDeep(object);

        maskObject(data, fieldsToMask);

        const extraInfo = this.extractExtraInfo(args);

        this._logger.warn(this.replaceParams(msg, ...Object.values(extraInfo)), {
            data: { ...data },
            error,
            executionTime,
            className,
            operation,
            ...extraInfo,
        });
    }

    debug(
        className: string,
        operation: string,
        executionTime: number | undefined,
        object: object,
        msg: string,
        ...args: unknown[]
    ): void {
        const data = cloneDeep(object);

        maskObject(data, fieldsToMask);

        const extraInfo = this.extractExtraInfo(args);

        this._logger.debug(this.replaceParams(msg, ...Object.values(extraInfo)), {
            data: { ...data },
            executionTime,
            className,
            operation,
            ...extraInfo,
        });
    }
}
