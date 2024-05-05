import { inject, singleton } from 'tsyringe';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import MysqlConectionManager from './mysql-conection-manager';
import MysqlPoolConectionManager from './mysql-pool-conection-manager';
import Logger from '../../logger/logger';
import BaseEntity from '../../../domain/entity/base.entity';
import PowerToolsLogger from '../../logger/power-tools.logger';

type QueryAttributes = {
    sql: string;
    params?: any[];
    className: string;
    method: string;
};

type InsertAttributes<T> = {
    tableName: string;
    data: T;
    className: string;
    method: string;
};

@singleton()
export default class MysqlExecutor {
    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(MysqlConectionManager) private _conectionManager: MysqlConectionManager,
        @inject(MysqlPoolConectionManager) private _poolManager: MysqlPoolConectionManager,
    ) {}

    async query<E extends BaseEntity, T extends E & RowDataPacket>({
        sql,
        params,
        className,
        method,
    }: QueryAttributes): Promise<E[]> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info(className, method, undefined, { sql, params }, '');

            const [result] = await conn.query<T[]>(sql, params);

            return <E[]>(<unknown>result);
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            throw error;
        }
    }

    async insert<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info(className, method, undefined, { data }, '');

            let sql = `INSERT INTO ${tableName} `;
            sql += `(${this.makeFieldList(data)}) `;
            sql += `VALUES (${this.makeQuestionMarkParam(data)});`;

            const params = this.makeParamsArray(data);

            this._logger.info('', '', undefined, { sql, params }, 'SQL');

            const [{ insertId }] = await conn.query<ResultSetHeader>(sql, params);
            data.id = insertId;

            return data;
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            throw error;
        }
    }

    async update<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info(className, method, undefined, { data }, '');

            let sql = `UPDATE ${tableName} SET `;
            sql += ` ${this.makeKeyValueList(data)} `;
            sql += 'WHERE id = :id;';

            await conn.query(sql, data);

            return data;
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            throw error;
        }
    }

    private makeFieldList<T>(data: T): string {
        return Object.entries(data as object)
            .map<string>(([key, value]) => key)
            .join(', ');
    }

    private makeQuestionMarkParam<T>(data: T): string {
        const length = Object.keys(data as object).length;
        const qm = [];
        for (let i = 0; i < length; i++) {
            qm.push('?');
        }
        return qm.join(', ');
    }

    private makeKeyValueList<T>(data: T): string {
        return Object.entries(data as object)
            .map(([key, value]) => `${key} = :${key}`)
            .join(', ');
    }

    private makeParamsArray<T>(data: T): any[] {
        return Object.entries(data as object).map<any>(([key, value]) => value);
    }
}
