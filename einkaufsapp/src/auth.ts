import React, { useContext, useEffect, useState } from "react"
import { auth as firebaseAuth, firestore } from "./firebase"

/**
 * login status and user data
 */
interface Auth {
    loggedIn: boolean
    userId?: string
    userMail?: string
}

/**
 * 
 */
interface AuthInit {
    loading: boolean
    auth?: Auth
}

export const AuthContext = React.createContext<Auth>({ loggedIn: false })

export function useAuth(): Auth {
    return useContext(AuthContext)
}

/**
 * 
 * @returns user data
 */
export function useAuthInit(): AuthInit {
    const [authInit, setAuthInit] = useState<AuthInit>({ loading: true })
    useEffect(() => {
        return firebaseAuth.onAuthStateChanged((firebaseUser) => {
            const auth = firebaseUser ?
                { loggedIn: true, userId: firebaseUser.uid, userMail: firebaseUser.email } :
                { loggedIn: false }
            setAuthInit({ loading: false, auth })
            actualiceUserFindingList(firebaseUser.uid, firebaseUser.email)
        })
    }, [])
    return authInit
}

/**
 * store the user mailadress and the coresponding userId to the database for authorisation
 * functions
 * @param userId 
 * @param userMail 
 */
function actualiceUserFindingList(userId, userMail) {
    const eMail = structuredClone(userMail)
    const id = structuredClone(userId)
    var docExist = false

    const userRef = firestore.collection('users').doc(userId).collection('settings').doc(userId)
    userRef.get().then((doc) => {
        if (doc.exists) { docExist = true }
    })

    const entryData = { id, eMail }

    if (!docExist) {
        // save new authUser
        const entriesRef = firestore.collection('users').doc('publiclist').collection('users').doc(userId)
        entriesRef.set(entryData)
    } else {
        // update existing authUser
        const entriesRefUpdate = firestore.collection('users').doc('publiclist').collection('users').doc(userId)
        entriesRefUpdate.update(entryData)
    }
}