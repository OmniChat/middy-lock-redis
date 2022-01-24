import { Options, CompatibleRedisClient } from "redlock";
import { IEvent } from "./interface";
export declare function MiddlewareLock(param: string, connection: CompatibleRedisClient, ttl?: number, options?: Options): {
    before: (request: IEvent) => Promise<void>;
    after: (request: any) => Promise<{
        batchItemFailures: any;
    } | undefined>;
    onError: (request: any) => Promise<never>;
};
