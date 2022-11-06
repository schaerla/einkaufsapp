import { t } from 'i18next'
import { firestore } from './firebase'
import { attributes, categories, months, unitIds } from './models'

/**
 * returns the name of the unit based on the unitId
 * @param unitId is the id from the unit
 * @returns name of the unit
 */
export function getUnitNameFromUnitId(unitId) {
    const unitData = unitIds.find(obj => {
        return obj.id === unitId
    })
    return unitData ? t(unitData.name) : ''
}

/**
 * returns the abbreviation of the unit based on the unitId
 * @param unitId is the id from the unit
 * @returns abbreviation of the unit
 */
export function getUnitAbbrevFromUnitId(unitId) {
    const unitData = unitIds.find(obj => {
        return obj.id === unitId
    })
    return unitData ? t(unitData.abbrev) : ''
}

/**
 * returns the name of the article based on the articleId
 * @param articleId is the id from the article
 * @returns name of the article
 */
export function getArticleName(articleId) {
    const articleList = JSON.parse(localStorage.getItem('articleList')) || {}
    const articleDetail = articleList.find(obj => {
        return obj.id === articleId
    })
    return articleDetail ? t(articleDetail.articleName) : ''
}

/**
 * returns the url of the article based on the articleId
 * @param articleId is the id from the article
 * @returns url from the image of an article
 */
export function getPictureUrl(articleId) {
    const articleList = JSON.parse(localStorage.getItem('articleList')) || {}
    const articleDetail = articleList.find(obj => {
        return obj.id === articleId
    })
    return articleDetail ? (articleDetail.pictureUrl) : '../assets/icon/no-photo-available.png'
}

/**
 * returns the translatet name of the category based on the id number
 * @param categories is the category id number
 * @returns name of the category
 */
export function getCategoryName(category) {
    const categoryName = categories.find(obj => {
        return obj.id === category
    })
    return categoryName ? t(categoryName.name) : ''
}

/**
 * returns the translatet month name based on the seasonNumber
 * @param seasonNumber is the months in number
 * @returns name of the the months
 */
export function getMonthsName(seasonNumber) {
    const monthsName = months.find(obj => {
        return obj.id === seasonNumber
    })
    return monthsName ? t(monthsName.name) : ''
}

/**
 * returns the translatet attribut name based on the index number
 * @param attribut is the attribut index number
 * @returns name of the attribut
 */
export function getAttributName(attribut) {
    const attributName = attributes.find(obj => {
        return obj.id === attribut
    })
    return attributName ? t(attributName.name) : ''
}

/**
 * deletes a ingredient from the database
 * @param doctype is the type of document "recipe" or "shoppinglist"
 * @param docId is the id from the doctype object
 * @param delArticleId is the id from the ingredient where is to delete
 */
export function deleteIngredient(doctype, docId, delArticleId) {
    const articleRef = firestore.collection('global').doc(doctype)
        .collection('entries').doc(docId).collection('articles').doc(delArticleId)
    articleRef.delete()
}

/**
 * returns the number without decimal point if there are only zeros after the decimal point
 * @param number 
 * @returns formated number
 */
export function formatedNumber(number: number) {
    const commaPart = (number.toFixed(1) + "").split('.')[1]
    const intCommaPart = parseInt(commaPart, 10)
    return intCommaPart === 0 || !intCommaPart ? number.toFixed(0) : number.toFixed(1)
}

/**
 * show message on display for 1.5s
 * @param position top, middle or bottom
 * @param message text of the message
 * @param present useIonToast() object
 */
export const PresentToast = (position: 'top' | 'middle' | 'bottom', message, present) => {
    present({
        message: message,
        duration: 1500,
        position: position
    });
};