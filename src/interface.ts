export interface IEvent {
  event: EventType;
}

export interface EventType {
  Records: SQSRecord[];
  RecordsLock?: SQSRecord[];
  body?: string;
}

export interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: SQSRecordAttributes;
  messageAttributes: SQSMessageAttributes;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}
export interface SQSRecordAttributes {
  ApproximateReceiveCount: string;
  SentTimestamp: string;
  SenderId: string;
  ApproximateFirstReceiveTimestamp: string;
}
export interface SQSMessageAttributes {
  [name: string]: SQSMessageAttribute;
}
export interface SQSMessageAttribute {
  stringValue?: string;
  binaryValue?: string;
  stringListValues: never[];
  binaryListValues: never[];
  dataType: SQSMessageAttributeDataType;
}

export type SQSMessageAttributeDataType =
  | "String"
  | "Number"
  | "Binary"
  | string;
