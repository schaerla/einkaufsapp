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

const RegisterPage: React.FC = () => {
  const { loggedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ loading: false, error: false })

  /**
   * handles registration with an e-mail address
   */
  const handleRegister = async () => {
    try {
      setStatus({ loading: true, error: false })
      const credential = await auth.createUserWithEmailAndPassword(email, password)
      console.log('credential:', credential)
    } catch (error) {
      setStatus({ loading: false, error: true })
    }

  };

  if (loggedIn) {
    return <Redirect to="/my/lists" />
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('register')}</IonTitle>
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
          <IonText color="danger">{t('registration failed')}</IonText>
        }
        <IonButton expand='block' onClick={handleRegister}>{t('create account')}</IonButton>
        <IonButton expand='block' fill="clear" routerLink='/login'>
          {t('already have an account?')}
        </IonButton>
        <IonLoading isOpen={status.loading} />
      </IonContent>
    </IonPage>
  )
}

export default RegisterPage
