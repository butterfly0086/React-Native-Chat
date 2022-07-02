import type { Schema, schema } from './schema';

export type Table = keyof typeof schema;

export type PreparedQueries = [string] | [string, Array<any> | Array<Array<any>>];

export type ChannelRow = Schema['channels'];
export type MessageRow = Schema['messages'];
export type QueryChannelsMapRow = Schema['queryChannelsMap'];
export type ReactionRow = Schema['reactions'];
export type ReadRow = Schema['reads'];
export type MemberRow = Schema['members'];

export type JoinedReadRow = Schema['reads'] &
  {
    [K in keyof Schema['users'] as `users__${K}`]: Schema['users'][K];
  };

export type UserRow = Schema['users'];

export type StorableDatabaseRow = Partial<
  ChannelRow | MessageRow | QueryChannelsMapRow | ReactionRow
>;
