import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { firestore, storage } from '../firebase'
import { isPlatform } from '@ionic/core'
import { t } from 'i18next'
import { attributes, categories, months, IdParams, Article } from '../models'

/**
 * give back the url from the blobURL for saving picture on database
 * @param blobURL 
 * @returns 
 */
async function savePicture(blobURL) {
  const pictureRef = storage.ref(`/global/article/picture/${Date.now()}`)
  const response = await fetch(blobURL)
  const blob = await response.blob()
  const snapshot = await pictureRef.put(blob)
  const url = await snapshot.ref.getDownloadURL()
  return url
}

const AddArticlePage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [articleDescription, setArticleDescription] = useState('')
  const [articleName, setArticleName] = useState('')
  const [category, setCategory] = useState('')
  const [attribut, setAttribut] = useState<[1]>([1])
  const [seasonEnd, setSeasonEnd] = useState(12)
  const [pageTitel, setpageTitel] = useState(t('new article'))
  const [seasonStart, setSeasonStart] = useState(1)
  const [pictureUrl, setPictureUrl] = useState('/assets/placeholder.png')
  const fileInputRef = useRef<HTMLInputElement>()
  const [pictureUrlEdit, setPictureUrlEdit] = useState('/assets/placeholder.png')
  const [article, setArticle] = useState<Article[]>([])

  /**
   * for editing article only, set default values
   */
  useEffect(() => {
    const editArticleX = JSON.parse(localStorage.getItem('editArticle'))
    if (id && editArticleX) {
      setpageTitel(t('edit article'))
      setArticleDescription(editArticleX?.articleDescription)
      setArticleName(editArticleX?.articleName)
      setCategory(editArticleX?.category)
      setAttribut(editArticleX?.attribut)
      setSeasonStart(editArticleX?.seasonStart)
      setSeasonEnd(editArticleX?.seasonEnd)
      setPictureUrl(editArticleX?.pictureUrl)
      setPictureUrlEdit(editArticleX?.pictureUrl)
    }
  }, [id])

  /**
   * save Articlelist in local Storage
   */
  useEffect(() => {
  localStorage.setItem('articlelist', JSON.stringify(article));
  },[article]);

  /**
 * load activ article lists
 */
  /**useEffect(()=> {
    const article = JSON.parse(localStorage.getItem('articleList'));
    if (article) {
      setArticle(article);
    }
  },[]);*/

  useEffect(() => {
    setArticle(JSON.parse(localStorage.getItem('articleList')))
  }, [userId, id ])

  useEffect(() => () => {
    if (pictureUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pictureUrl)
    }
  }, [pictureUrl])

  /**
   * handle the file change
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files.length > 0) {
      const file = event.target.files.item(0)
      const pictureUrl = URL.createObjectURL(file)
      setPictureUrl(pictureUrl)
    }
  }

  /**
   * handle the picture function on mobile phones
   */
  const handlePictureClick = async () => {
    if (isPlatform('capacitor')) {
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt,
          width: 600,
        })
        setPictureUrl(photo.webPath)
      } catch (error) {
        console.log('Camera error:', error)
      }
    } else {
      fileInputRef.current.click()
    }
  }

  /**
   * save the article on the database
   */
  const handleSave = async () => {
    const entryData = { articleDescription, articleName, category, seasonEnd, seasonStart, pictureUrl, userId, attribut }
    if (!pictureUrl.startsWith('/assets') && !pictureUrl.startsWith('http')) {
      entryData.pictureUrl = await savePicture(pictureUrl)
      if (id) {
        // delete old picture if changed during edit
        let imageRef = storage.refFromURL(pictureUrlEdit)
        await imageRef.delete()
      }
    }
    if (!id) {
      // save new article
      const entriesRef = firestore.collection('global').doc('article')
        .collection('entries')
      await entriesRef.add(entryData)
    } else {
      // update existing article
      const entriesRefUpdate = firestore.collection('global').doc('article')
        .collection('entries').doc(id)
      await entriesRefUpdate.update(entryData)
    }
    localStorage.removeItem('editArticle')
    history.goBack()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{pageTitel}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="stacked">{t('article picture')}</IonLabel><br />
            <input type="file" accept="image/*" hidden ref={fileInputRef}
              onChange={handleFileChange}
            />
            <img src={pictureUrl} alt="" style={{ cursor: 'pointer' }}
              onClick={handlePictureClick}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('article name')}</IonLabel>
            <IonInput value={articleName}
              onIonChange={(event) => setArticleName(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('article description')}</IonLabel>
            <IonInput value={articleDescription}
              onIonChange={(event) => setArticleDescription(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('category')}</IonLabel>
            <IonSelect placeholder={t('select category')} color="medium" value={category}
              onIonChange={(event) => setCategory(event.detail.value)}>
              {categories.map((ctg) => (
                <IonSelectOption key={ctg.id} value={ctg.id}>{t(ctg.name)}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('attribut')}</IonLabel>
            <IonSelect placeholder={t('select attribut')} color="medium" value={attribut} multiple={true}
              onIonChange={(event) => setAttribut(event.detail.value)} >
              {attributes.map((atb) => (
                <IonSelectOption key={atb.id} value={atb.id}>{t(atb.name)}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('season start')}</IonLabel>
            <IonSelect placeholder={t('select month')} color="medium" value={seasonStart}
              onIonChange={(event) => setSeasonStart(event.detail.value)}>
              {months.map((mth) => (
                <IonSelectOption key={mth.id} value={mth.id}>{t(mth.name)}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('season end')}</IonLabel>
            <IonSelect placeholder={t('select month')} color="medium" value={seasonEnd}
              onIonChange={(event) => setSeasonEnd(event.detail.value)}>
              {months.map((mth) => (
                <IonSelectOption key={mth.id} value={mth.id}>{t(mth.name)}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>{t('save')}</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default AddArticlePage
