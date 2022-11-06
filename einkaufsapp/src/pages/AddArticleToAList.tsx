import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import React, { useEffect, useState } from 'react'
import { create as addIconArticle } from 'ionicons/icons'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { firestore } from '../firebase'
import { t } from 'i18next'
import { IdParams, unitIds } from '../models'
import { getPictureUrl } from '../functions'

const AddArticleToAList: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const { articleIdEdit } = useParams<IdParams>()
  const { edit } = useParams<IdParams>()
  const { listType } = useParams<IdParams>()
  const [pageTitel, setpageTitel] = useState(t('add ingredient'))
  const [articleId, setArticleId] = useState('1xG4p0s00AoZTTAONxpW')
  const [quantity, setQuantity] = useState(7)
  const [unitId, setUnitId] = useState()
  const [supplement, setSupplement] = useState('')
  const plhSupplement = t('placeholder supplement')

  /**
   * for editing listArticles, set default values
   */
  useEffect(() => {
    const editListArtX = JSON.parse(localStorage.getItem('editListArt'))
    console.log('editShListArtX:', editListArtX)
    if (id && editListArtX && edit === '1') {
      // get item by id
      const editItem = editListArtX.find(obj => {
        return obj.id === articleIdEdit
      })
      setpageTitel(t('edit ingredient'))
      setArticleId(editItem?.articleId)
      setQuantity(editItem?.quantity)
      setUnitId(editItem?.unitId)
      setSupplement(editItem?.supplement)
    }
  }, [userId, id, articleIdEdit, edit])

  /**
   * stores the ingredient in the database
   */
  const handleSave = async () => {
    const entryData = { articleId, quantity, unitId, supplement }

    if (edit !== '1') {
      // save new listArticle
      console.log('entriesListTypeSaveFolder:', listType)
      const entriesRef = firestore.collection('global').doc(listType)
        .collection('entries').doc(id).collection('articles')
      console.log('entriesRef:', entriesRef)
      await entriesRef.add(entryData)
    } else {
      // update existing listArticle
      const entriesRefUpdate = firestore.collection('global').doc(listType)
        .collection('entries').doc(id).collection('articles').doc(articleIdEdit)
      await entriesRefUpdate.update(entryData)
    }

    localStorage.removeItem('editListArt')
    history.goBack()
  }

  /**
   * get articleList from local Storage
   */
  const localUser = JSON.parse(localStorage.getItem('articleList')) || {}

  /**
   * Search Function 
   */
  const [search, setNewSearch] = useState("")
  const handleSearchChange = (e) => {
    setNewSearch(e.target.value)
  }
  const filtered = !search
    ? localUser
    : localUser.filter((articleLocalStorge) =>
      articleLocalStorge.articleName.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{pageTitel}</IonTitle>
          <IonButtons slot="end">
              <IonButton routerLink={`/my/article/viewArticlelist/${userId}`}>
                <IonIcon icon={addIconArticle} slot="icon-only" />
              </IonButton>
            </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
        <IonSearchbar placeholder={t('search article')} type="text" debounce={1000} onIonChange={(ev) => handleSearchChange(ev)}></IonSearchbar>
          <IonItem>
            <IonLabel position="stacked">{t('article name')}</IonLabel>
            <IonSelect placeholder={t('article')} color="medium" value={articleId}
              onIonChange={(ev) => setArticleId(ev.detail.value)} >
              {filtered.map((articleList) => (
                <IonSelectOption key={articleList.id} value={articleList.id}>{t(articleList.articleName)} </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('quantity')}</IonLabel>
            <IonInput type="number" value={quantity}
              onIonChange={(event) => setQuantity(parseFloat(event.detail.value))}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('unit of measurement')}</IonLabel>
            <IonSelect placeholder={t('select unit of measurement')} color="medium" value={unitId}
              onIonChange={(event) => setUnitId(event.detail.value)}>
              {unitIds.map((uIds) => (
                <IonSelectOption key={uIds.id} value={uIds.id}>{t(uIds.name)} ({t(uIds.abbrev)})</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('supplement')}</IonLabel>
            <IonTextarea value={supplement} placeholder={plhSupplement}
              onIonChange={(event) => setSupplement(event.detail.value)}
            />
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>{t('save')}</IonButton>
        </IonList>
        {/*<p>articleListId: {id}</p>
        <p>articleId: {articleId}</p>
        <p>articleIdEdit: {articleIdEdit}</p>
        <p>listType: {listType}</p>*/}
        {/*<IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton routerLink={`/my/article/viewArticlelist/${userId}`}>
            <IonIcon icon={addIconArticle} />
          </IonFabButton>
      </IonFab>*/}
      </IonContent>
    </IonPage>
  )
}

export default AddArticleToAList