import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export default interface BaseUseCase {
    execute<T>(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult | T>;
}
