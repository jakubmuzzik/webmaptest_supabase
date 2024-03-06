import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
    orderBy,
    startAt,
    endAt,
    addDoc,
    documentId,
    limit,
    onSnapshot,
    writeBatch,
    runTransaction,
    initializeFirestore,
    arrayRemove,
    getCountFromServer,
    startAfter,
    arrayUnion
} from 'firebase/firestore'
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    reload,
    updateEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser,
    signInAnonymously,
    linkWithCredential,
    indexedDBLocalPersistence,
    validatePassword,
    verifyBeforeUpdateEmail,
    fetchSignInMethodsForEmail
} from 'firebase/auth'
import { 
    getStorage,
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject,
    listAll,
    uploadBytesResumable
} from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyDQ2GSeCLqcqafc36Y0lq1cDPXRK4SM5N8",
    authDomain: "l4f-dev.firebaseapp.com",
    projectId: "l4f-dev",
    storageBucket: "l4f-dev.appspot.com",
    messagingSenderId: "288112859189",
    appId: "1:288112859189:web:47a64d0172361b1312397c"
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig, {
    persistence: indexedDBLocalPersistence
})

const db = initializeFirestore(firebaseApp, {
    experimentalAutoDetectLongPolling: true
})
const storage = getStorage(firebaseApp)

export { 
    db, 
    storage,
    ref, 
    uploadBytes, 
    getDownloadURL,
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    updateDoc,
    setDoc,
    deleteDoc,
    doc, 
    getAuth, 
    onAuthStateChanged,
    orderBy,
    startAt,
    endAt,
    createUserWithEmailAndPassword,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    addDoc,
    documentId,
    limit,
    onSnapshot,
    writeBatch,
    runTransaction,
    sendPasswordResetEmail,
    sendEmailVerification,
    reload,
    updateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteObject,
    deleteUser,
    listAll,
    arrayRemove,
    arrayUnion,
    signInAnonymously,
    linkWithCredential,
    getCountFromServer,
    startAfter,
    validatePassword,
    verifyBeforeUpdateEmail,
    fetchSignInMethodsForEmail,
    uploadBytesResumable
}