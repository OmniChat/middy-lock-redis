# OmniChat Middy Lock Redis

Custom middleware created to lock redis on input and unlock on output lambda execution

Note - designed for use in HTTP and SQS functions

![Fluxo](https://raw.githubusercontent.com/OmniChat/middy-lock-redis/readme/image/fluxo2.png)

## Install

To install this middleware you can use NPM:

```ssh
$ npm install --save @omnichat/middy-lock-redis
```

## Usage Example

```typescript
import middy from '@middy/core';
import { MiddlewareLock } from '@omnichat/middy-lock-redis';

const client: CompatibleRedisClient = {
  eval: () => {},
};

export const baseHandler = async (event) => {
  return {
    statusCode: 200,
    headers: {},
    body: event.body,
  };
};

exports.handler = middy(baseHandler).use(
  MiddlewareLock('prefix', 'key', client, ttl, options),
);
```

## Information

For use in SQS when configured in lambda, ( event > sqs > batchSize ) it is necessary to add another property which is :

functionResponseTypes: ReportBatchItemFailures

This will make it so that when you lock the record, it returns to the queue only the record that was locked.

Below is an example of SQS lambda function configuration:

```yaml
lambda-function:
  handler: src/function.handler
  events:
    - sqs:
        batchSize: 6
        functionResponseTypes: ReportBatchItemFailures
        arn:
          Fn::GetAtt:
            - Queue
            - Arn
```

## Run test

To run the unit tests, run following command

```bash
  npm run test
```

## References

- [Middy](https://github.com/middyjs/middy)
- [ioredis](https://github.com/luin/ioredis)
- [redlock](https://github.com/mike-marcacci/node-redlock)
