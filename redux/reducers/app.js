import {
    ROUTE_STATE_CHANGE,
    SCROLL_DISABLED_STATE_CHANGE,
    STORE_TOAST_REF,
    LADIES_COUNT_CHANGE,
    MASSEUSES_COUNT_CHANGE,
    ESTABLISHMENTS_COUNT_CHANGE,
    LADY_CITIES_STATE_CHANGE,
    ESTABLISHMENT_CITIES_STATE_CHANGE,
    ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE,
    LADIES_PAGINATION_DATA_STATE_CHANGE,
    MASSEUSES_PAGINATION_DATA_STATE_CHANGE,
    RESET_LADIES_PAGINATION_DATA,
    RESET_MASSEUSES_PAGINATION_DATA,
    RESET_ESTABLISHMENTS_PAGINATION_DATA,
    RESET_ALL_PAGINATION_DATA

} from '../actionTypes'

const INITIAL_STATE = {
    route: {},
    scrollDisabled: false,
    toastRef: undefined,
    ladiesCount: undefined,
    masseusesCount: undefined,
    establishmentsCount: undefined,
    ladyCities: undefined,
    establishmentCities: undefined,
    ladiesData: {},
    masseusesData: {},
    establishentsData: {}
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
        case LADIES_COUNT_CHANGE:
            return {
                ...state,
                ladiesCount: action.ladiesCount
            }
        case MASSEUSES_COUNT_CHANGE:
            return {
                ...state,
                masseusesCount: action.masseusesCount
            }
        case ESTABLISHMENTS_COUNT_CHANGE:
            return {
                ...state,
                establishmentsCount: action.establishmentsCount
            }
        case LADY_CITIES_STATE_CHANGE:
            return {
                ...state,
                ladyCities: action.ladyCities
            }
        case ESTABLISHMENT_CITIES_STATE_CHANGE:
            return {
                ...state,
                establishmentCities: action.establishmentCities
            }
        case ESTABLISHMENT_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                establishentsData: {
                    ...state.establishentsData,
                    [action.pageNumber] : action.data
                }
            }
        case LADIES_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                ladiesData: {
                    ...state.ladiesData,
                    [action.pageNumber] : action.data
                }
            }
        case MASSEUSES_PAGINATION_DATA_STATE_CHANGE:
            return {
                ...state,
                masseusesData: {
                    ...state.masseusesData,
                    [action.pageNumber] : action.data
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
        case RESET_ALL_PAGINATION_DATA:
            return {
                ...state,
                establishentsData: {},
                masseusesData: {},
                adiesData: {}
            }
        default:
            return state
    }
}