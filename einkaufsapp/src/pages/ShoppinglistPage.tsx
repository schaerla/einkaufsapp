import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { add as addIcon, trash as trashIcon, pencilOutline as editIcon, contractOutline as summariseIcon, expandOutline as expandIcon } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useAuth } from '../auth'
import { formatDate } from '../date'
import { firestore, storage } from '../firebase'
import { IdParams, Shoppinglist, ListArticle, toShoppinglist, toListArticle } from '../models'
import { t } from 'i18next'
import { deleteIngredient, formatedNumber, getArticleName, getCategoryName, getPictureUrl, getUnitAbbrevFromUnitId } from '../functions'

const ShoppinglistPage: React.FC = () => {
  const { userId } = useAuth()
  const history = useHistory()
  const { id } = useParams<IdParams>()
  const [list, setList] = useState<Shoppinglist>()
  const [articleList, setArticleList] = useState<ListArticle[]>([])
  const [articleListSorted, setArticleListSorted] = useState<ListArticle[]>([])
  const [showSummarisedOnly, setShowSummarisedOnly] = useState(false)
  const [refreshData, setRefreshData] = useState(false)
  const [showEditingOptions, setShowEditingOptions] = useState(false)

  useEffect(() => {
    // load shoppinglist from DB
    const listRef = firestore.collection('global').doc('shoppinglist')
      .collection('entries').doc(id)
    listRef.get().then((doc) => setList(toShoppinglist(doc)))
    // load articles belonging to the shopping list
    const articleLlistRef = firestore.collection('global').doc('shoppinglist')
      .collection('entries').doc(id).collection('articles')
    return articleLlistRef.orderBy('articleId', 'desc')
      .onSnapshot(({ docs }) => setArticleList(docs.map(toListArticle)))
  }, [userId, id])

  /**
   * delete the shopping list and the associated images
   */
  const handleDelete = async () => {
    // delete shoping list
    const listRef = firestore.collection('global').doc('shoppinglist')
      .collection('entries').doc(id)
    await listRef.delete()
    // delete picture from shoping list
    if (!list?.pictureUrl.startsWith('/assets')) {
      let imageRef = storage.refFromURL(list?.pictureUrl)
      await imageRef.delete()
    }
    // delete 'editShoppinglist' in local stoarage
    localStorage.removeItem('editShoppinglist')
    history.goBack()
  }

  // save shopping list in local storage for edit
  localStorage.setItem('editShoppinglist', JSON.stringify(list))
  localStorage.setItem('editListArt', JSON.stringify(articleList))

  /**
   * sumarise article with the same articleId and the same unitId
   */
  const handleSummarise = async () => {
    const artListSortedId = structuredClone(articleList).sort((a, b) => (a.articleId & a.unitId) > (b.articleId & a.unitId) ? 1 : -1)
    //console.log('artListSortdedId:', artListSortedId) // Debug only
    const artListSorted = [].concat(artListSortedId).sort((a, b) => a.unitId > b.unitId ? 1 : -1)
    //console.log('artListSortded:', artListSorted) // Debug only
    for (let i = 0; i < artListSorted.length - 1; i++) {
      if (artListSorted[i].articleId === artListSorted[i + 1].articleId &&
        artListSorted[i].unitId === artListSorted[i + 1].unitId) {
        artListSorted[i].quantity = (artListSorted[i].quantity + artListSorted[i + 1].quantity)
        if (!artListSorted[i].summarisedArticleIds?.length) {
          artListSorted[i].summarisedArticleIds = [artListSorted[i + 1].id]
        } else {
          artListSorted[i].summarisedArticleIds[artListSorted[i].summarisedArticleIds?.length] = artListSorted[i + 1].id
        }
        artListSorted.splice(i + 1, 1)
        i--
      }
    }
    //console.log('artListSortdedSummarised:', artListSorted) // Debug only
    setArticleListSorted(artListSorted)
    setShowSummarisedOnly(true)
    setRefreshData(!refreshData)
  }

  /**
  * normalise article view
  */
  const handleExpand = async () => {
    setShowSummarisedOnly(false)
    setRefreshData(!refreshData)
  }

  /**
   * update the articleList data on the frontend
   */
  useEffect(() => {
    setArticleListSorted(articleListSorted)
    setArticleList(articleList)
  }, [refreshData, articleListSorted, articleList])

  /**
   * activate edite functions for own list only
   */
  useEffect(() => {
    if (userId === list?.userId) {
      setShowEditingOptions(true)
    }
  }, [userId, list])

  /**
   * deletes multi ingredients from the database
   * @param doctype is the type of document "recipe" or "shoppinglist"
   * @param docId is the id from the doctype object
   * @param delArticleId is the id from the ingredient where is to delete
   * @param summarisedArticleIds is a array of id's from the summarised articles where are to delete
   */
  function deleteMultiIngredient(doctype, docId, delArticleId, summarisedArticleIds: Array<string>) {
    if (summarisedArticleIds) {
      for (let i = 0; i < summarisedArticleIds.length; i++) {
        deleteIngredient(doctype, docId, summarisedArticleIds[i])
      }
    }
    deleteIngredient(doctype, docId, delArticleId)
    articleListSorted.splice(articleListSorted.indexOf(delArticleId), 1)
    setRefreshData(!refreshData)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>{list?.listTitle}</IonTitle>
          <IonButtons slot="end" style={{ display: showEditingOptions ? "initial" : "none" }}>
            <IonButton routerLink={`/my/lists/add/${id}`}>
              <IonIcon icon={editIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end" style={{ display: showEditingOptions ? "initial" : "none" }}>
            <IonButton onClick={handleDelete}>
              <IonIcon icon={trashIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end" style={{ display: showSummarisedOnly ? "none" : "initial" }}>
            <IonButton onClick={handleSummarise}>
              <IonIcon icon={summariseIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end" style={{ display: showSummarisedOnly ? "initial" : "none" }}>
            <IonButton onClick={handleExpand} >
              <IonIcon icon={expandIcon} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className='creationDate'>{t('creationDate')}: {formatDate(list?.creationDate)}</div>
        <IonGrid id='full-list' className='article'>
          <IonRow>
            {articleList.sort((a, b) => getCategoryName(a.articleId) + getArticleName(a.articleId) > getCategoryName(b.articleId) + getArticleName(b.articleId) ? 1 : -1).map((articleList) =>
              <IonCol size="4" size-md="3" size-lg="2" size-xl="1.5" style={{ display: showSummarisedOnly ? "none" : "initial" }}>
                <IonItem button className='articleItem' key={articleList.id} onClick={() => deleteIngredient('shoppinglist', list?.id, articleList.id)}>
                  <IonLabel>
                  <img src={getPictureUrl(articleList.articleId)} alt={getArticleName(articleList.articleId)}></img>
                    <h2>{getArticleName(articleList.articleId)}</h2>
                    <p>{formatedNumber(articleList.quantity)} {getUnitAbbrevFromUnitId(articleList.unitId)}</p>
                    {/*<p>Debug: {articleList.quantity}</p>
                    <p>id: {articleList.id}</p>
                    <p>articleId: {articleList.articleId}</p>*/}
                  </IonLabel>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        <IonGrid id='list-summarised' className='article'>
          <IonRow>
            {articleListSorted.sort((a, b) => getCategoryName(a.articleId) + getArticleName(a.articleId) > getCategoryName(b.articleId) + getArticleName(b.articleId) ? 1 : -1).map((articleList) =>
              <IonCol size="4" size-md="3" size-lg="2" size-xl="1.5" style={{ display: showSummarisedOnly ? "initial" : "none" }}>
                <IonItem button className='articleItem' key={articleList.id} onClick={() => deleteMultiIngredient('shoppinglist', list?.id, articleList.id, articleList.summarisedArticleIds)}>
                  <IonLabel>
                  <img src={getPictureUrl(articleList.articleId)} alt={getArticleName(articleList.articleId)} height={70}></img>
                    <h2>{getArticleName(articleList.articleId)}</h2>
                    <p>{formatedNumber(articleList.quantity)} {getUnitAbbrevFromUnitId(articleList.unitId)}</p>
                    {/*<p>Debug: {articleList.quantity}</p>
                    <p>id: {articleList.id}</p>
                    <p>articleId: {articleList.articleId}</p>*/}
                  </IonLabel>
                </IonItem>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton routerLink={`/my/lists/addArticle/${id}/${'shoppinglist'}`}>
            <IonIcon icon={addIcon} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}

export default ShoppinglistPage
