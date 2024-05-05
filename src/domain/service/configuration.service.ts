import Configuration from '../../types/configuration';

export default interface ConfigurationService {
    get(): Configuration;
}
