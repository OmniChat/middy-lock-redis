import { Options, CompatibleRedisClient } from "redlock";
export declare function MiddlewareLock(param: string, connection: CompatibleRedisClient, ttl?: number, options?: Options): {
    before: (request: any) => Promise<void>;
    after: (request: any) => Promise<void>;
    onError: (request: any) => Promise<never>;
};
