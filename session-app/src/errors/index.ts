import { HTTP_STATUS } from '../constants';

export class SessionError extends Error {
    constructor(message: string, public statusCode: number = HTTP_STATUS['BAD_REQUEST']) {
        super(message);
    }
}
