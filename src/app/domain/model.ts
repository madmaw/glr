import { ListDescriptor } from 'base/descriptor/list';
import {
  LiteralDescriptor,
  stringDescriptor,
  unsignedIntegerDescriptor,
} from 'base/descriptor/literal';
import { RecordDescriptor } from 'base/descriptor/record';

export type DocumentId = string;

export type ImageId = string;

export const documentIdDescriptor = new LiteralDescriptor<DocumentId>();

export const channelDescriptor = new RecordDescriptor({
  name: stringDescriptor,
  // a well-known type id that describes the data being encoded in this channel
  type: unsignedIntegerDescriptor,
});

export type Channel = typeof channelDescriptor.aReadonly;
export type MutableChannel = typeof channelDescriptor.aMutable;

export const documentDescriptor = new RecordDescriptor({
  id: documentIdDescriptor,
  width: unsignedIntegerDescriptor,
  height: unsignedIntegerDescriptor,
  channels: new ListDescriptor(channelDescriptor),
});

export type Document = typeof documentDescriptor.aReadonly;
export type MutableDocument = typeof documentDescriptor.aMutable;
