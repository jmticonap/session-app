import { Lifecycle, inject, scoped } from 'tsyringe';
import mysql, { Connection, ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import ConectionManager from '../conection-manager';
import Logger from '../../logger/logger';
import ConfigurationService from '../../../domain/service/configuration.service';
import { MysqlConfiguration } from '../../../types/configuration';
import PowerToolsLogger from '../../logger/power-tools.logger';
import EnvConfigurationService from '../../service/env-configuration.service';

interface ConnectionMysql extends RowDataPacket {
    backendid: number;
}

const className = 'MysqlConectionManager';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlConectionManager implements ConectionManager {
    private cnf: MysqlConfiguration;
    private _connection: Connection | undefined;

    constructor(
        @inject(PowerToolsLogger) private _logger: Logger,
        @inject(EnvConfigurationService) private _config: ConfigurationService,
    ) {
        this.cnf = this._config.get().mysql;
    }

    async getConnection(config?: ConnectionOptions): Promise<Connection> {
        const method = this.getConnection.name;
        try {
            const cnnOpt: ConnectionOptions = {
                host: this.cnf.host,
                port: +this.cnf.port,
                user: this.cnf.user,
                password: this.cnf.password,
                database: this.cnf.database,
                connectTimeout: 10_000,
            };
            this._connection = await mysql.createConnection(config || cnnOpt);

            const [rows] = await this._connection.query<ConnectionMysql[]>('SELECT CONNECTION_ID() as backendid');
            this._logger.info(
                className,
                method,
                undefined,
                { databaseConnection: { connected: true, id: rows[0].backendid } },
                `Connection with id ${rows[0].backendid} has been created.`,
            );

            return this._connection;
        } catch (error) {
            this._logger.error(className, method, undefined, {}, '', <Error>error);
            throw error;
        }
    }
}
