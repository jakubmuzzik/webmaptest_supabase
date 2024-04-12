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
    CITIES_STATE_CHANGE,
    CURRENT_DATA_COUNT_RESET,
    NEW_LADIES_COUNT_CHANGE,
    NEW_ESTABLISHMENTS_COUNT_CHANGE,
    NEW_PHOTOS_COUNT_CHANGE,
    NEW_VIDEOS_COUNT_CHANGE,
    NEW_LADIES_CHANGE,
    NEW_ESTABLISHMENTS_CHANGE,
    NEW_PHOTOS_CHANGE,
    NEW_VIDEOS_CHANGE
} from './actionTypes'
import { supabase } from '../supabase/config'
import { IN_REVIEW } from '../labels'

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

export const updateCities = (cities) => ({
    type: CITIES_STATE_CHANGE,
    cities
})

export const updateCurrentAuthUser = (currentAuthUser) => ({
    type: USER_AUTH_STATE_CHANGE,
    currentAuthUser
})

export const setNewLadiesCount = (newLadiesCount) => ({
    type: NEW_LADIES_COUNT_CHANGE,
    newLadiesCount
})

export const setNewEstablishmentsCount = (newEstablishmentsCount) => ({
    type: NEW_ESTABLISHMENTS_COUNT_CHANGE,
    newEstablishmentsCount
})

export const setNewPhotosCount = (newPhotosCount) => ({
    type: NEW_PHOTOS_COUNT_CHANGE,
    newPhotosCount
})

export const setNewVideosCount = (newVideosCount) => ({
    type: NEW_VIDEOS_COUNT_CHANGE,
    newVideosCount
})

export const setNewLadies = (newLadies) => ({
    type: NEW_LADIES_CHANGE,
    newLadies
})

export const setNewEstablishments = (newEstablishments) => ({
    type: NEW_ESTABLISHMENTS_CHANGE,
    newEstablishments
})

export const setNewPhotos = (newPhotos) => ({
    type: NEW_PHOTOS_CHANGE,
    newPhotos
})

export const setNewVideos = (newVideos) => ({
    type: NEW_VIDEOS_CHANGE,
    newVideos
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
        .order('created_date', { descending: true })

    if (error || !data || data.length === 0) {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: [] })
    } else {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: data })
    }
}

//updated in review lady 
export const updateNewLadyInRedux = (data) => (dispatch, getState) => {
    let newLadies = getState().adminState.newLadies ? JSON.parse(JSON.stringify(getState().adminState.newLadies)) : []

    let existingLady = newLadies.find(lady => lady.id === data.id)

    if (existingLady) {
        newLadies = newLadies.filter(lady => lady.id !== data.id)
        existingLady = {
            ...existingLady,
            ...data
        } 
    } else {
        existingLady = data
    }

    newLadies.push(existingLady)

    dispatch({ type: NEW_LADIES_CHANGE, newLadies })
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

export const fetchNewLadies = () => async (dispatch) => {
    const { data, error } = await supabase
        .from('ladies')
        .select('*, images(*), videos(*)')
        .eq('status', IN_REVIEW)
        .order('last_submitted_date', { descending: false })

    if (error || !data || data.length === 0) {
        dispatch(setNewLadies([]))
    } else {
        dispatch(setNewLadies(data))
    }
}