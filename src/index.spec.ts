import { MiddlewareLock } from './index';
import { CompatibleRedisClient } from 'redlock';
import { IHttp, ISqs } from './interface';

const request: IHttp = {
  event: {
    body: JSON.stringify({
      chatId: 'chatId',
    }),
    lock: {
      expiration: new Date().getTime() + 1000000000,
      unlock: () => new Promise(() => {}),
    },
  },
};

const requestSqs: ISqs = {
  event: {
    Records: [
      {
        messageId: 'messageId',
        body: JSON.stringify({
          chatId: 'chatId',
        }),
        lock: {
          expiration: new Date().getTime() + 1000000000,
          unlock: () =>
            new Promise((resolve) => {
              resolve();
            }),
        },
      },
    ],
    RecordsLock: undefined,
  },
};

const mockUnlock = jest.fn(() => true);
const mockLock = jest.fn(() => ({
  unlock: mockUnlock,
}));

jest.mock('redlock', () =>
  jest.fn().mockImplementation(() => ({
    lock: mockLock,
  })),
);

const client: CompatibleRedisClient = {
  eval: () => {},
};

describe('MiddlewareLock test', () => {
  it('invoke before middleware by http request', async () => {
    const response = MiddlewareLock('MESSAGE', 'chatId', client);
    await response.before(request);
    expect(mockLock).toHaveBeenCalledWith('LOCKS:MESSAGE:chatId', 7500);
  });
  it('invoke before middleware by SQS', async () => {
    const response = MiddlewareLock('MESSAGE', 'chatId', client, 10);
    await response.before(requestSqs);
    expect(mockLock).toHaveBeenCalledWith('LOCKS:MESSAGE:chatId', 10);
  });

  it('invoke after middleware by http request', async () => {
    const response = MiddlewareLock('MESSAGE', 'chatId', client);
    const afterResponse = await response.after(request);

    expect(afterResponse).toBeUndefined();
  });
  it('invoke after middleware by SQS', async () => {
    const response = MiddlewareLock('MESSAGE', 'chatId', client);

    const afterResponse = await response.after(requestSqs);

    expect(afterResponse).toBeUndefined();
  });
  it('invoke after middleware and return SQS queue', async () => {
    const response = MiddlewareLock('MESSAGE', 'chatId', client);
    requestSqs.event.RecordsLock = Object.assign([], requestSqs.event.Records);
    requestSqs.event.Records.length = 0;
    const afterResponse = await response.after(requestSqs);

    expect(afterResponse).toEqual({
      batchItemFailures: [{ itemIdentifier: 'messageId' }],
    });
  });
});
