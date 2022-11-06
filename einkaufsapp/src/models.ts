/**
 * definition of the parameters which can be used for the transfer
 */
export type IdParams = {
    id: string
    articleIdEdit: string // id of articles collection
    edit: string // savingmode: 0 or "" = add new article, 1 = edit existing article
    listType: string // saving list path name: shoppinglist or recipe
    quantity: string
}

/**
 * definition of the content of the shopping list
 */
export interface Shoppinglist {
    id: string
    creationDate: string
    listTitle: string
    pictureUrl: string
    userId: string
    authorisation: Array<string>
}

/**
 * add the id to the shopping list data
 * @param doc Shoppinglist data
 * @returns Shoppinglist data incl. id
 */
export function toShoppinglist(doc): Shoppinglist {
    return { id: doc.id, ...doc.data() }
}

/**
 * definition of the content of the recipe
 */
export interface Recipe {
    id: string
    creationDate: string
    title: string
    pictureUrlArray: Array<string>
    recipe: string
    userId: string
    seasonStart: number
    seasonEnd: number
    ownRating: number
    averageRating: number
    globalCategory: number
    numberOfPersons: number
    authorisation: number
    readAuthorisation: Array<string>
}

/**
 * add the id to the Recipe data
 * @param doc Recipe data
 * @returns Recipe data incl. id
 */
export function toRecipe(doc): Recipe {
    return { id: doc.id, ...doc.data() }
}

/**
 * definition of the content of the article
 */
export interface Article {
    id: string
    creationDate: string
    articleDescription: string
    articleName: string
    attributes: Array<string>
    pictureUrl: string
    userID: string
    seasonStart: number
    seasonEnd: number
    category: string
}

/**
 * add the id to the Article data
 * @param doc Article data
 * @returns Article data incl. id
 */
export function toArticle(doc): Article {
    return { id: doc.id, ...doc.data() }
}

/**
 * definition of the content of the shopping ListArticle
 */
export interface ListArticle {
    id: string
    articleId: string
    quantity: number
    unitId: string
    supplement: string
    summarisedArticleIds: Array<string>
}

/**
 * add the id to the ListArticle data
 * @param doc ListArticle data
 * @returns ListArticle data incl. id
 */
export function toListArticle(doc): ListArticle {
    return { id: doc.id, ...doc.data() }
}

/**
 * definition of the content of the user
 */
 export interface User {
    id: string
    pictureUrl: string
    userName: string
    authFamilie: Array<string>
    authFriends: Array<string>
    language: string
    eMail: string
    userShortdescription: string
    userOccupation: string
    categorySorting: string
    design: number
    color: string
}

/**
 * add the id to the user data
 * @param doc user data
 * @returns user data incl. id
 */
export function toUser(doc): User {
    return { id: doc.id, ...doc.data() }
}

/**
 * definition of the content of the authUser
 */
 export interface authUser {
    id: string
    eMail: string
}

/**
 * add the id to the authUser data
 * @param doc user data
 * @returns user data incl. id
 */
export function toAuthUser(doc): authUser {
    return { id: doc.id, ...doc.data() }
}

/**
 *  for the selection of the season
 */
export const months = [
    { id: 1, name: 'january' },
    { id: 2, name: 'february' },
    { id: 3, name: 'march' },
    { id: 4, name: 'april' },
    { id: 5, name: 'may' },
    { id: 6, name: 'june' },
    { id: 7, name: 'july' },
    { id: 8, name: 'august' },
    { id: 9, name: 'september' },
    { id: 10, name: 'october' },
    { id: 11, name: 'november' },
    { id: 12, name: 'december' }
]

/**
 *  article attributes for sorting and better findability
 */
