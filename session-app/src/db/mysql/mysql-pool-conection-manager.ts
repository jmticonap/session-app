import { inject, singleton } from 'tsyringe';
import mysql, { PoolConnection, RowDataPacket, PoolOptions } from 'mysql2/promise';
import ConectionManager from '../conection-manager';
import PowerToolsLogger from '../../infrastructure/logger/power-tools.logger';
import Logger from '../../infrastructure/logger/logger';
import EnvConfigurationService from '../../infrastructure/service/env-configuration.service';
import ConfigurationService from '../../domain/service/configuration.service';
import { MysqlConfiguration } from '../../types/configuration';

interface ConnectionMysql extends RowDataPacket {
    backendid: number;
}

const className = 'MysqlConectionManager';

@singleton()
export default class MysqlPoolConectionManager implements ConectionManager {
    private cnf: MysqlConfiguration;
    private _poolConnection: PoolConnection | undefined;

    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(EnvConfigurationService) private _config: ConfigurationService,
    ) {
        this.cnf = this._config.get().mysql;
    }

    async getConnection(config?: PoolOptions): Promise<PoolConnection> {
        const method = this.getConnection.name;
        try {
            if (this._poolConnection) return this._poolConnection;
            const cnnOpt: PoolOptions = {
                host: this.cnf.host,
                port: +this.cnf.port,
                user: this.cnf.user,
                password: this.cnf.password,
                database: this.cnf.database,
                connectTimeout: 10_000,
                connectionLimit: 10,
            };
            this._logger.info(className, method, undefined, config || cnnOpt, 'Connection pool data');
            this._poolConnection = await mysql.createPool(config || cnnOpt).getConnection();

            const [rows] = await this._poolConnection.query<ConnectionMysql[]>('SELECT CONNECTION_ID() as backendid');
            this._logger.info(
                className,
                method,
                undefined,
                { databaseConnection: { connected: true, id: rows[0].backendid } },
                `Connection with id ${rows[0].backendid} has been created.`,
            );

            return this._poolConnection;
        } catch (error) {
            this._logger.error(className, method, undefined, {}, 'Error open connection pool', <Error>error);
            throw error;
        }
    }
}
