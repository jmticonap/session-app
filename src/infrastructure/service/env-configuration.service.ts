import { inject, singleton } from 'tsyringe';
import ConfigurationService from '../../domain/service/configuration.service';
import Configuration from '../../types/configuration';
import { env } from 'node:process';
import { EnvironmentType } from '../../types';
import PowerToolsLogger from '../logger/power-tools.logger';
import Logger from '../logger/logger';

const className = 'EnvConfigurationService';

@singleton()
export default class EnvConfigurationService implements ConfigurationService {
    private _config: Configuration;

    constructor(@inject(PowerToolsLogger) private _logger: Logger) {
        this._config = {
            env: <EnvironmentType>env.NODE_ENV || 'local',
            mysql: {
                host: env.MYSQL_HOST || 'localhost',
                port: env.MYSQL_PORT || '3306',
                user: env.MYSQL_USER || 'root',
                password: env.MYSQL_PASSWORD || 'root',
                database: env.MYSQL_SATABASE || 'sessiondb',
            },
        };

        this._logger.info(className, 'constructor', undefined, this._config, 'EnvConfigurationService setup ready');
    }

    get(): Configuration {
        return this._config;
    }
}
