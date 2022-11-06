import {
  IonApp, IonLoading,
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { AuthContext, useAuthInit } from './auth'
import AppTabs from './AppTabs'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import i18next from 'i18next'

/**
 * changes the language of the UI
 * @param lng 
 */
export function changeAppLanguage(lng) {
  i18next.changeLanguage(lng)
  window.location.reload()
}

const App: React.FC = () => {
  const { loading, auth } = useAuthInit()
  if (loading) {
    return <IonLoading isOpen />
  }
  console.log(`rendering App with authState:`, auth)
  return (
    <IonApp>
      <AuthContext.Provider value={auth}>
        <IonReactRouter>
          <Switch>
            <Route exact path="/login">
              <LoginPage />
            </Route>
            <Route exact path="/register">
              <RegisterPage />
            </Route>
            <Route path="/my">
              <AppTabs />
            </Route>
            <Redirect exact path='/' to="/my/lists" />
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </IonReactRouter>
      </AuthContext.Provider>
    </IonApp>
  )
}

export default App