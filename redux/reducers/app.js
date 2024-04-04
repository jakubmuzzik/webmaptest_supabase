import {
    ROUTE_STATE_CHANGE,
    SCROLL_DISABLED_STATE_CHANGE,
    STORE_TOAST_REF,
    CURRENT_LADIES_COUNT_CHANGE,
    CURRENT_MASSEUSES_COUNT_CHANGE,
    CURRENT_ESTABLISHMENTS_COUNT_CHANGE,
    CITIES_STATE_CHANGE,
    CURRENT_DATA_COUNT_RESET
} from '../actionTypes'

const INITIAL_STATE = {
    route: {},
    scrollDisabled: false,
    toastRef: undefined,
    currentLadiesCount: undefined,
    currentMasseusesCount: undefined,
    currentEstablishmentsCount: undefined,
    cities: undefined
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
        case CURRENT_DATA_COUNT_RESET:
            return {
                ...state,
                currentLadiesCount: undefined,
                currentMasseusesCount: undefined,
                currentEstablishmentsCount: undefined
            }
        case CITIES_STATE_CHANGE:
            return {
                ...state,
                cities: action.cities
            }
        default:
            return state
    }
}