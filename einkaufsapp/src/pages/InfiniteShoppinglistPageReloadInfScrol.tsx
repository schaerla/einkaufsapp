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
import { useAuth } from '../auth'
import { formatDate } from '../date'
import Post from "../services/Post";

const InfiniteShoppinglistPageReloadInfScrol: React.FC = () => {
  const { userId } = useAuth()
  const [lists, setLists] = useState([])
  const [lastKey1, setLastKey1] = useState("");
  const [lastKey2, setLastKey2] = useState("");
  const [isInfiniteDisabled, setInfiniteDisabled] = useState(false);
  const [firstUse, setFirstUse] = useState(true);

  const pushData = () => {
    if (firstUse) {
      Post.postsFirstBatchShList(userId)
        .then((res) => {
          setLists(res.posts)
          setLastKey1(res.lastKey1)
          setLastKey2(res.lastKey2)
          setFirstUse(false)
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      if (lastKey1) {
        Post.postsNextBatchShList(userId, lastKey1, lastKey2)
          .then((res) => {
            setLastKey1(res.lastKey1)
            setLastKey2(res.lastKey1)
            // add new posts to old posts
            setLists(lists.concat(res.posts))
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
      if (lists.length === 1000) {
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
    ? lists
    : lists.filter((listsLocalStorge) =>
    listsLocalStorge.postContent.listTitle.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{t('shopping lists')}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={`/my/lists/add`}>
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
        <IonSearchbar placeholder={t('search shopping list')} type="text" debounce={1000} onIonChange={(ev) => handleSearchChange(ev)}></IonSearchbar>
        <IonGrid>
          <IonRow>
            {filtered.map((list) =>
              <IonCol size="12" size-md="6" size-lg="4" size-xl="3">
                <IonItem className='shopping-list'
                  button key={list.id}
                  routerLink={`/my/lists/view/${list.id}`}>
                  <IonThumbnail slot="end">
                    <IonImg src={list.postContent.pictureUrl} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>{list.postContent.listTitle}</h2>
                    <h3>{formatDate(list.postContent.creationDate)}</h3>
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

export default InfiniteShoppinglistPageReloadInfScrol