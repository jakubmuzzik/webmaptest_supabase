import {
    NEW_LADIES_COUNT_CHANGE,
    NEW_ESTABLISHMENTS_COUNT_CHANGE,
    NEW_PHOTOS_COUNT_CHANGE,
    NEW_VIDEOS_COUNT_CHANGE,
    NEW_LADIES_CHANGE,
    NEW_ESTABLISHMENTS_CHANGE,
    NEW_PHOTOS_CHANGE,
    NEW_VIDEOS_CHANGE,
    CLEAR_DATA
} from '../actionTypes'

const INITIAL_STATE = {
    newLadiesCount: null,
    newEstablishmentsCount: null,
    newPhotosCount: null,
    newVideosCount: null,
    newLadies: null,
    newEstablishments: null,
    newPhotos: null,
    newVideos: null
}

export const admin = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case NEW_LADIES_COUNT_CHANGE:
            return {
                ...state,
                newLadiesCount: action.newLadiesCount
            }
        case NEW_ESTABLISHMENTS_COUNT_CHANGE:
            return {
                ...state,
                newEstablishmentsCount: action.newEstablishmentsCount
            }
        case NEW_PHOTOS_COUNT_CHANGE:
            return {
                ...state,
                newPhotosCount: action.newPhotosCount
            }
        case NEW_VIDEOS_COUNT_CHANGE:
            return {
                ...state,
                newVideosCount: action.newVideosCount
            }
        case NEW_LADIES_CHANGE:
            return {
                ...state,
                newLadies: action.newLadies
            }
        case NEW_ESTABLISHMENTS_CHANGE:
            return {
                ...state,
                newEstablishments: action.newEstablishments
            }
        case NEW_PHOTOS_CHANGE:
            return {
                ...state,
                newPhotos: action.newPhotos
            }
        case NEW_VIDEOS_CHANGE:
            return {
                ...state,
                newVideos: action.newVideos
            }
        case CLEAR_DATA:
            return {
                ...INITIAL_STATE
            }
        default:
            return state;
    }
}