import {
    ROUTE_STATE_CHANGE,
    SCROLL_DISABLED_STATE_CHANGE,
    USER_STATE_CHANGE,
    CLEAR_DATA,
    LADIES_STATE_CHANGE,
    STORE_TOAST_REF,
    LADIES_COUNT_CHANGE,
    MASSEUSES_COUNT_CHANGE,
    ESTABLISHMENTS_COUNT_CHANGE,
    LADY_CITIES_STATE_CHANGE,
    ESTABLISHMENT_CITIES_STATE_CHANGE,
    LADIES_PAGINATION_DATA_STATE_CHANGE,
    MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    RESET_LADIES_PAGINATION_DATA,
    RESET_MASSEUSES_PAGINATION_DATA,
    RESET_ESTABLISHMENTS_PAGINATION_DATA,
    RESET_ALL_PAGINATION_DATA
} from './actionTypes'
import { getAuth, getDoc, doc, db, signOut, getDocs, query, collection, where, getCountFromServer } from '../firebase/config'
import { ACTIVE, DELETED } from '../labels'

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

export const updateLadiesCount = (ladiesCount) => ({
    type: LADIES_COUNT_CHANGE,
    ladiesCount
})

export const updateMasseusesCount = (masseusesCount) => ({
    type: MASSEUSES_COUNT_CHANGE,
    masseusesCount
})

export const updateEstablishmentsCount = (establishmentsCount) => ({
    type: ESTABLISHMENTS_COUNT_CHANGE,
    establishmentsCount
})

export const updateLadiesData = (data, pageNumber) => ({
    type: LADIES_PAGINATION_DATA_STATE_CHANGE,
    data,
    pageNumber
})

export const updateMasseusesData = (data, pageNumber) => ({
    type: MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    data,
    pageNumber
})

export const updateEstablishmentsData = (data, pageNumber) => ({
    type: ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    data,
    pageNumber
})

export const updateLadyCities = (ladyCities) => ({
    type: LADY_CITIES_STATE_CHANGE,
    ladyCities
})

export const updateEstablishmentCities = (establishmentCities) => ({
    type: ESTABLISHMENT_CITIES_STATE_CHANGE,
    establishmentCities
})

export const resetLadiesData = () => ({
    type: RESET_LADIES_PAGINATION_DATA
})

export const resetMasseusesData = () => ({
    type: RESET_MASSEUSES_PAGINATION_DATA
})

export const resetEstablishmentsData = () => ({
    type: RESET_ESTABLISHMENTS_PAGINATION_DATA
})

export const resetAllPaginationData = () => ({
    type: RESET_ALL_PAGINATION_DATA
})

/**
 * 
 * @description Redux thunk functions
 */
export const fetchUser = () => (dispatch, getState) => {
    return getDoc(doc(db, 'users', getAuth().currentUser.uid))
        .then((snapshot) => {
            if (snapshot.exists()) {
                dispatch({ type: USER_STATE_CHANGE, data: snapshot.data() })
            } else {
                dispatch(logOut())
            }
        })
}

export const fetchLadies = () => (dispatch, getState) => {
    return getDocs(query(collection(db, "users"), where('establishmentId', '==', getAuth().currentUser.uid), where('status', '!=', DELETED)))
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
                    .sort((a, b) => b.createdDate.toDate() - a.createdDate.toDate())

                dispatch({ type: LADIES_STATE_CHANGE, ladies })
            }
        })
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

export const logOut = () => (dispatch, getState) => {
    signOut(getAuth())
    dispatch({ type: CLEAR_DATA })
}