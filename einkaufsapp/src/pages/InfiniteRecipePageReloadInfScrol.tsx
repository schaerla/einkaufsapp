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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSearchbar,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react'
import { t } from 'i18next'
import { add as addIcon } from 'ionicons/icons'
import React, { useState } from 'react'
import { Rating } from 'react-simple-star-rating'
import { ratingColor } from '../models'
import Post from "../services/Post";


const InfiniteRecipePageReloadInfScrol: React.FC = () => {
  const [recipes, setRecipes] = useState([])
  const [lastKey, setLastKey] = useState("");
  const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);
  const [firstUse, setFirstUse] = useState(true);

  const pushData = () => {
    if (firstUse) {
      Post.postsFirstBatch()
        .then((res) => {
          setRecipes(res.posts)
          setLastKey(res.lastKey)
          setFirstUse(false)
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      if (lastKey) {
        Post.postsNextBatch(lastKey)
          .then((res) => {
            setLastKey(res.lastKey)
            // add new posts to old posts
            setRecipes(recipes.concat(res.posts))
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
  }
  const loadData = (ev: any) => {
    setTimeout(() => {
      pushData();
      console.log('Loaded data');
      ev.target.complete();
      if (recipes.length === 1000) {
        setInfiniteDisabled(true);
      }
    }, 500);
  }

  useIonViewWillEnter(() => {
    pushData();
  });

  /**
  * Search Function 
  */
  const [search, setNewSearch] = useState("")
  const handleSearchChange = (e) => {
    setNewSearch(e.target.value)
  }
  const filtered = !search
    ? recipes
    : recipes.filter((recipesLocalStorge) =>
    recipesLocalStorge.postContent.title.toLowerCase().includes(search.toLowerCase())
    )

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
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonSearchbar placeholder={t('search recipe')} type="text" debounce={1000} onIonChange={(ev) => handleSearchChange(ev)}></IonSearchbar>
        <IonGrid>
          <IonRow>
            {filtered.map((recipe) =>
              <IonCol size="12" size-md="6" size-lg="4" size-xl="3">
                <IonItem className='recipe'
                  button key={recipe.id}
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

        <IonInfiniteScroll
          onIonInfinite={loadData}
          threshold="100px"
          disabled={isInfiniteDisabled}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText={t('Loading more data...')}
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  )
}

export default InfiniteRecipePageReloadInfScrol