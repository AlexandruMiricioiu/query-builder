const PARAMETER_PREFIX = '@'


function buildSelectQuery({
  fields,
  from,
  where,
  between,
  orderBy,
  orderType,
  groupBy,
  top,
  distinct = false,
  offsetRows = null,
  fetchRows = null,
  optionRecompile = false
}) {
  let query = []
  let queryParameters = []

  query.push('SELECT')

  if (distinct) {
    query.push('DISTINCT')
  }

  if (top) {
    query.push(`TOP ${top}`)
  }

  query.push(fields.join(', '), `FROM ${from}`)

  if (where || between) {
    const { whereQueryParts, parameters } = buildWhereConditions(where, between)

    query = [...query, ...whereQueryParts]
    queryParameters = [...queryParameters, ...parameters]
  }

  if (groupBy) {
    query.push('GROUP BY', groupBy.join(', '))
  }

  if (orderBy) {
    query.push('ORDER BY ')

    for (let [idx, orderByKey] of Object.entries(orderBy)) {
      let orderIdx = parseInt(idx)
      let delimiter = ''

      if (orderIdx < orderBy.length - 1) {
        delimiter = ','
      }

      if (orderType && typeof orderType[orderIdx] !== 'undefined') {
        query.push(orderByKey, `${orderType[orderIdx]}${delimiter}`)
      } else {
        query.push(`${orderByKey}${delimiter}`)
      }
    }
  }

  if (offsetRows !== null) {
    query.push('OFFSET', offsetRows.toString() , 'ROWS')
  }

  if (fetchRows !== null) {
    query.push('FETCH NEXT', fetchRows.toString() , 'ROWS ONLY')
  }

  if (optionRecompile) {
    query.push(`OPTION (RECOMPILE)`)
  }

  return {
    query: query.join(' ') + ';',
    queryParameters
  }
}


function buildSelectIntoQuery({
  fields,
  into,
  from,
  where,
  between,
  top
}) {
  let query = []
  let queryParameters = []

  query.push('SELECT')

  if (top) {
    query.push(`TOP ${top}`)
  }

  query.push(fields.join(', '), `INTO ${into} FROM ${from}`)

  if (where || between) {
    const { whereQueryParts, parameters } = buildWhereConditions(where, between)

    query = [...query, ...whereQueryParts]
    queryParameters = [...queryParameters, ...parameters]
  }

  return {
    query: query.join(' ') + ';',
    queryParameters
  }
}


function buildUpdateQuery({
  table,
  fields,
  where,
  between
}) {
  let query = []
  let queryParameters = fields

  query.push(`UPDATE ${table}`, `SET`)

  for (field of fields) {
    query.push(field.key, `=`, `${PARAMETER_PREFIX}${field.key},`)
  }

  query[query.length - 1] = query[query.length - 1].replace(',', '')

  if (where || between) {
    const { whereQueryParts, parameters } = buildWhereConditions(where, between)

    query = [...query, ...whereQueryParts]
    queryParameters = [...queryParameters, ...parameters]
  }

  return {
    query: query.join(' ') + ';',
    queryParameters
  }
}


function buildDeleteQuery({
  from,
  where,
  between
}) {
  let query = []
  let queryParameters = []

  query.push(`DELETE`, `FROM ${from}`)

  if (where || between) {
    const { whereQueryParts, parameters } = buildWhereConditions(where, between)

    query = [...query, ...whereQueryParts]
    queryParameters = [...queryParameters, ...parameters]
  }

  return {
    query: query.join(' ') + ';',
    queryParameters
  }
}


function buildInsertQuery({
  into,
  fields,
  returnLastInsertId = false
}) {
  let query = []
  let queryParameters = fields

  let fieldKeys = fields.map(field => field.key).join(', ')
  let boundValues = fields
    .map((field) => `${PARAMETER_PREFIX}${field.key}`)
    .join(', ')

  query.push(
    `INSERT INTO ${into}`,
    `(${fieldKeys})`,
    `VALUES`,
    `(${boundValues})`,
  )

  if (returnLastInsertId) {
    query.push(`SELECT SCOPE_IDENTITY() AS lastInsertId`)
  }

  query.push(';')

  return {
    query: query.join(' ').replace(/\s;/, ';'),
    queryParameters
  }
}


