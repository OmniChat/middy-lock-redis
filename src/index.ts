import Redlock, { Lock, Options, CompatibleRedisClient } from "redlock";

export function MiddlewareLock(
  param: string,
  connection: CompatibleRedisClient,
  ttl?: number,
  options?: Options
) {
  const before = async (request: any) => {
    if (connection) {
      const optionsRedlock = options || {
        driftFactor: 0.1,
        retryCount: 1,
      };
      const redLockClient: Redlock = new Redlock([connection], optionsRedlock);

      const redlock: { lock: Lock | undefined } = { lock: undefined };
      if (request.event.Records) {
        for (const record of request.event.Records) {
          const data = JSON.parse(record.body);
          redlock.lock = await lock(redLockClient, data[param], ttl);
          Object.assign(record, redlock);
        }
      }

      if (request.event.body) {
        const data = JSON.parse(request.event.body);
        redlock.lock = await lock(redLockClient, data[param], ttl);
        Object.assign(request.event, redlock);
      }
    }
  };

  const after = async (request: any) => {
    if (request.event.Records) {
      for (const record of request.event.Records) {
        if (record.lock) {
          record.lock.unlock();
        }
      }
    }

    if (
      request.event.lock &&
      request.event.lock.expiration >= new Date().getTime()
    ) {
      await request.event.lock.unlock();
    }
  };

  const onError = async (request: any) => {
    throw `Error Lock/Unlock: ${JSON.stringify(request.error)}`;
  };

  async function lock(
    redLockClient: Redlock,
    lockId: string,
    ttl = 7500
  ): Promise<Lock> {
    return redLockClient.lock(`LOCKS:${lockId}`, ttl);
  }

  return {
    before,
    after,
    onError,
  };
}
