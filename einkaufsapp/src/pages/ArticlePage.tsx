import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { trash as trashIcon, pencilOutline as editIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { firestore, storage } from '../firebase'
import { Article, IdParams, toArticle } from '../models'
import { t } from 'i18next'
import { getAttributName, getCategoryName, getMonthsName } from '../functions'

const ArticlePage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [article, setArticle] = useState<Article>()

  useEffect(() => {
    // load article from DB
    const articleRef = firestore.collection('global').doc('article')
      .collection('entries').doc(id)
    articleRef.get().then((doc) => setArticle(toArticle(doc)))
  }, [userId, id])

  const handleDelete = async () => {
    // delete article
    const articleRef = firestore.collection('global').doc('article')
      .collection('entries').doc(id)
    await articleRef.delete()
    // delete picture from article
    if (!article?.pictureUrl.startsWith('/assets')) {
      let imageRef = storage.refFromURL(article?.pictureUrl)
      await imageRef.delete()
    }
    // delete 'editArticle' in local storage
    localStorage.removeItem('editArticle')
    history.goBack()
  }

  localStorage.setItem('editArticle', JSON.stringify(article))

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{article?.articleName}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={`/my/article/addArticle/${id}`}>
              <IonIcon icon={editIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleDelete}>
              <IonIcon icon={trashIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <img className='articleImg' src={article?.pictureUrl} alt={article?.articleName} />
        <h3>{t('article name')}:</h3>
        <p className='whiteSpace'>{article?.articleName}</p>
        <h3>{t('article description')}:</h3>
        <p className='whiteSpace'>{article?.articleDescription}</p>
        <h3>{t('category')}:</h3>
        <p className='whiteSpace'>{getCategoryName(article?.category)}</p>
        <h3>{t('attribut')}:</h3>
        <p className='whiteSpace'>{getAttributName(article?.attributes)}</p>
        <h3>{t('season start')}:</h3>
        <p className='whiteSpace'>{getMonthsName(article?.seasonStart)}</p>
        <h3>{t('season end')}:</h3>
        <p className='whiteSpace'>{getMonthsName(article?.seasonEnd)}</p>

      </IonContent>
    </IonPage>
  )
}

export default ArticlePage