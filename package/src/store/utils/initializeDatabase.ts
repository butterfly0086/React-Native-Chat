import { closeDB } from './closeDB';
import { dropTables } from './dropTables';
import { executeQueries } from './executeQueries';

import { openDB } from './openDB';

import { DB_NAME, DB_VERSION } from '../constants';
import { schema } from '../schema';
import type { Table } from '../types';

const createCreateTableQuery = (table: Table) => {
  const columnsWithDescriptors = Object.entries(schema[table]).map((entry) => {
    const [key, value] = entry;
    return `${key} ${value}`;
  });

  return `CREATE TABLE IF NOT EXISTS ${table}(
  ${columnsWithDescriptors.join(',\n')}
  );`;
};

export const initializeDatabase = () => {
  const version = getUserPragmaVersion();
  if (version < DB_VERSION) {
    console.log(
      `Dropping the table since version ${version} is less than DB_VERSION ${DB_VERSION}`,
    );
    dropTables();
    updateUserPragmaVerion(version + 1);
  }

  executeQueries([
    [createCreateTableQuery('queryChannelsMap')],
    [createCreateTableQuery('channels')],
    [createCreateTableQuery('messages')],
    [createCreateTableQuery('reactions')],
  ]);
};

export const updateUserPragmaVerion = (version: number) => {
  openDB();

  sqlite.executeSql(DB_NAME, `PRAGMA user_version = ${version}`, []);

  closeDB();
};

export const getUserPragmaVersion = () => {
  openDB();

  const { message, rows, status } = sqlite.executeSql(DB_NAME, `PRAGMA user_version`, []);

  closeDB();
  if (status === 1) {
    console.error(`Querying for user_version failed: ${message}`);
  }

  // eslint-disable-next-line no-underscore-dangle
  const result = rows ? rows._array : [];

  return result[0].user_version as number;
};
