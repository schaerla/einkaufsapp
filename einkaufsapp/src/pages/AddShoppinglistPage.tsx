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
  IonSearchbar,
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
import { IdParams } from '../models'

async function savePicture(blobURL) {
  const pictureRef = storage.ref(`/global/shoppinglist/picture/${Date.now()}`)
  const response = await fetch(blobURL)
  const blob = await response.blob()
  const snapshot = await pictureRef.put(blob)
  const url = await snapshot.ref.getDownloadURL()
  return url
}

const AddShoppinglistPage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [pageTitel, setpageTitel] = useState(t('new shoppinglist'))
  const [listTitle, setListTitle] = useState('')
  const [pictureUrl, setPictureUrl] = useState('/assets/placeholder.png')
  const fileInputRef = useRef<HTMLInputElement>()
  const [pictureUrlEdit, setPictureUrlEdit] = useState('/assets/placeholder.png')
  const [authorisation, setAuthorisation] = useState([])

  /**
   * for editing shopping list only, set default values
   */
  useEffect(() => {
    const editShoppinglistX = JSON.parse(localStorage.getItem('editShoppinglist'))
    if (id && editShoppinglistX) {
      setpageTitel(t('edit shoppinglist'))
      setListTitle(editShoppinglistX?.listTitle)
      setPictureUrl(editShoppinglistX?.pictureUrl)
      setPictureUrlEdit(editShoppinglistX?.pictureUrl)
      setAuthorisation(editShoppinglistX?.authorisation)
    }
  }, [id])

  /**
   * get autUserList from local Storage
   */
  const localAuthUserList = JSON.parse(localStorage.getItem('authUserList')) || {}

  /**
  * Search Function 
  */
  const [search, setNewSearch] = useState("")
  const handleSearchChange = (e) => {
    setNewSearch(e.target.value)
  }
  const filtered = !search
    ? localAuthUserList
    : localAuthUserList.filter((localAutUserListStorge) =>
      localAutUserListStorge.eMail.toLowerCase().includes(search.toLowerCase())
    )

  /**
   * 
   */
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
   * save the shopping list on the database
   */
  const handleSave = async () => {
    const creationDate = (new Date()).toString()
    //const authorisation = [] // authorisation function must be implemented!
    const entryData = { creationDate, listTitle, pictureUrl, userId, authorisation }
    if (!pictureUrl.startsWith('/assets') && !pictureUrl.startsWith('http')) {
      entryData.pictureUrl = await savePicture(pictureUrl)
      if (id) {
        // delete old picture if changed during edit
        let imageRef = storage.refFromURL(pictureUrlEdit)
        await imageRef.delete()
      }
    }
    if (!id) {
      // save new shopping list
      const entriesRef = firestore.collection('global').doc('shoppinglist')
        .collection('entries')
      await entriesRef.add(entryData)
    } else {
      // update existing shopping list
      const entriesRefUpdate = firestore.collection('global').doc('shoppinglist')
        .collection('entries').doc(id)
      await entriesRefUpdate.update(entryData)
    }
    localStorage.removeItem('editShoppinglist')
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
            <IonLabel position="stacked">{t('shoppinglist title')}</IonLabel>
            <IonInput value={listTitle}
              onIonChange={(event) => setListTitle(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('shoppinglist picture')}</IonLabel><br />
            <input type="file" accept="image/*" hidden ref={fileInputRef}
              onChange={handleFileChange}
            />
            <img src={pictureUrl} alt="" style={{ cursor: 'pointer' }}
              onClick={handlePictureClick}
            />
          </IonItem>
          <IonSearchbar placeholder={t('search user')} type="text" debounce={1000} onIonChange={(ev) => handleSearchChange(ev)}></IonSearchbar>
          <IonItem>
            <IonLabel position="stacked">{t('authorised user')}</IonLabel>
            <IonSelect placeholder={t('select user')} color="medium" value={authorisation} multiple={true}
              onIonChange={(event) => setAuthorisation(event.detail.value)} >
              {filtered.map((authUserListF) => (
                <IonSelectOption key={authUserListF.id} value={authUserListF.id} disabled={userId === authUserListF.id}>{authUserListF.eMail}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>{t('save')}</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default AddShoppinglistPage
