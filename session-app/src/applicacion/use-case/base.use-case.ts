import { APIGatewayProxyResult } from 'aws-lambda';

export default interface BaseUseCase {
    execute<T>(): Promise<APIGatewayProxyResult | T>;
}
