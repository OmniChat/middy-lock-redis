"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareLock = void 0;
const redlock_1 = __importDefault(require("redlock"));
function MiddlewareLock(param, connection, ttl, options) {
    const before = async (request) => {
        if (connection) {
            const optionsRedlock = options || {
                driftFactor: 0.1,
                retryCount: 1,
            };
            const redLockClient = new redlock_1.default([connection], optionsRedlock);
            const redlock = { lock: undefined };
            if (request.event.Records) {
                request.event.RecordsLock = [];
                for (const [index, record] of request.event.Records.entries()) {
                    try {
                        const data = JSON.parse(record.body);
                        redlock.lock = await lock(redLockClient, data[param], ttl);
                        Object.assign(record, redlock);
                    }
                    catch (error) {
                        request.event.RecordsLock.push(record);
                        request.event.Records.splice(index, 1);
                    }
                }
            }
            if (request.event.body) {
                const data = JSON.parse(request.event.body);
                redlock.lock = await lock(redLockClient, data[param], ttl);
                Object.assign(request.event, redlock);
            }
        }
    };
    const after = async (request) => {
        const timeNow = new Date().getTime();
        if (request.event.Records) {
            for (const record of request.event.Records) {
                if (record.lock?.expiration >= timeNow) {
                    await record.lock.unlock();
                }
            }
            if (request.event?.RecordsLock.length > 0) {
                return {
                    batchItemFailures: request.event?.RecordsLock.map((record) => ({
                        itemIdentifier: record.messageId,
                    })),
                };
            }
        }
        else if (request.event.lock?.expiration >= timeNow) {
            await request.event.lock.unlock();
        }
    };
    const onError = async (request) => {
        throw `Error Lock/Unlock: ${JSON.stringify(request.error)}`;
    };
    async function lock(redLockClient, lockId, ttl = 7500) {
        return redLockClient.lock(`LOCKS:${lockId}`, ttl);
    }
    return {
        before,
        after,
        onError,
    };
}
exports.MiddlewareLock = MiddlewareLock;
//# sourceMappingURL=index.js.map