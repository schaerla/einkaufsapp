import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar
} from '@ionic/react'
import { trash as trashIcon } from 'ionicons/icons'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { firestore, storage } from '../firebase'
import { isPlatform } from '@ionic/core'
import { t } from 'i18next'
import { recipeCategories, months, authStates, ratingColor, IdParams, ListArticle, toListArticle } from '../models'
import { Rating } from 'react-simple-star-rating'
import { deleteIngredient, formatedNumber, getArticleName, getUnitAbbrevFromUnitId } from '../functions'

/**
 * give back the url from the blobURL for saving picture on database
 * @param blobURL 
 * @returns 
 */
async function savePicture(blobURL) {
  const pictureRef = storage.ref(`/global/recipe/picture/${Date.now()}`)
  const response = await fetch(blobURL)
  const blob = await response.blob()
  const snapshot = await pictureRef.put(blob)
  const url = await snapshot.ref.getDownloadURL()
  return url
}

const AddRecipePage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [title, setTitle] = useState('')
  const [seasonStart, setSeasonStart] = useState(1)
  const [seasonEnd, setSeasonEnd] = useState(12)
  const [ownRating, setOwnRating] = useState(0)
  const [globalCategory, setGlobalCategory] = useState('')
  const [numberOfPersons, setNumberOfPersons] = useState(4)
  const [authorisation, setAuthorisation] = useState()
  const [pictureUrl, setPictureUrl] = useState('/assets/placeholder.png')
  const [recipe, setRecipe] = useState('')
  const [pageTitel, setpageTitel] = useState(t('new recipe'))
  const fileInputRef = useRef<HTMLInputElement>()
  const plhNumberOfPersons = t('placeholder numberOfPersons')
  const plhRecipe = t('placeholder recipe')
  const [pictureUrlEdit, setPictureUrlEdit] = useState('/assets/placeholder.png')
  const [articleList, setArticleList] = useState<ListArticle[]>([])

  /**
   * for editing recipe only, set default values
   */
  useEffect(() => {
    const editRecipeX = JSON.parse(localStorage.getItem('editRecipe'))
    if (id && editRecipeX) {
      setpageTitel(t('edit recipe'))
      setTitle(editRecipeX?.title)
      setSeasonStart(editRecipeX?.seasonStart)
      setSeasonEnd(editRecipeX?.seasonEnd)
      setOwnRating(editRecipeX?.ownRating)
      setGlobalCategory(editRecipeX?.globalCategory)
      setNumberOfPersons(editRecipeX?.numberOfPersons)
      setAuthorisation(editRecipeX?.authorisation)
      setPictureUrl(editRecipeX?.pictureUrlArray[0])
      setPictureUrlEdit(editRecipeX?.pictureUrlArray[0])
      setRecipe(editRecipeX?.recipe)
    }
  }, [id])

  /**
   * load articles belonging to the shopping list
   */
  useEffect(() => {
    const articleLlistRef = firestore.collection('global').doc('recipe')
      .collection('entries').doc(id).collection('articles')
    return articleLlistRef.orderBy('articleId', 'desc')
      .onSnapshot(({ docs }) => setArticleList(docs.map(toListArticle)))
  }, [userId, id])

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
   * save the recipe on the database
   */
  const handleSave = async () => {
    const creationDate = (new Date()).toString()
    const readAuthorisation = [] // TODO readAuthorisation function must be implemented
    const averageRating = 0 // TODO averageRating function must be implemented
    const pictureUrlArray = [pictureUrl]
    const entryData = {
      creationDate, title, pictureUrlArray, userId, readAuthorisation, seasonStart, seasonEnd,
      ownRating, averageRating, globalCategory, numberOfPersons, authorisation, recipe
    }
    if (!pictureUrlArray[0].startsWith('/assets') && !pictureUrlArray[0].startsWith('http')) {
      entryData.pictureUrlArray[0] = await savePicture(pictureUrlArray[0])
      if (id) {
        // delete old picture if changed during edit
        let imageRef = storage.refFromURL(pictureUrlEdit)
        await imageRef.delete()
      }
    }
    if (!id) {
      // save new recipe
      const entriesRef = firestore.collection('global').doc('recipe')
        .collection('entries')
      await entriesRef.add(entryData)
    } else {
      // update existing recipe
      const entriesRefUpdate = firestore.collection('global').doc('recipe')
        .collection('entries').doc(id)
      await entriesRefUpdate.update(entryData)
    }
    localStorage.removeItem('editRecipe')
    history.goBack()
  }

  /**
   * stores the rating value in the local variable
   * @param rate 
   */
  const handleRating = (rate: number) => {
    setOwnRating(rate)
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
            <IonLabel position="stacked">{t('recipe title')}</IonLabel>
            <IonInput value={title}
              onIonChange={(event) => setTitle(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('recipe picture')}</IonLabel><br />
            <input type="file" accept="image/*" hidden ref={fileInputRef} /*value={pictureUrl}*/
              onChange={handleFileChange}
            />
            <img src={pictureUrl} alt="" style={{ cursor: 'pointer' }}
              onClick={handlePictureClick}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('numberOfPersons')}</IonLabel>
            <IonInput type="number" value={numberOfPersons} placeholder={plhNumberOfPersons}
              onIonChange={(event) => setNumberOfPersons(parseInt(event.detail.value, 10))}
            />
            <IonNote slot="helper">{t('numberOfPersons for the recipe')}</IonNote>
            <IonNote slot="error">{t('invalid numberOfPersons')}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('category')}</IonLabel>
            <IonSelect placeholder={t('select category')} color="medium" value={globalCategory}
              onIonChange={(event) => setGlobalCategory(event.detail.value)}>
              {recipeCategories.map((rCat) => (
                <IonSelectOption key={rCat.id} value={rCat.id}>{t(rCat.name)}</IonSelectOption>
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
          <IonItem>
            <IonLabel position="stacked">{t('ownRating')}</IonLabel>
            <div className='ownRating'>
              <Rating
                size={25}
                initialValue={ownRating}
                tooltipDefaultText={t('placeholder ownRating')}
                onClick={handleRating}
                transition
                showTooltip
                fillColorArray={ratingColor}
                allowFraction
              />
            </div>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('authorisation')}</IonLabel>
            <IonSelect placeholder={t('select authorisation')} color="medium" value={authorisation}
              onIonChange={(event) => setAuthorisation(event.detail.value)}>
              {authStates.map((aStat) => (
                <IonSelectOption key={aStat.id} value={aStat.id}>{t(aStat.name)}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">{t('recipe')}</IonLabel>
            <IonTextarea value={recipe} placeholder={plhRecipe}
              onIonChange={(event) => setRecipe(event.detail.value)}
            />
          </IonItem>
          <IonButton expand="block" routerLink={`/my/recipes/addArticle/${id}/${'recipe'}`}>{t('add ingredient')}</IonButton>
          {articleList.map((articleList) =>
            <IonItem>
              <IonGrid>
                <IonRow>
                  <IonCol size="10">
                    <IonItem button key={articleList.id}
                      routerLink={`/my/recipes/addArticle/${id}/${articleList.id}/${1}/${'recipe'}`}>
                      <IonLabel>
                        <div>{formatedNumber(articleList.quantity)} {getUnitAbbrevFromUnitId(articleList.unitId)} {getArticleName(articleList.articleId)} {articleList.supplement}</div>
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="2">
                    <IonButton shape="round" fill="clear" onClick={() => deleteIngredient('recipe', id, articleList.id)}>
                      <IonIcon icon={trashIcon} slot="icon-only" />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>
          )}
          <IonButton expand="block" onClick={handleSave}>{t('save')}</IonButton>
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default AddRecipePage
