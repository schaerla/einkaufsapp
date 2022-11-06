import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react'
import { home as homeIcon, settings as settingsIcon } from 'ionicons/icons'
import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/Settings'
import { useAuth } from './auth'
import { t } from 'i18next'
import AddShoppinglistPage from './pages/AddShoppinglistPage'
import ShoppinglistPage from './pages/ShoppinglistPage'
import AddRecipePage from './pages/AddRecipePage'
import AddArticlePage from './pages/AddArticlePage'
import RecipePage from './pages/RecipePage'
import ArticleListPage from './pages/ArticleListPage'
import ArticlePage from './pages/ArticlePage'
import AddArticleToAList from './pages/AddArticleToAList'
import AddArticleToShoppinglist from './pages/AddArticleToShoppinglist'
import InfiniteRecipePage from './pages/InfiniteRecipePage'
import InfiniteRecipePageReload from './pages/InfiniteRecipePageReload'
import InfiniteRecipePageReloadInfScrol from './pages/InfiniteRecipePageReloadInfScrol'
import InfiniteShoppinglistPageReloadInfScrol from './pages/InfiniteShoppinglistPageReloadInfScrol'

const AppTabs: React.FC = () => {
  const { loggedIn } = useAuth()
  if (!loggedIn) {
    return <Redirect to="/login" />
  }
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/my/lists">
          <HomePage />
        </Route>
        <Route exact path="/my/lists/add">
          <AddShoppinglistPage />
        </Route>
        <Route exact path="/my/lists/add/:id">
          <AddShoppinglistPage />
        </Route>
        <Route exact path="/my/lists/InfiniteListReloadInfScrol">
          <InfiniteShoppinglistPageReloadInfScrol />
        </Route>
        <Route exact path="/my/lists/addArticle/:id/:listType">
          <AddArticleToAList />
        </Route>
        <Route exact path="/my/lists/addArticle/:id/:articleIdEdit/:edit/:listType">
          <AddArticleToAList />
        </Route>
        <Route exact path="/my/lists/addArticleFromRecipe/:quantity/:recipeIdAdd">
          <AddArticleToShoppinglist />
        </Route>
        <Route exact path="/my/article/addArticle">
          <AddArticlePage />
        </Route>
        <Route exact path="/my/article/addArticle/:id">
          <AddArticlePage />
        </Route>
        <Route exact path="/my/article/viewArticle/:id">
          <ArticlePage />
        </Route>
        <Route exact path="/my/article/viewArticlelist/:userID">
          <ArticleListPage />
        </Route>
        <Route exact path="/my/lists/view/:id">
          <ShoppinglistPage />
        </Route>
        <Route exact path="/my/recipes/add">
          <AddRecipePage />
        </Route>
        <Route exact path="/my/recipes/add/:id">
          <AddRecipePage />
        </Route>
        <Route exact path="/my/recipes/view/:id">
          <RecipePage />
        </Route>
        <Route exact path="/my/recipes/infiniteList">
          <InfiniteRecipePage />
        </Route>
        <Route exact path="/my/recipes/InfiniteListReload">
          <InfiniteRecipePageReload />
        </Route>
        <Route exact path="/my/recipes/InfiniteListReloadInfScrol">
          <InfiniteRecipePageReloadInfScrol />
        </Route>
        <Route exact path="/my/recipes/addArticle/:id/:listType">
          <AddArticleToAList />
        </Route>
        <Route exact path="/my/recipes/addArticle/:id/:articleIdEdit/:edit/:listType">
          <AddArticleToAList />
        </Route>
        <Route exact path="/my/settings">
          <SettingsPage />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/my/lists">
          <IonIcon icon={homeIcon} />
          <IonLabel>{t('home')}</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/my/settings">
          <IonIcon icon={settingsIcon} />
          <IonLabel>{t('settings')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  )
}

export default AppTabs
