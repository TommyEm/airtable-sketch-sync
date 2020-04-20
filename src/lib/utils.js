export function getApiEndpoint(base, table, maxRecords, view, APIKey) {
    return encodeURI(`https://api.airtable.com/v0/${base}/${table}?maxRecords=${maxRecords}&view=${view}&api_key=${APIKey}`);
}