import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react'
import React, { useEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router'
import { useAuth } from '../auth'
import { firestore } from '../firebase'
import { t } from 'i18next'
import { IdParams, ListArticle, Shoppinglist } from '../models'
import { PresentToast } from '../functions'

const AddArticleToShoppinglist: React.FC = () => {
  const { userId } = useAuth()
  const { id } = useParams<IdParams>()
  // const { quantity } = useParams<IdParams>()
  const [present] = useIonToast();
  const [saveListId, setSaveListId] = useState('')
  const [shoppingLists, setShoppingLists] = useState<Shoppinglist[]>([])
  const [listArticles, setListArticles] = useState<ListArticle[]>([])
  const [saved, setSaved] = useState(false)

  /**
   * load activ shopping lists
   */
  useEffect(() => {
    setShoppingLists(JSON.parse(localStorage.getItem('shoppingLists')))
    setListArticles(JSON.parse(localStorage.getItem('editListArt')))
  }, [userId, id])

  /**
   * add ingredients to the choosen shopping list
   */
  const handleSave = async () => {
    if (saveListId && listArticles.length !== 0) {
      const entriesRefUpdate = firestore.collection('global').doc('shoppinglist')
        .collection('entries').doc(saveListId).collection('articles')
      const listArticlesWithoutId = structuredClone(listArticles)
      // delete id's from the listArticles
      listArticlesWithoutId.every((e) => (delete e.id))
      {
        listArticlesWithoutId.map((lisArt2) => (
          entriesRefUpdate.add(lisArt2)
        ))
      }
      localStorage.removeItem('editListArt')
      setSaved(true)
    }
    else {
      if (listArticles.length === 0) {
        PresentToast('top', t('no article to add'), present)
      } else {
        PresentToast('top', t('no shopping list selected'), present)
      }

    }
  }

  if (saved) {
    return <Redirect to={`/my/lists/view/${saveListId}`} />
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{t('add ingredients to shopping list')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">{t('shopping list')}</IonLabel>
            <IonSelect placeholder={t('chose shopping list')} color="medium"
              onIonChange={(event) => setSaveListId(event.detail.value)}>
              {shoppingLists.map((shl) => (
                <IonSelectOption key={shl.id} value={shl.id}>{shl.listTitle}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>{t('add ingredients to the shopping list')}</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default AddArticleToShoppinglist
