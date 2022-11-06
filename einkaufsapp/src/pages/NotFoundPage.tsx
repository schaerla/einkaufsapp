import {
  IonContent,
  IonPage,
} from '@ionic/react'
import { t } from 'i18next'
import React from 'react'

const NotFoundPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        {t('page not found')}
      </IonContent>
    </IonPage>
  )
}

export default NotFoundPage
