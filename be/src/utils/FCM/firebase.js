import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.firebase_apiKey,
    authDomain: process.env.firebase_authDomain,
    projectId: process.env.firebase_projectId,
    storageBucket: process.env.firebase_storageBucket,
    messagingSenderId: process.env.firebase_messagingSenderId,
    appId: process.env.firebase_appId
};


const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
getToken(messaging, { vapidKey: process.env.firebase_vapidkey }).then((currentToken) => {
    if (currentToken) {
        // Send the token to your server and update the UI if necessary
        // ...
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    // ...
});
