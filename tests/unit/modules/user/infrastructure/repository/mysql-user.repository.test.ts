import 'reflect-metadata';
import MysqlUserRepository from '../../../../../../src/modules/user/infrastructure/repository/mysql-user.repository';
import PowerToolsLogger from '../../../../../../src/infrastructure/logger/power-tools.logger';
import MysqlExecutor from '../../../../../../src/infrastructure/db/mysql/mysql-executor';
import UserEntity from '../../../../../../src/modules/user/domain/entity/user.entity';
import MysqlPoolConectionManager from '../../../../../../src/infrastructure/db/mysql/mysql-pool-conection-manager';
import EnvConfigurationService from '../../../../../../src/infrastructure/service/env-configuration.service';

const executorQueryMock = jest.fn();
const executorInsertMock = jest.fn();
const executorUpdateMock = jest.fn();
const poolConnectionQueryMock = jest.fn();

jest.mock('../../../../../../src/infrastructure/db/mysql/mysql-pool-conection-manager', () => {
    return jest.fn().mockImplementation(() => {
        return {
            getConnection: jest.fn().mockImplementation(() => ({
                query: poolConnectionQueryMock,
            })),
        };
    });
});
jest.mock('../../../../../../src/infrastructure/db/mysql/mysql-executor', () => {
    return jest.fn().mockImplementation(() => {
        return {
            query: executorQueryMock,
            insert: executorInsertMock,
            update: executorUpdateMock,
        };
    });
});
jest.mock('../../../../../../src/infrastructure/logger/power-tools.logger', () => {
    return jest.fn().mockImplementation(() => {
        return {
            setContext: jest.fn(),
            extractExtraInfo: jest.fn(),
            replaceParams: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
            debug: jest.fn(),
        };
    });
});

const logger = new PowerToolsLogger();
const config = new EnvConfigurationService(logger);
const poolManager = new MysqlPoolConectionManager(logger, config);
const executor = new MysqlExecutor(logger, poolManager);

describe('MysqlUserRepository test suit', () => {
    let sut: MysqlUserRepository;

    beforeEach(() => {
        sut = new MysqlUserRepository(logger, executor);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('returns a list of users', async () => {
            const users: UserEntity[] = [
                {
                    id: 1,
                    firstname: 'Mia Mauren',
                    lastname: 'Ticona Verdeguer',
                    age: 16,
                    dni: '234567891',
                    phone: null,
                },
                {
                    id: 2,
                    firstname: 'Donovan Ian',
                    lastname: 'Ticona Verdeguer',
                    age: 9,
                    dni: '123456789',
                    phone: null,
                },
            ];
            executorQueryMock.mockResolvedValue(users);
            const actual = await sut.findAll();

            expect(actual).toEqual(users);
        });

        it("returns an empty array if don't find records", async () => {
            executorQueryMock.mockResolvedValue([]);
            const actual = await sut.findAll();

            expect(actual).toEqual([]);
        });

        it('throw an exception if query throw it one', async () => {
            executorQueryMock.mockRejectedValue(new Error('error'));

            await expect(sut.findAll()).rejects.toThrow();
        });
    });

    describe('findById', () => {
        it('returns a user object for a id recorded', async () => {
            const userOne = <UserEntity>{
                id: 1,
                firstname: 'Donovan Ian',
                lastname: 'Ticona Verdeguer',
                age: 9,
                dni: '123456789',
            };
            executorQueryMock.mockResolvedValue([userOne]);

            const actual = await sut.findById(1);
            expect(actual).toEqual(userOne);
            expect(executorQueryMock).toHaveBeenCalledTimes(1);
        });

        it('returns an undefined value for a non id recorded', async () => {
            executorQueryMock.mockResolvedValue([]);

            const actual = await sut.findById(1);
            expect(actual).toBeUndefined();
            expect(executorQueryMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('insert', () => {
        it("returns the user object with it's new id", async () => {
            const user = {
                firstname: 'Donovan Ian',
                lastname: 'Ticona Verdeguer',
                age: 9,
                dni: '123456789',
                phone: null,
            };

            executorInsertMock.mockResolvedValue({ id: 1, ...user });
            const actual = await sut.insert(user);

            expect(actual).toEqual({ id: 1, ...user });
        });

        it('throws an error if execute throw it one', async () => {
            const user = {
                firstname: 'Donovan Ian',
                lastname: 'Ticona Verdeguer',
                age: 9,
                dni: '123456789',
                phone: null,
            };

            executorInsertMock.mockRejectedValue(new Error());

            await expect(sut.insert(user)).rejects.toThrow();
        });
    });

    describe('update', () => {
        it('returns the user object with new values', async () => {
            const user = {
                id: 1,
                firstname: 'Donovan Ian',
                lastname: 'Ticona Verdeguer',
                age: 9,
                dni: '123456789',
                phone: '999555111',
            };

            executorUpdateMock.mockResolvedValue(user);
            const actual = await sut.update(user);

            expect(actual).toEqual(user);
        });

        it('throws an error if execute throw it one', async () => {
            const user = {
                id: 1,
                firstname: 'Donovan Ian',
                lastname: 'Ticona Verdeguer',
                age: 9,
                dni: '123456789',
                phone: null,
            };

            executorUpdateMock.mockRejectedValue(new Error());

            await expect(sut.update(user)).rejects.toThrow();
        });
    });
});
