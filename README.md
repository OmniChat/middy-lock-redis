# Middy Lock Redis

Custom middleware created to lock redis on input and unlock on output lambda execution

Note - designed for use in HTTP and SQS functions

![Fluxo](https://raw.githubusercontent.com/OmniChat/middy-lock-redis/main/image/fluxo2.png)

## Install

To install this middleware you can use NPM:

```ssh
$ npm install --save @omnichat/middy-lock-redis
```

## Usage Example

```typescript
import middy from '@middy/core';
import { MiddlewareLock } from '@omnichat/middy-lock-redis';
import { Redis } from 'ioredis';

const redis = new Redis({
    host: http://localhost/,
    port: 6379,
});

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

## Parameters

- `prefix (required)` - Prefix for mounting the key in the registry lock
- `param (required)` - Name of the parameter that will be retrieved from the request to be used as a registry lock key
- `connection (required)` - Redis client connection that will be used by redlock
- `ttl (optional)` - Lock expiration time, if not informed the default is 7500
- `options (optional)` - Redlock options configuration for more information on the options see the redlock doc [here](https://github.com/mike-marcacci/node-redlock). Default value if not informed is:

```typescript
{
driftFactor: 0.1,
retryCount: 1,
};
```

## Run test

To run the unit tests, run following command

```bash
  npm run test
```

## Libraries

Used:

- [redlock](https://github.com/mike-marcacci/node-redlock)

Dependence:

- [Middy](https://github.com/middyjs/middy)
- [ioredis](https://github.com/luin/ioredis)

Obs: if you have an installation problem of not having the redlock library, you will have to install it in your project

## Credits

Created by [@fzanfolim](https://github.com/fzanfolim) in OmniChat Squad Bot
