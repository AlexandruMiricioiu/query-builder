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
  top: 10,
  fields: ['id', 'firstname', 'lastname'],
  from: 'Users',
  where: [
    { key: 'id', value: 1 },
    { key: 'firstname', value: ['John', 'Joe'] },
  ],
  between: [
    { key: 'age', lowerValue: 23, upperValue: 30 }
  ]
})

// returns:
// {
//   query: 'SELECT TOP 10 id, firstname, lastname FROM Users
//           WHERE id = @id_W_0 AND firstname IN (@firstname_IN_0,@firstname_IN_1)
//           AND age BETWEEN @age_B_0_LOWER AND @age_B_0_UPPER;',
//   queryParameters: [
//     { key: 'id_W_0', value: 1, type: null },
//     { key: 'firstname_IN_0', value: 'John', type: null },
//     { key: 'firstname_IN_1', value: 'Joe', type: null },
//     { key: 'age_B_0_LOWER', value: 23, type: null },
//     { key: 'age_B_0_UPPER', value: 30, type: null }
//   ]
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