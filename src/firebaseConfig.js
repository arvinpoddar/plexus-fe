import { initializeApp } from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

let firebaseConfig

switch (process.env.DEPLOYMENT) {
  case 'Production':
    firebaseConfig = {
      apiKey: 'AIzaSyDsUP_7qTPO4kiFRHDJv06-PN7rW-4Pmso',
      authDomain: 'plexus-47894.firebaseapp.com',
      projectId: 'plexus-47894',
      storageBucket: 'plexus-47894.appspot.com',
      messagingSenderId: '1014564983903',
      appId: '1:1014564983903:web:26c847ee01b5dc98c677ea'
    }
    break
  default:
    firebaseConfig = {
      apiKey: 'AIzaSyA5Y8XlhlN8Ea6ws3MO3sJo8fKcmyl5pBI',
      authDomain: 'plexus-dev-9b1bd.firebaseapp.com',
      projectId: 'plexus-dev-9b1bd',
      storageBucket: 'plexus-dev-9b1bd.appspot.com',
      messagingSenderId: '100505952663',
      appId: '1:100505952663:web:0b0f508c3c6f8ad91964d2'
    }
}

// Initialize Firebase
export default initializeApp(firebaseConfig)
