# OmniChat Middy Lock Redis

Custom middleware created to lock redis on input and unlock on output lambda execution

Note - designed for use in HTTP and SQS functions

## Install

To install this middleware you can use NPM:

```ssh
$ npm install --save @omnichat/middy-lock-redis
```

## Usage Example

```typescript
import middy from "@middy/core";
import { MiddlewareLock } from "@omnichat/middy-lock-redis";

export const baseHandler = async (event) => {
  return {
    statusCode: 200,
    headers: {},
    body: event.body,
  };
};

exports.handler = middy(baseHandler).use(
  MiddlewareLock("key", CompatibleRedisClient, ttl, options)
);
```
