import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { t } from 'i18next'
import { add as addIcon, create as addIconArticle, listOutline as showListIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { Rating } from 'react-simple-star-rating'
import { useAuth } from '../auth'
import { formatDate } from '../date'
import { firestore } from '../firebase'
import { Shoppinglist, toShoppinglist, Recipe, toRecipe, ratingColor, authUser, toAuthUser } from '../models'

const HomePage: React.FC = () => {
  const { userId } = useAuth()
  const [lists, setLists] = useState<Shoppinglist[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [foreignLists, setForeignLists] = useState<Shoppinglist[]>([]) // lists from other user
  const listsRef = firestore.collection('global').doc('shoppinglist').collection('entries')
  const [authUserList, setAuthUserList] = useState<authUser[]>([])

  /**
   * read shopping list from database
   */
  useEffect(() => {
    return listsRef
      .where('userId', "==", userId)
      .limit(6)
      .onSnapshot(({ docs }) => setLists(docs.map(toShoppinglist)))
  }, [userId])

  /**
   * read shopping list from foreign user from the database
   */
  useEffect(() => {
    return listsRef
      .where('authorisation', 'array-contains', userId)
      .limit(6)
      .onSnapshot(({ docs }) => setForeignLists(docs.map(toShoppinglist)))
  }, [userId])

  /**
   * read recipe list from database
   */
  useEffect(() => {
    const recipesRef = firestore.collection('global').doc('recipe')
      .collection('entries')
    return recipesRef.orderBy('creationDate', 'desc').limit(8)
      .onSnapshot(({ docs }) => setRecipes(docs.map(toRecipe)))
  }, [userId])

  /**
   * read authUser list from database
   */
  useEffect(() => {
    const authUserRef = firestore.collection('users').doc('publiclist').collection('users')
    return authUserRef.orderBy('eMail', 'asc')
      .onSnapshot(({ docs }) => setAuthUserList(docs.map(toAuthUser)))
  }, [userId])

  localStorage.setItem('shoppingLists', JSON.stringify(lists.concat(foreignLists)))
  localStorage.setItem('authUserList', JSON.stringify(authUserList))

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('shopping app')}</IonTitle>
          <IonButtons slot="end">
              <IonButton routerLink={`/my/article/viewArticlelist/${userId}`}>
                <IonIcon icon={addIconArticle} slot="icon-only" />
              </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('shopping lists')}</IonTitle>
            <IonButtons slot="end">
              <IonButton routerLink={`/my/lists/InfiniteListReloadInfScrol`}>
                <IonIcon icon={showListIcon} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton routerLink={`/my/lists/add`}>
                <IonIcon icon={addIcon} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {lists.concat(foreignLists).map((list) =>
              <IonCol size="12" size-md="6" size-lg="4" size-xl="3">
                <IonItem className='shopping-list'
                  button key={list.id}
                  routerLink={`/my/lists/view/${list.id}`}>
                  <IonThumbnail slot="end">
                    <IonImg src={list.pictureUrl} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>{list.listTitle}</h2>
                    <h3>{formatDate(list.creationDate)}</h3>
                  </IonLabel>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('recipes')}</IonTitle>
            <IonButtons slot="end">
              <IonButton routerLink={`/my/recipes/InfiniteListReloadInfScrol`}>
                <IonIcon icon={showListIcon} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton routerLink={`/my/recipes/add`}>
                <IonIcon icon={addIcon} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {recipes.map((recipe) =>
              <IonCol size="12" size-md="6" size-lg="4" size-xl="3">
                <IonItem className='recipe'
                  button key={recipe.id}
                  routerLink={`/my/recipes/view/${recipe.id}`}>
                  <IonThumbnail slot="end">
                    <IonImg src={recipe.pictureUrlArray[0]} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>{recipe.title}</h2>
                    <div className='ownRating homePage'>
                      <Rating
                        size={20}
                        initialValue={recipe?.ownRating}
                        fillColorArray={ratingColor}
                        allowFraction
                        readonly={recipe?.ownRating > 0}
                      />
                    </div>
                  </IonLabel>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        {/*<IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton routerLink={`/my/article/viewArticlelist/${userId}`}>
            <IonIcon icon={addIconArticle} />
          </IonFabButton>
            </IonFab>*/}
      </IonContent>
    </IonPage>
  )
}

export default HomePage