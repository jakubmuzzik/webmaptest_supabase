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
    NEW_LADIES_COUNT_CHANGE,
    NEW_ESTABLISHMENTS_COUNT_CHANGE,
    NEW_PHOTOS_COUNT_CHANGE,
    NEW_VIDEOS_COUNT_CHANGE,
    NEW_LADIES_CHANGE,
    NEW_ESTABLISHMENTS_CHANGE,
    NEW_PHOTOS_CHANGE,
    NEW_VIDEOS_CHANGE,
    ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    LADIES_PAGINATION_DATA_STATE_CHANGE,
    MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    RESET_LADIES_PAGINATION_DATA,
    RESET_MASSEUSES_PAGINATION_DATA,
    RESET_ESTABLISHMENTS_PAGINATION_DATA,
} from './actionTypes'
import { supabase } from '../supabase/config'
import { IN_REVIEW, ACTIVE } from '../labels'

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

export const setLadiesPaginationData = (pageNumber, data) => ({
    type: LADIES_PAGINATION_DATA_STATE_CHANGE,
    pageNumber,
    data
})

export const setMasseusesPaginationData = (pageNumber, data) => ({
    type: MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    pageNumber,
    data
})

export const setEstablishmentsPaginationData = (pageNumber, data) => ({
    type: ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    pageNumber,
    data
})

export const resetLadiesPaginationData = () => ({
    type: RESET_LADIES_PAGINATION_DATA
})

export const resetMasseusesPaginationData = () => ({
    type: RESET_MASSEUSES_PAGINATION_DATA
})

export const resetEstablishmentsPaginationData = () => ({
    type: RESET_ESTABLISHMENTS_PAGINATION_DATA
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
        .order('created_date', { ascending: false })

    if (error || !data || data.length === 0) {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: [] })
    } else {
        dispatch({ type: LADIES_STATE_CHANGE, ladies: data })
    }
}

export const setNewLadies = (newLadies) => (dispatch, getState) => {
    dispatch({ type: NEW_LADIES_CHANGE, newLadies })

    if (getState().adminState.newLadiesCount !== newLadies.length) {
        dispatch({ type: NEW_LADIES_COUNT_CHANGE, newLadiesCount: newLadies.length })
    }
}

export const setNewEstablishments = (newEstablishments) => (dispatch, getState) => {
    dispatch({ type: NEW_ESTABLISHMENTS_CHANGE, newEstablishments })

    if (getState().adminState.newEstablishmentsCount !== newEstablishments.length) {
        dispatch({ type: NEW_ESTABLISHMENTS_COUNT_CHANGE, newEstablishmentsCount: newEstablishments.length })
    }
}

export const setNewPhotos = (newPhotos) => (dispatch, getState) => {
    dispatch({ type: NEW_PHOTOS_CHANGE, newPhotos })

    if (getState().adminState.newPhotosCount !== newPhotos.length) {
        dispatch({ type: NEW_PHOTOS_COUNT_CHANGE, newPhotosCount: newPhotos.length })
    }
}

export const setNewVideos = (newVideos) => (dispatch, getState) => {
    dispatch({ type: NEW_VIDEOS_CHANGE, newVideos })

    if (getState().adminState.newVideosCount !== newVideos.length) {
        dispatch({ type: NEW_VIDEOS_COUNT_CHANGE, newVideosCount: newVideos.length })
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

//updated in review lady 
export const updateNewEstablishmentInRedux = (data) => (dispatch, getState) => {
    let newEstablishments = getState().adminState.newEstablishments ? JSON.parse(JSON.stringify(getState().adminState.newEstablishments)) : []

    let existingEstablishment = newEstablishments.find(lady => lady.id === data.id)

    if (existingEstablishment) {
        newEstablishments = newEstablishments.filter(est => est.id !== data.id)
        existingEstablishment = {
            ...existingEstablishment,
            ...data
        } 
    } else {
        existingEstablishment = data
    }

    newEstablishments.push(existingEstablishment)

    dispatch({ type: NEW_ESTABLISHMENTS_CHANGE, newEstablishments })
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
        .order('last_submitted_date', { ascending: true })

    if (error || !data || data.length === 0) {
        dispatch(setNewLadies([]))
    } else {
        dispatch(setNewLadies(data))
    }
}

export const fetchNewEstablishments = () => async (dispatch) => {
    const { data, error } = await supabase
        .from('establishments')
        .select('*, images(*), videos(*)')
        .eq('status', IN_REVIEW)
        .order('last_submitted_date', { ascending: true })

    if (error || !data || data.length === 0) {
        dispatch(setNewEstablishments([]))
    } else {
        dispatch(setNewEstablishments(data))
    }
}

export const fetchNewPhotos = () => async (dispatch) => {
    const ladiesQuery = supabase
        .from('images')
        .select('*,ladies!inner(status,name,id)')
        .eq('status', IN_REVIEW)
        .eq('ladies.status', ACTIVE)

    const estQuery = supabase
        .from('images')
        .select('*,establishments!inner(status,name,id)')
        .eq('status', IN_REVIEW)
        .eq('establishments.status', ACTIVE)

    const results = await Promise.all([
        ladiesQuery,
        estQuery
    ])

    let newPhotos = []

    if (results[0].data?.length > 0) {
        newPhotos = results[0].data
    }
    if (results[1].data?.length > 0) {
        newPhotos = newPhotos.concat(results[1].data)
    }

    dispatch(setNewPhotos(newPhotos))
}

export const fetchNewVideos = () => async (dispatch) => {
    const ladiesQuery = supabase
        .from('videos')
        .select('*,ladies!inner(status,name,id)')
        .eq('status', IN_REVIEW)
        .eq('ladies.status', ACTIVE)

    const estQuery = supabase
        .from('videos')
        .select('*,establishments!inner(status,name,id)')
        .eq('status', IN_REVIEW)
        .eq('establishments.status', ACTIVE)

    const results = await Promise.all([
        ladiesQuery,
        estQuery
    ])

    let newVideos = []

    if (results[0].data?.length > 0) {
        newVideos = results[0].data
    }
    if (results[1].data?.length > 0) {
        newVideos = newVideos.concat(results[1].data)
    }

    dispatch(setNewVideos(newVideos))
}