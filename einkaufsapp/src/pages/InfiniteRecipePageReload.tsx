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
import { ratingColor } from '../models'
import Post from "../services/Post";


const InfiniteRecipePageReload: React.FC = () => {
  const { userId } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [lastKey, setLastKey] = useState("");
  const [nextPosts_loading, setNextPostsLoading] = useState(false);

  /**
   * first 4 posts
   */
  useEffect(() => {
    Post.postsFirstBatch()
      .then((res) => {
        setRecipes(res.posts)
        setLastKey(res.lastKey)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  /**
   * fetch next batch of posts
   * @param key 
   */
  const fetchMorePosts = (key) => {
    if (key) {
      setNextPostsLoading(true)
      Post.postsNextBatch(key)
        .then((res) => {
          setLastKey(res.lastKey)
          // add new posts to old posts
          setRecipes(recipes.concat(res.posts))
          setNextPostsLoading(false)
        })
        .catch((err) => {
          console.log(err)
          setNextPostsLoading(false)
        })
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Test {t('recipes')} mit nachladen</IonTitle>
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
                    <IonImg src={recipe.postContent.pictureUrlArray[0]} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>{recipe?.postContent.title}</h2>
                    <div className='ownRating homePage'>
                      <Rating
                        size={20}
                        initialValue={recipe?.postContent.ownRating}
                        fillColorArray={ratingColor}
                        allowFraction
                        readonly={recipe?.postContent.ownRating > 0}
                      />
                    </div>
                  </IonLabel>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        {nextPosts_loading ? (
          <p style={{ textAlign: "center" }}>{t('Loading..')}</p>
        ) : lastKey ? (

          <IonButton expand="block" onClick={() => fetchMorePosts(lastKey)}>{t('more recipe')}</IonButton>
        ) : (
          <p style={{ textAlign: "center" }}>{t('You are up to date!')}</p>
        )}
      </IonContent>
    </IonPage>
  )
}

export default InfiniteRecipePageReload