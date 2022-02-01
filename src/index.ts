import Redlock, { Lock, Options, CompatibleRedisClient } from 'redlock';
import { IEvent, SQSRecord } from './interface';

export function MiddlewareLock(
  prefix: string,
  param: string,
  connection: CompatibleRedisClient,
  ttl?: number,
  options?: Options,
) {
  const before = async (request: IEvent) => {
    if (connection) {
      const optionsRedlock = options || {
        driftFactor: 0.1,
        retryCount: 1,
      };
      const redLockClient: Redlock = new Redlock([connection], optionsRedlock);

      const redlock: { lock: Lock | undefined } = { lock: undefined };

      if (request.event.Records) {
        request.event.RecordsLock = [];
        for (const [index, record] of request.event.Records.entries()) {
          try {
            const data = JSON.parse(record.body);
            redlock.lock = await lock(
              redLockClient,
              `${prefix}:${data[param]}`,
              ttl,
            );
            Object.assign(record, redlock);
          } catch (error) {
            request.event.RecordsLock.push(record);
            request.event.Records.splice(index, 1);
          }
        }
      }

      if (request.event.body) {
        const data = JSON.parse(request.event.body);
        redlock.lock = await lock(
          redLockClient,
          `${prefix}:${data[param]}`,
          ttl,
        );
        Object.assign(request.event, redlock);
      }
    }
  };

  const after = async (request: IEvent) => {
    const timeNow = new Date().getTime();
    if (request.event.Records) {
      for (const record of request.event.Records) {
        if (record.lock?.expiration >= timeNow) {
          await record.lock.unlock();
        }
      }

      if (request.event?.RecordsLock && request.event?.RecordsLock.length > 0) {
        return {
          batchItemFailures: request.event?.RecordsLock.map(
            (record: SQSRecord) => ({
              itemIdentifier: record.messageId,
            }),
          ),
        };
      }
    } else if (
      request.event.lock &&
      request.event.lock?.expiration >= timeNow
    ) {
      await request.event.lock.unlock();
    }
  };

  const onError = async (request: IEvent) => {
    throw `Error Lock/Unlock: ${JSON.stringify(request.error)}`;
  };

  async function lock(
    redLockClient: Redlock,
    lockId: string,
    ttl = 7500,
  ): Promise<Lock> {
    return redLockClient.lock(`LOCKS:${lockId}`, ttl);
  }

  return {
    before,
    after,
    onError,
  };
}
