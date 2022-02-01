type Callback<T> = (err: any, value?: T) => void;

export interface IEvent {
  event: {
    Records?: SQSRecord[];
    RecordsLock?: SQSRecord[];
    body?: string;
    lock?: Lock;
  };
  error?: any;
}

export interface SQSRecord {
  messageId: string;
  body: string;
  lock: Lock;
}

export interface Lock {
  expiration: number;
  unlock(callback?: Callback<void>): Promise<void>;
}
