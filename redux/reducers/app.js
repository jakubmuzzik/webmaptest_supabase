import {
    ROUTE_STATE_CHANGE,
    SCROLL_DISABLED_STATE_CHANGE,
    STORE_TOAST_REF,
    CURRENT_LADIES_COUNT_CHANGE,
    CURRENT_MASSEUSES_COUNT_CHANGE,
    CURRENT_ESTABLISHMENTS_COUNT_CHANGE,
    CITIES_STATE_CHANGE,
    ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    LADIES_PAGINATION_DATA_STATE_CHANGE,
    MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    RESET_LADIES_PAGINATION_DATA,
    RESET_MASSEUSES_PAGINATION_DATA,
    RESET_ESTABLISHMENTS_PAGINATION_DATA,
} from '../actionTypes'

const INITIAL_STATE = {
    route: {},
    scrollDisabled: false,
    toastRef: undefined,
    currentLadiesCount: undefined,
    currentMasseusesCount: undefined,
    currentEstablishmentsCount: undefined,
    cities: undefined,
    ladiesData: {}, //pagination data
    masseusesData: {}, //pagination data
    establishentsData: {} //pagination data
}

export const app = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ROUTE_STATE_CHANGE:
            return {
                ...state,
                route: action.route
            }
        case SCROLL_DISABLED_STATE_CHANGE:
            return {
                ...state,
                scrollDisabled: action.scrollDisabled
            }
        case STORE_TOAST_REF:
            return {
                ...state,
                toastRef: action.toastRef
            }
        case CURRENT_LADIES_COUNT_CHANGE:
            return {
                ...state,
                currentLadiesCount: action.currentLadiesCount
            }
        case CURRENT_MASSEUSES_COUNT_CHANGE:
            return {
                ...state,
                currentMasseusesCount: action.currentMasseusesCount
            }
        case CURRENT_ESTABLISHMENTS_COUNT_CHANGE:
            return {
                ...state,
                currentEstablishmentsCount: action.currentEstablishmentsCount
            }
        case CITIES_STATE_CHANGE:
            return {
                ...state,
                cities: action.cities
            }
        case ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                establishentsData: {
                    ...state.establishentsData,
                    [action.pageNumber]: action.data
                }
            }
        case LADIES_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                ladiesData: {
                    ...state.ladiesData,
                    [action.pageNumber]: action.data
                }
            }
        case MASSEUSES_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                masseusesData: {
                    ...state.masseusesData,
                    [action.pageNumber]: action.data
                }
            }
        case RESET_LADIES_PAGINATION_DATA:
            return {
                ...state,
                ladiesData: {}
            }
        case RESET_MASSEUSES_PAGINATION_DATA:
            return {
                ...state,
                masseusesData: {}
            }
        case RESET_ESTABLISHMENTS_PAGINATION_DATA:
            return {
                ...state,
                establishentsData: {}
            }
        default:
            return state
    }
}