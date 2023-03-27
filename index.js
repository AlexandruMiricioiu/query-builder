const {
  buildSelectQuery,
  buildInsertQuery,
  buildUpdateQuery,
  buildDeleteQuery,
} = require('./queryBuilder')


const selectQuery = buildSelectQuery({
  fields: ['id', 'firstname', 'lastname'],
  from: 'Users',
  where: [{ key: 'id', value: 1 }],
})


const insertQuery = buildInsertQuery({
  into: 'Users',
  fields: [
    { key: 'firstname', value: 'John' },
    { key: 'lastName', value: 'Doe' },
  ],
})


const updateQuery = buildUpdateQuery({
  table: 'Users',
  fields: [
    { key: 'username', value: 'Joe' },
    { key: 'lastName', value: 'Black' },
  ],
  where: [{ key: 'id', value: 1 }],
})


const deleteQuery = buildDeleteQuery({
  from: 'Users',
  where: [{ key: 'id', value: 1 }],
})