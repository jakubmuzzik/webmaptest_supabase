import { combineReducers } from 'redux'
import { user } from './user'
import { app } from './app'
import { admin } from './admin'

const rootReducer = combineReducers({
    appState: app,
    userState: user,
    adminState: admin
})

export default rootReducer