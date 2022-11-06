/**
 * returns the formatted date in "de-CH" from an isoString
 * @param isoString 
 * @returns 
 */
export function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('de-CH', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}