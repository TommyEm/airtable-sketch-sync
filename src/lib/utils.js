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


/**
 * Strip AST formatted strings from markdown syntax
 * @param {object} data
 * @param {array} accData
 * @returns {array}
 */
export function stripMarkdownFromText(data, accData) {
	const arrData = Array.isArray(data) ? data : Object.values(data);

	return arrData.reduce((acc, curr) => {
		if ((curr.type === 'Str' || curr.type === 'Code') && curr.value) {
			accData.push(curr.value);
			return accData;

		} else if (curr.type && curr.type !== 'Definition') {
			return stripMarkdownFromText(curr.children, accData);

		} else {
			return accData;
		}
	}, []);
}



/**
 * Returns the substring from the beginning of a string, until an eventual "—" character
 * @param {string} name
 * @returns {string}
 */
export function getCleanArtboardName(name) {
	const reg = /([^—]+)/;
	const regArray = name.match(reg);
	return regArray[1];
}