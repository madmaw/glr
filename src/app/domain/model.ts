import {
  field,
  list,
  literal,
  numberBuilder,
  record,
  stringBuilder,
} from 'base/type/builder';

export type ImageId = string;

export type DocumentId = string;
const documentIdBuilder = literal<DocumentId>();
export const documentIdTypeDef = documentIdBuilder.typeDef;

const channelBuilder = record()
  .add(
    'name',
    field(stringBuilder),
  )
  // a well-known type id that describes the data being encoded in this channel
  .add(
    'type',
    field(numberBuilder),
  );
export const channelTypeDef = channelBuilder.typeDef;
export type MutableChannel = typeof channelBuilder.aValue;
export type Channel = typeof channelBuilder.readonlyOf.aValue;

const documentBuilder = record()
  .add(
    'id',
    field(documentIdBuilder).readonly(),
  )
  .add(
    'width',
    field(numberBuilder),
  )
  .add(
    'height',
    field(numberBuilder),
  )
  .add(
    'channels',
    field(list(channelBuilder)).readonly(),
  );
export const documentTypeDef = documentBuilder.typeDef;
export type MutableDocument = typeof documentBuilder.aValue;
export type Document = typeof documentBuilder.readonlyOf.aValue;
