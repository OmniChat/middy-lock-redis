type Callback<T> = (err: any, value?: T) => void;

export interface IHttp {
  event: { body: string; lock?: Lock };
}

export interface ISqs {
  event: {
    Records: SQSRecord[] | [];
    RecordsLock?: SQSRecord[];
  };
}

export interface SQSRecord {
  messageId: string;
  body: string;
  lock?: Lock;
}

export interface Lock {
  expiration: number;
  unlock(callback?: Callback<void>): Promise<void>;
}
