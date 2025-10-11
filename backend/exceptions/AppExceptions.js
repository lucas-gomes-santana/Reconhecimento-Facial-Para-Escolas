export class NotFoundException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        this.name = 'NotFoundException';
    }
}

export class PermissionDeniedException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        this.name = 'PermissionDeniedException';
    }
}

export class InvalidFunctionException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = 'InvalidFunctionException';
    }
}

export class AlreadyExistsException extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 409;
        this.name = 'AlreadyExistsException';
    }
}