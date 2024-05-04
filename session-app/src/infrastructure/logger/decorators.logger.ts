import { container } from 'tsyringe';
import PowerToolsLogger from './power-tools.logger';

//Only logger for async functions
export const logForMeasureTime = (className: string) => {
    return (target: any, propertyKey: string, descriptor: any): any => {
        const fn = descriptor.value;

        const operation = `${propertyKey}`;

        descriptor.value = async function (...args: any[]): Promise<any> {
            const logger = container.resolve(PowerToolsLogger);
            const hrStart = process.hrtime();
            const startMemoryUsage = process.memoryUsage().heapUsed;

            try {
                const value = await fn.apply(this, args);
                const endMemoryUsage = process.memoryUsage().heapUsed;
                const memoryUsage = endMemoryUsage - startMemoryUsage;
                const hrEnd = process.hrtime(hrStart);
                const executionTime = hrEnd[0] * 1000 + hrEnd[1] / 1000000;

                logger.info(className, operation, executionTime, value, `Process ${className}.${operation}`, {
                    memoryUsage,
                });
                return <unknown>value;
            } catch (error: any) {
                const hrEnd = process.hrtime(hrStart);
                const executionTime = hrEnd[0] * 1000 + hrEnd[1] / 1000000;
                const endMemoryUsage = process.memoryUsage().heapUsed;
                const memoryUsage = endMemoryUsage - startMemoryUsage;

                logger.error(className, operation, executionTime, {}, `Process ${className}.${operation}`, error, {
                    memoryUsage,
                });
                throw error;
            }
        };
    };
};
