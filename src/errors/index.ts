import { HTTP_STATUS } from '../constants';

export class SessionError extends Error {
    constructor(message: string, public statusCode: number = HTTP_STATUS['BAD_REQUEST']) {
        super(message);
    }
}

export class BadRequestError extends SessionError {
    constructor() {
        super('BadRequest');
    }
}

export class SchemaValidationError extends SessionError {
    constructor(message = 'Error validating') {
        super(message);
    }
}
