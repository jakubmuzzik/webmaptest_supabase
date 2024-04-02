import {
    ROUTE_STATE_CHANGE,
    SCROLL_DISABLED_STATE_CHANGE,
    USER_STATE_CHANGE,
    USER_AUTH_STATE_CHANGE,
    CLEAR_DATA,
    LADIES_STATE_CHANGE,
    STORE_TOAST_REF,
    CURRENT_LADIES_COUNT_CHANGE,
    CURRENT_MASSEUSES_COUNT_CHANGE,
    CURRENT_ESTABLISHMENTS_COUNT_CHANGE,
    LADY_CITIES_STATE_CHANGE,
    ESTABLISHMENT_CITIES_STATE_CHANGE,
    CURRENT_DATA_COUNT_RESET
} from './actionTypes'
import { getAuth, getDoc, doc, db, signOut, getDocs, query, collection, where, getCountFromServer } from '../firebase/config'
import { ACTIVE, DELETED } from '../labels'
import { supabase } from '../supabase/config'

export const updateRoute = (route) => ({
    type: ROUTE_STATE_CHANGE,
    route
})

export const updateScrollDisabled = (scrollDisabled) => ({
    type: SCROLL_DISABLED_STATE_CHANGE,
    scrollDisabled
})

export const storeToastRef = (toastRef) => ({
    type: STORE_TOAST_REF,
    toastRef
})

//either independent lady or establishemtn
export const updateCurrentUserInRedux = (data) => ({
    type: USER_STATE_CHANGE,
    data
})

export const updateCurrentLadiesCount = (currentLadiesCount) => ({
    type: CURRENT_LADIES_COUNT_CHANGE,
    currentLadiesCount
})

export const updateCurrentMasseusesCount = (currentMasseusesCount) => ({
    type: CURRENT_MASSEUSES_COUNT_CHANGE,
    currentMasseusesCount
})

export const updateCurrentEstablishmentsCount = (currentEstablishmentsCount) => ({
    type: CURRENT_ESTABLISHMENTS_COUNT_CHANGE,
    currentEstablishmentsCount
})

export const resetAllCurrentDataCount = () => ({
    type: CURRENT_DATA_COUNT_RESET
})

export const updateLadyCities = (ladyCities) => ({
    type: LADY_CITIES_STATE_CHANGE,
    ladyCities
})

export const updateEstablishmentCities = (establishmentCities) => ({
    type: ESTABLISHMENT_CITIES_STATE_CHANGE,
    establishmentCities
})

export const updateCurrentAuthUser = (currentAuthUser) => ({
    type: USER_AUTH_STATE_CHANGE,
    currentAuthUser
})

/**
 * 
 * @description Redux thunk functions
 */
export const fetchUser = (userId, userType) => async (dispatch, getState) => {
    const { data, error } = await supabase
        .from(userType === 'lady' ? 'ladies' : 'establishments')
        .select('*, images(*), videos(*)')
        .eq('id', userId)
        .limit(1)

    if (error || !data || data.length === 0) {
        dispatch(logOut())
        return
    }

    dispatch({ type: USER_STATE_CHANGE, data: data[0] })
}

export const fetchLadies = () => async (dispatch, getState) => {
    const { data, error } = await supabase
        .from('ladies')
        .select('*, images(*), videos(*)')
        .eq('establishment_id', getState().userState.currentAuthUser.id)

    if (error || !data || data.length === 0) {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: [] })
    } else {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)) })
    }

    /*return getDocs(query(collection(db, "users"), where('establishment_id', '==', getAuth().currentUser.uid), where('status', '!=', DELETED)))
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('empty')
                dispatch({ type: LADIES_STATE_CHANGE, ladies: [] })
            } else {
                const ladies = snapshot.docs
                    .map(doc => {
                        const data = doc.data()
                        const id = doc.id
                        return { id, ...data }
                    })
                    .sort((a, b) => b.created_date.toDate() - a.created_date.toDate())

                dispatch({ type: LADIES_STATE_CHANGE, ladies })
            }
        })*/
}

//lady under establishment
export const updateLadyInRedux = (data) => (dispatch, getState) => {
    let ladies = getState().userState.ladies ? JSON.parse(JSON.stringify(getState().userState.ladies)) : []

    let existingLady = ladies.find(lady => lady.id === data.id)

    if (existingLady) {
        ladies = ladies.filter(lady => lady.id !== data.id)
        existingLady = {
            ...existingLady,
            ...data
        } 
    } else {
        existingLady = data
    }

    ladies.push(existingLady)

    dispatch({ type: LADIES_STATE_CHANGE, ladies })
}

export const removeLadyFromRedux = (toRemoveId) => (dispatch, getState) => {
    let ladies = JSON.parse(JSON.stringify(getState().userState.ladies))

    ladies = ladies.filter(lady => lady.id !== toRemoveId)

    dispatch({ type: LADIES_STATE_CHANGE, ladies })
}

export const logOut = () => async (dispatch, getState) => {
    const { error } = await supabase.auth.signOut()
    if (error) {
        return
    }
    dispatch({ type: CLEAR_DATA })
}