export const categories = [
    { id: 1, name: 'salad' },
    { id: 2, name: 'fruits' },
    { id: 3, name: 'vegetables' },
    { id: 4, name: 'bread and pastry' },
    { id: 5, name: 'meat and fish' },
    { id: 6, name: 'milk and cheese' },
    { id: 7, name: 'spice' },
    { id: 8, name: 'snack and sweets' },
    { id: 9, name: 'drink' },
    { id: 10, name: 'convenience and frozen food' },
    { id: 11, name: 'non Food' }
]

/**
 *  article attributes 
 */
export const attributes = [
    { id: 1, name: 'none' },
    { id: 2, name: 'vegan' },
    { id: 3, name: 'lactose free' },
    { id: 4, name: 'gluten free' },
    { id: 5, name: 'bio' }
]

/**
 *  recipe categories for sorting and better findability
 */
export const recipeCategories = [
    { id: 1, name: 'breakfast' },
    { id: 2, name: 'appetizer' },
    { id: 3, name: 'soupe' },
    { id: 4, name: 'salad' },
    { id: 5, name: 'main course vegetarian' },
    { id: 6, name: 'main course with meat' },
    { id: 7, name: 'dessert' },
    { id: 8, name: 'grill and sauces' }
]

/**
 *  various possible access restrictions to the recipe
 */
export const authStates = [
    { id: 1, name: 'privat' },
    { id: 2, name: 'family' },
    { id: 3, name: 'friends' },
    { id: 4, name: 'public' }
]

/**
 *  colors of the star rating
 *  - red to yellow
 */
export const ratingColor = ['#F50A1C', '#F51F05', '#F73907', '#F75907', '#E06504', '#E08611', '#F7A007', '#F7B607', '#F0C005', '#F0D60A']

/**
 *  array of the article units
 */
export const unitIds = [
    { id: 0, name: 'none', abbrev: '', calcK: '', calcL: '' },
    { id: 1, name: 'litres', abbrev: 'l', calcK: '', calcL: '1' },
    { id: 2, name: 'decilitre', abbrev: 'dl', alcK: '', calcL: '0.1' },
    { id: 3, name: 'centilitre', abbrev: 'cl', calcK: '', calcL: '0.01' },
    { id: 4, name: 'millilitre', abbrev: 'ml', calcK: '', calcL: '0.001' },
    { id: 10, name: 'kilogram', abbrev: 'kg', calcK: '1', calcL: '' },
    { id: 11, name: 'gram', abbrev: 'g', calcK: '0.001', calcL: '' },
    { id: 12, name: 'milligram', abbrev: 'mg', calcK: '0.00001', calcL: '' },
    { id: 20, name: 'cup', abbrev: 'cu.', calcK: '', calcL: '0.236588' },
    { id: 21, name: 'tea cup', abbrev: 'tc.', calcK: '', calcL: '0.177441' },
    { id: 22, name: 'mug', abbrev: 'mug', calcK: '', calcL: '' },
    { id: 30, name: 'tablespoon', abbrev: 'tbsp.', calcK: '', calcL: '0.014787' },
    { id: 31, name: 'teaspoon', abbrev: 'tsp.', calcK: '', calcL: '0.004929' },
    { id: 32, name: 'coffee spoon', abbrev: 'ksp.', calcK: '', calcL: '0.004929' },
    { id: 40, name: 'pinch of', abbrev: 'apo.', calcK: '', calcL: '' },
    { id: 50, name: 'pinch', abbrev: 'pn', calcK: '', calcL: '' },
    { id: 51, name: 'bunch', abbrev: 'bn', calcK: '', calcL: '' },
    { id: 52, name: 'stalk', abbrev: 'slk', calcK: '', calcL: '' },
    { id: 60, name: 'pack', abbrev: 'pk', calcK: '', calcL: '' },
    { id: 100, name: 'piece', abbrev: 'ea', calcK: '', calcL: '' },
    { id: 101, name: 'slice', abbrev: 'sl', calcK: '', calcL: '' },
]

/**
 * list with all possible languages that can be selected
 */
 export const lngs = {
    en: { nativeName: 'English' },
    de: { nativeName: 'Deutsch' }
  }