function buildWhereConditions(where, between) {
  let whereQueryParts = []
  let parameters = []

  whereQueryParts.push(`WHERE`)

  let conditionIdx = 0

  if (where) {
    for (let [
      index,
      {
        key,
        value,
        type = null,
        comparisonOperator = '=',
        logicalOperator = 'AND',
        castAs = null,
        encapsulateStart = null,
        encapsulateEnd = null,
      },
    ] of Object.entries(where)) {
      let boundValue
      let boundValueArr = []

      if (Array.isArray(value)) {
        for (let [i, v] of Object.entries(value)) {
          boundValueArr.push(`${key}_IN_${i}`)
          parameters.push({
            key: `${key}_IN_${i}`,
            value: v,
            type,
          })
        }

        if (!comparisonOperator.includes('IN')) {
          comparisonOperator = 'IN'
        }
      } else if (value?.toString().length > 0) {
        boundValue = `${key}_W_${index}`
        parameters.push({
          key: boundValue,
          value,
          type,
        })
      }

      if (parseInt(index) > 0) {
        whereQueryParts.push(logicalOperator)
      }

      if (encapsulateStart) {
        whereQueryParts.push('(')
      }

      if (!castAs && comparisonOperator.toLowerCase() !== 'contains') {
        whereQueryParts.push(key, comparisonOperator)
      } else if (comparisonOperator.toLowerCase() === 'contains') {
        whereQueryParts.push(
          `CONTAINS(${key}, ${PARAMETER_PREFIX}${boundValue})`
        )
      } else if (castAs) {
        whereQueryParts.push(`CAST(${key} AS ${castAs})`, comparisonOperator)
      }

      if (
        boundValue &&
        !Array.isArray(value) &&
        comparisonOperator.toLowerCase() !== 'contains'
      ) {
        whereQueryParts.push(`${PARAMETER_PREFIX}${boundValue}`)
      } else if (
        boundValueArr.length > 0 &&
        comparisonOperator.toLowerCase() !== 'contains'
      ) {
        whereQueryParts.push(
          '(' +
            boundValueArr.map((i) => `${PARAMETER_PREFIX}${i}`).join(',') +
            ')'
        )
      }

      if (encapsulateEnd) {
        whereQueryParts.push(')')
      }

      conditionIdx += 1
    }
  }

  if (between) {
    for (let [index, {
      key,
      lowerValue = '',
      upperValue = '',
      type = null,
      logicalOperator = 'AND',
      castAs = null,
      encapsulateStart = null,
      encapsulateEnd = null,
    }] of Object.entries(between)) {

      let boundLowerValue = `${key}_B_${index}_LOWER`
      let boundUpperValue = `${key}_B_${index}_UPPER`

      parameters.push(
        {
          key: boundLowerValue,
          value: lowerValue,
          type
        },
        {
          key: boundUpperValue,
          value: upperValue,
          type
        }
      )

      if (parseInt(index) > 0 || conditionIdx > 0) {
        whereQueryParts.push(logicalOperator)
      }

      if (encapsulateStart) {
        whereQueryParts.push('(')
      }

      if (!castAs) {
        whereQueryParts.push(
          key,
          'BETWEEN',
          `${PARAMETER_PREFIX}${boundLowerValue}`,
          'AND',
          `${PARAMETER_PREFIX}${boundUpperValue}`
        )
      } else {
        whereQueryParts.push(
          `CAST(${key} AS ${castAs})`,
          'BETWEEN',
          `${PARAMETER_PREFIX}${boundLowerValue}`,
          'AND',
          `${PARAMETER_PREFIX}${boundUpperValue}`
        )
      }

      if (encapsulateEnd) {
        whereQueryParts.push(')')
      }

      conditionIdx += 1
    }
  }

  return {
    whereQueryParts,
    parameters
  }
}


module.exports = {
  buildSelectQuery,
  buildInsertQuery,
  buildDeleteQuery,
  buildUpdateQuery,
  buildSelectIntoQuery,
}