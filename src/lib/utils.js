export function getApiEndpoint(base, table, maxRecords, view, APIKey) {
    return encodeURI(`https://api.airtable.com/v0/${base}/${table}?maxRecords=${maxRecords}&view=${view}&api_key=${APIKey}`);
}



/**
 * Support for emojis in layer names (they will be ignored)
 * @param {string} string
 * @returns {string}
 */
export function removeEmojis(string) {
    const emojis = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;

    if (string.match(emojis)) {
        return string
            .replace(emojis, '')
            .replace('️', '') // Beware, there's an invisible character here
            .trim();

    } else {
        return string.trim();
    }
}