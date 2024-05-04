import { EnvironmentType } from './index';

export type MysqlConfiguration = {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
};

type Configuration = {
    env: EnvironmentType;
    mysql: MysqlConfiguration;
};

export default Configuration;
