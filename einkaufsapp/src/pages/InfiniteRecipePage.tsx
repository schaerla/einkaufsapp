import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { t } from 'i18next'
import { add as addIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { Rating } from 'react-simple-star-rating'
import { useAuth } from '../auth'
import { firestore } from '../firebase'
import { Recipe, toRecipe, ratingColor } from '../models'


const InfiniteRecipePage: React.FC = () => {
  const { userId } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])

  /**
   * read recipe list from database
   */
  useEffect(() => {
    const recipesRef = firestore.collection('global').doc('recipe')
      .collection('entries')
    return recipesRef.orderBy('creationDate', 'desc').limit(12)
      .onSnapshot(({ docs }) => setRecipes(docs.map(toRecipe)))
  }, [userId])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{t('recipes')}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={`/my/recipes/add`}>
              <IonIcon icon={addIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {recipes.map((recipe) =>
              <IonCol size="6">
                <IonItem button key={recipe.id}
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
      </IonContent>
    </IonPage>
  )
}

export default InfiniteRecipePage