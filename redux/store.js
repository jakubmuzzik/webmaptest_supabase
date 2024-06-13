import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import rootReducer from './reducers'

/*export default () => {
    let store = configureStore({ 
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
    })
    return { store }
}*/

export default () => configureStore({ reducer: rootReducer, middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }) })