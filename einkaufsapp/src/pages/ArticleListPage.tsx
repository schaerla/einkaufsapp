import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonSearchbar,
} from '@ionic/react'
import { t } from 'i18next'
import { add as addIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { firestore } from '../firebase'
import { toArticle, Article } from '../models'

const ArticleListPage: React.FC = () => {
  const [article, setArticle] = useState<Article[]>([])

  /**
   * read article data from database
   */
  useEffect(() => {
    const dataFirestore = firestore.collection('global').doc('article')
      .collection('entries')
    return dataFirestore.orderBy('articleName').onSnapshot(({ docs }) => setArticle(docs.map(toArticle)))
  }, [])

  /**
   * save articleList in local Storage
   */
  localStorage.setItem('articleList', JSON.stringify(article))

  /**
    * Search Function 
    */
  const [search, setNewSearch] = useState("")
  const handleSearchChange = (e) => {
    setNewSearch(e.target.value)
  }
  const filtered = !search
    ? article
    : article.filter((articleLocalStorge) =>
      articleLocalStorge.articleName.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{t('created Article')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSearchbar placeholder={t('search article')} type="text" debounce={1000} onIonChange={(ev) => handleSearchChange(ev)}></IonSearchbar>
        <IonList>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('article lists')}</IonTitle>
              <IonButtons slot="end" >
                <IonButton routerLink={`/my/article/addArticle`}>
                  <IonIcon icon={addIcon} slot="icon-only" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
        </IonList>
        <IonList className="articleListFiltered">
          {filtered.map((articleList) =>
            <IonItem button key={articleList.id}
              routerLink={`/my/article/viewArticle/${articleList.id}`}>
              <IonThumbnail slot="end">
                <IonImg src={articleList.pictureUrl} />
              </IonThumbnail>
              <IonLabel>
                <h2>{articleList.articleName}</h2>
                <h3>{articleList.id}</h3>
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default ArticleListPage