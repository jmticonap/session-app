import { Route } from '@middy/http-router';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../presentation/handler';

const routes: Route<APIGatewayProxyEvent>[] = [
    {
        method: 'GET',
        path: '/hello',
        handler,
    },
];

export default routes;
