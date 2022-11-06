import {
  IonSelect,
  IonSelectOption,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  isPlatform,
  IonButtons,
  IonBackButton,
  IonList
} from '@ionic/react'
import { t } from 'i18next'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { auth, firestore, storage } from '../firebase'
import { changeAppLanguage } from '../App'
import { lngs, toUser, User } from '../models'
import { useAuth } from '../auth'


const SettingsPage: React.FC = () => {

  const { userId, userMail } = useAuth()
  const [id, setId] = useState('')
  const [userName, setUserName] = useState('')
  const [authFamilie, setAuthFamilie] = useState([])
  const [authFriends, setAuthFriends] = useState([])
  const [eMail, setEMail] = useState(userMail)
  const [userShortdescription, setUserShortdescription] = useState('')
  const [userOccupation, setUserOccupation] = useState('')
  const [categorySorting, setCategorySorting] = useState('')
  const fileInputRef = useRef<HTMLInputElement>()
  const [pictureUrl, setPictureUrl] = useState('/assets/placeholder.png')
  const [design, setDesign] = useState(0)
  const [color, setColor] = useState('')
  const [pictureUrlEdit, setPictureUrlEdit] = useState('/assets/placeholder.png')
  const [userData, setUserData] = useState<User[]>([])
  const { i18n } = useTranslation()

  /**
   * set the form values to the stored values from the database
   */
  useEffect(() => {
    if (!id && userData) {
      const storedData = userData[0]
      if (storedData) {
        setId(storedData?.id)
        setUserName(storedData?.userName)
        setAuthFamilie(storedData?.authFamilie)
        setAuthFriends(storedData?.authFriends)
        setEMail(storedData?.eMail)
        setUserShortdescription(storedData?.userShortdescription)
        setUserOccupation(storedData?.userOccupation)
        setCategorySorting(storedData?.categorySorting)
        setPictureUrl(storedData?.pictureUrl)
        setPictureUrlEdit(storedData?.pictureUrl)
        setDesign(storedData?.design)
        setColor(storedData?.color)
      }
    }
  }, [userData])


  /**
   * load user settings
   */
  useEffect(() => {
    const userRef = firestore.collection('users').doc(userId).collection('settings')
    return userRef.onSnapshot(({ docs }) => setUserData(docs.map(toUser)))
  }, [userId])

  /**
   * give back the url from the blobURL for saving picture on database
   * @param blobURL 
   * @returns 
   */
  async function savePicture(blobURL) {
    const pictureRef = storage.ref(`/users/${userId}/picture/${Date.now()}`)
    const response = await fetch(blobURL)
    const blob = await response.blob()
    const snapshot = await pictureRef.put(blob)
    const url = await snapshot.ref.getDownloadURL()
    return url
  }

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
   * save the user on the database
   */
  const handleSave = async () => {

    const creationDate = (new Date()).toString()
    //const id = userId
    const language = localStorage.getItem('i18nextLng')
    const entryData = {
      language, creationDate, userName, pictureUrl, authFamilie, authFriends, eMail, userShortdescription,
      userOccupation, categorySorting, design, color
    }
    if (!pictureUrl.startsWith('/assets') && !pictureUrl.startsWith('http')) {
      entryData.pictureUrl = await savePicture(pictureUrl)
      if (id) {
        // delete old picture if changed during edit
        let imageRef = storage.refFromURL(pictureUrlEdit)
        await imageRef.delete()
      }
    }
    if (!id) {
      // save new user
      const entriesRef = firestore.collection('users').doc(userId).collection('settings')
      await entriesRef.add(entryData)
    } else {
      // update existing user
      const entriesRefUpdate = firestore.collection('users').doc(userId).collection('settings').doc(id)
      await entriesRefUpdate.update(entryData)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{t('settings')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton color="medium" expand='block'
          onClick={() => auth.signOut()}>
          {t('logout')}
        </IonButton>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">{t('language selection')}</IonLabel>
            <IonSelect placeholder={t('change language')} color="medium"
              onIonChange={ev => changeAppLanguage(ev.detail.value)}
            >
              {Object.keys(lngs).map((lng) => (
                <IonSelectOption key={lng} value={lng}
                  disabled={i18n.resolvedLanguage === lng}>{lngs[lng].nativeName}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('user picture')}</IonLabel><br />
            <input type="file" accept="image/*" hidden ref={fileInputRef} /*value={pictureUrl}*/
              onChange={handleFileChange}
            />
            <img src={pictureUrl} alt="" style={{ cursor: 'pointer' }}
              onClick={handlePictureClick}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('user name')}</IonLabel>
            <IonInput value={userName}
              onIonChange={(event) => setUserName(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('authFamilie')}</IonLabel>
            <IonInput value={authFamilie[0]}
              onIonChange={(event) => setAuthFamilie([event.detail.value])}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('authFriends')}</IonLabel>
            <IonInput value={authFriends[0]}
              onIonChange={(event) => setAuthFriends([event.detail.value])}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('user mail')}</IonLabel>
            <IonInput value={eMail} readonly={true}
              onIonChange={(event) => setEMail(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('userShortdescription')}</IonLabel>
            <IonInput value={userShortdescription}
              onIonChange={(event) => setUserShortdescription(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('userOccupation')}</IonLabel>
            <IonInput value={userOccupation}
              onIonChange={(event) => setUserOccupation(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('categorySorting')}</IonLabel>
            <IonInput value={categorySorting}
              onIonChange={(event) => setCategorySorting(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('design')}</IonLabel>
            <IonInput type="number" value={design}
              onIonChange={(event) => setDesign(parseInt(event.detail.value, 10))}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('colorSheme')}</IonLabel>
            <IonInput value={color}
              onIonChange={(event) => setColor(event.detail.value)}
            />
          </IonItem>
          <IonButton expand="block" onClick={handleSave}>{t('save')}</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default SettingsPage
