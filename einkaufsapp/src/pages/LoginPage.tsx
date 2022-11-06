import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { t } from 'i18next'
import React, { useState } from 'react'
import { Redirect } from 'react-router'
import { useAuth } from '../auth'
import { auth } from '../firebase'

const LoginPage: React.FC = () => {
  const { loggedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ loading: false, error: false })

  /**
   * covers all functions around logging in
   */
  const handleLogin = async () => {
    try {
      setStatus({ loading: true, error: false })
      const credential = await auth.signInWithEmailAndPassword(email, password)
      console.log('credential:', credential)
    } catch (error) {
      setStatus({ loading: false, error: true })
    }
  }

  if (loggedIn) {
    return <Redirect to="/my/lists" />
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('login')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position='stacked'>{t('email')}</IonLabel>
            <IonInput type='email' value={email}
              onIonChange={(event) => setEmail(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position='stacked'>{t('password')}</IonLabel>
            <IonInput type='password' value={password}
              onIonChange={(event) => setPassword(event.detail.value)}
            />
          </IonItem>
        </IonList>
        {status.error &&
          <IonText color="danger">{t('invalid credentials')}</IonText>
        }
        <IonButton expand='block' onClick={handleLogin}>{t('login')}</IonButton>
        <IonButton expand='block' fill="clear" routerLink='/register'>
          {t('dont have an account?')}
        </IonButton>
        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  )
}

export default LoginPage
