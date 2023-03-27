# SQL Query Builder

A simple SQL query builder for CRUD operations that was initially designed for SQL Server but can be used for other SQL Databases.

## Documentation
* [Select](#buildSelectQuery)
* [Insert](#buildInsertQuery)
* [Update](#buildUpdateQuery)
* [Delete](#buildDeleteQuery)

## buildSelectQuery
```javascript
const selectQuery = buildSelectQuery({
  top: 1,
  fields: ['id', 'firstname', 'lastname'],
  from: 'Users',
  where: [{ key: 'id', value: 1 }],
})

// returns:
// {
//   query: 'SELECT id, firstname, lastname FROM Users WHERE id = @id_W_0;',
//   queryParameters: [ { key: 'id_W_0', value: 1, type: null } ]
// }
```

## buildInsertQuery
```javascript
const insertQuery = buildInsertQuery({
  into: 'Users',
  fields: [
    { key: 'firstname', value: 'John' },
    { key: 'lastName', value: 'Doe' },
  ],
})

// returns:
// {
//   query: 'INSERT INTO Users (firstname, lastName) VALUES (@firstname, @lastName);',
//   queryParameters: [
//     { key: 'firstname', value: 'John' },
//     { key: 'lastName', value: 'Doe' }
//   ]
// }
```

## buildUpdateQuery
```javascript
const updateQuery = buildUpdateQuery({
  table: 'Users',
  fields: [
    { key: 'username', value: 'Joe' },
    { key: 'lastName', value: 'Black' },
  ],
  where: [{ key: 'id', value: 1 }],
})

// returns:
// {
//   query: 'UPDATE Users SET username = @username, lastName = @lastName WHERE id = @id_W_0;',
//   queryParameters: [
//     { key: 'username', value: 'Joe' },
//     { key: 'lastName', value: 'Black' },
//     { key: 'id_W_0', value: 1, type: null }
//   ]
// }
```

## buildDeleteQuery
```javascript
const deleteQuery = buildDeleteQuery({
  from: 'Users',
  where: [{ key: 'id', value: 1 }],
})

// returns:
// {
//   query: 'DELETE FROM Users WHERE id = @id_W_0;',
//   queryParameters: [ { key: 'id_W_0', value: 1, type: null } ]
// }
```

## Limitations
Currently it does not support SQL joins.

## WARNING
Currently the input values for the parameters **top**, **into**, **table**, **fields** (from [buildSelectQuery](#buildSelectQuery)) are not sanitized! Thus SQL injections can occur if not treated accordingly.