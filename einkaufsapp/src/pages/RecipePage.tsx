import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react'
import { trash as trashIcon, pencilOutline as editIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { formatDate } from '../date'
import { firestore, storage } from '../firebase'
import { IdParams, ListArticle, ratingColor, Recipe, toListArticle, toRecipe } from '../models'
import { t } from 'i18next'
import { Rating } from 'react-simple-star-rating'
import { formatedNumber, getArticleName, getUnitAbbrevFromUnitId } from '../functions'

const RecipePage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [recipe, setRecipe] = useState<Recipe>()
  const [articleList, setArticleList] = useState<ListArticle[]>([])
  const [articleListOrig, setArticleListOrig] = useState<ListArticle[]>([])
  const [numberOfPersons, setNumberOfPersons] = useState<number>()
  const [refreshData, setRefreshData] = useState(false)
  const [showEditingOptions, setShowEditingOptions] = useState(false)

  useEffect(() => {
    // load recipe from DB
    const recipeRef = firestore.collection('global').doc('recipe')
      .collection('entries').doc(id)
    recipeRef.get().then((doc) => setRecipe(toRecipe(doc)))
    // load articles belonging to the shopping list
    const articleLlistRef = firestore.collection('global').doc('recipe')
      .collection('entries').doc(id).collection('articles')
    return articleLlistRef.orderBy('articleId', 'desc')
      .onSnapshot(({ docs }) => setArticleList(docs.map(toListArticle)))
  }, [userId, id])

  /**
   * update the articleList data on the frontend
   */
  useEffect(() => {
    setArticleList(articleList)
  }, [refreshData, articleList])

  const handleDelete = async () => {
    // delete recipe
    const recipeRef = firestore.collection('global').doc('recipe')
      .collection('entries').doc(id)
    await recipeRef.delete()
    // delete picture from recipe
    if (!recipe?.pictureUrlArray[0].startsWith('/assets')) {
      let imageRef = storage.refFromURL(recipe?.pictureUrlArray[0])
      await imageRef.delete()
    }
    // delete 'editRecipe' in local stoarage
    localStorage.removeItem('editRecipe')
    history.goBack()
  }

  // save recipe and list of articles in local storage for edit
  localStorage.setItem('editRecipe', JSON.stringify(recipe))
  localStorage.setItem('editListArt', JSON.stringify(articleList))

  /**
   * set numberOfPersons as soon as the recipe has been loaded
   */
  if (recipe && !numberOfPersons) {
    setNumberOfPersons(recipe?.numberOfPersons)
  }

  // set articleListOrig if its empty
  if (articleList.length !== articleListOrig.length) {
    setArticleListOrig(structuredClone(articleList))
  }

  /**
   * give back the original quantity of the rezipe ingredient
   * @param id 
   * @returns 
   */
  function getOriginalQuantity(id) {
    const editItem = articleListOrig.find(obj => {
      return obj.id === id
    })
    return editItem.quantity
  }

  /**
   * activate edite functions for own recipe only
   */
  useEffect(() => {
    if (userId === recipe?.userId) {
      setShowEditingOptions(true)
    }
  }, [userId, recipe])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{recipe?.title}</IonTitle>
          <IonButtons slot="end" style={{ display: showEditingOptions ? "initial" : "none" }}>
            <IonButton routerLink={`/my/recipes/add/${id}`}>
              <IonIcon icon={editIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end" style={{ display: showEditingOptions ? "initial" : "none" }}>
            <IonButton onClick={handleDelete}>
              <IonIcon icon={trashIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <div className='creationDate'>{t('creationDate')}: {formatDate(recipe?.creationDate)}</div>
              <div className='ownRating recipe'>
                <Rating
                  size={20}
                  initialValue={recipe?.ownRating}
                  fillColorArray={ratingColor}
                  allowFraction
                  readonly={recipe?.ownRating > 0}
                />
              </div>
              <img className='recipeImg' src={recipe?.pictureUrlArray[0]} alt={recipe?.title} />
            </IonCol>
            <IonCol size="12" size-md="6">
              <h3>{t('ingredients')}:</h3>
              <IonItem>
                <IonLabel >{t('numberOfPersons')}</IonLabel>
                <IonInput type="number" value={numberOfPersons}
                  onIonChange={(event) => {
                    setNumberOfPersons(parseInt(event.detail.value, 10))
                    articleList.map(article => (
                      article.quantity = ((getOriginalQuantity(article.id) / recipe?.numberOfPersons) * numberOfPersons)
                    ))
                    setArticleList(articleList)
                    setRefreshData(!refreshData)
                  }}
                />
                <IonNote slot="helper">{t('numberOfPersons for the recipe')}</IonNote>
                <IonNote slot="error">{t('invalid numberOfPersons')}</IonNote>
              </IonItem>
              <div className='ingredients-list'>
                {articleList.map((articleList) =>
                  <div>{formatedNumber(articleList.quantity)} {getUnitAbbrevFromUnitId(articleList.unitId)} {getArticleName(articleList.articleId)} {articleList.supplement}</div>
                )}
              </div>
              <IonButton expand="block" routerLink={`/my/lists/addArticleFromRecipe/${numberOfPersons}/${id}`}>{t('add ingredients to shopping list')}</IonButton>
            </IonCol>
            <IonCol size="12">
            <h3>{t('recipe')}:</h3>
            <p className='whiteSpace'>{recipe?.recipe}</p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default RecipePage