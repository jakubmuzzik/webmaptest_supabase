import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { StyleSheet, View, useWindowDimensions, Dimensions } from 'react-native'
import { normalize, stripEmptyParams, getParam } from '../utils'

import { connect } from 'react-redux'
import { updateScrollDisabled, fetchUser, storeToastRef, updateLadyCities, updateEstablishmentCities } from '../redux/actions'

import { getAuth, onAuthStateChanged, getDoc, doc, db } from '../firebase/config'

import Toast from '../components/Toast'

import LadySignup from '../screens/signup/LadySignup'
import NotFound from '../screens/NotFound'
import Header from '../components/navigation/Header'
import Footer from '../components/navigation/Footer'
import Esc from '../screens/Esc'
import Clu from '../screens/Clu'
import Mas from '../screens/Mas'
import Profile from '../screens/Profile'
import Account from '../screens/Account'
import EstablishmentSignup from '../screens/signup/EstablishmentSignup'
import SignUpOrLogin from '../screens/SignUpOrLogin'
import SearchResults from '../screens/SearchResults'
import VerifyEmail from '../screens/VerifyEmail'
import Home from '../screens/Home'

import { COLORS, FONTS, FONT_SIZES, SMALL_SCREEN_THRESHOLD, SPACING, SUPPORTED_LANGUAGES } from '../constants'

import Explore from './Explore'

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'

const { height: initialHeight } = Dimensions.get('window')

const auth = getAuth()

const LayoutWithHeader = ({ children }) => (
    <>
        <View style={{ position: 'fixed', zIndex: 1, width: '100%', flexDirection: 'column', backgroundColor: COLORS.lightBlack }}>
            <Header />
        </View>

        <View style={{ flex: 1, marginTop: normalize(70) }}>
            {children}
        </View>

        <Footer />
    </>
)

const Redirect = ({ replace, to }) => {
    const [searchParams] = useSearchParams()

    const params = {
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }

    //need to hardcode => search param on Navigate component didn't work
    if (params.language) {
        to += '?language=' + params.language
    }

    return <Navigate to={to} replace={replace} />
}

const RequireAuth = ({ children }) => {
    const location = useLocation()
    const [searchParams] = useSearchParams()

    const params = {
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }

    const isLoggedIn = getAuth()?.currentUser
    const isVerified = isLoggedIn?.emailVerified

    if (isLoggedIn && !isVerified && location.pathname !== '/verify-email') {
        let to = '/verify-email'
        //need to hardcode => search param on Navigate component didn't work
        if (params.language) {
            to += '?language=' + params.language
        }

        return <Navigate to={to} state={{ from: location }} replace />
    } else if (!isLoggedIn) {
        let to = '/auth'
        //need to hardcode => search param on Navigate component didn't work
        if (params.language) {
            to += '?language=' + params.language
        }

        return <Navigate to={to} state={{ from: location }} replace />
    }

    return children
}

const Main = ({ scrollDisabled, updateScrollDisabled, updateEstablishmentCities, updateLadyCities, fetchUser, storeToastRef }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    const toastRef = useRef()
    const hasLoadedRef = useRef(false)

    const { height } = useWindowDimensions()

    useEffect(() => {
        storeToastRef(toastRef)
    }, [toastRef])

    useEffect(() => {
        getDoc(doc(db, 'info', 'webwide'))
            .then((snapshot) => {
                if (snapshot.exists()) {                    
                    updateLadyCities(snapshot.data().ladyCities)
                    updateEstablishmentCities(snapshot.data().establishmentCities)
                }
            })

        const unsubscribe = onAuthStateChanged(auth, user => {
            if (!user) {
                setIsLoggedIn(false)
            } else {
                //fetch only on page reloads and when already signed in
                if (!hasLoadedRef.current) {
                    fetchUser()
                }
                setIsLoggedIn(true)

                if (user.emailVerified && hasLoadedRef.current) {
                    toastRef.current?.show({
                        type: 'success',
                        text: 'Successfully logged in.'
                    })
                }
            }

            hasLoadedRef.current = true
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /*const ProhibitsAuth = useCallback(({ children }) => {
        const [searchParams] = useSearchParams()

        const params = {
            language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
        }

        if (isLoggedIn) {
            let to = '/account'
            //need to hardcode => search param on Navigate component didn't work
            if (params.language) {
                to += '?language=' + params.language
            }

            return <Navigate to={to} replace />
        }

        return children
    }, [isLoggedIn])*/
    
    const router = createBrowserRouter(createRoutesFromElements(
        <>
            <Route path='/' element={
                <LayoutWithHeader>
                    <Explore />
                </LayoutWithHeader>
            } >
                <Route index element={<Esc />} />
                <Route path='/mas' element={<Mas />} />
                <Route path='/clu' element={<Clu />} />
            </Route>

            <Route path='/profile/:id' element={
                <LayoutWithHeader>
                    <Profile />
                </LayoutWithHeader>
            } />

            <Route path='/account' element={
                <RequireAuth>
                    <LayoutWithHeader>
                        <Outlet />
                    </LayoutWithHeader>
                </RequireAuth>
            } >
                <Route index element={<Redirect to="/account/profile-information" replace />} />
                <Route path='profile-information' element={<Account />} />
                <Route path='ladies' element={<Account />} />
                <Route path='edit-lady/:id' element={<Account />} />
                <Route path='add-lady' element={<Account />} />
                <Route path='photos' element={<Account />} />
                <Route path='videos' element={<Account />} />
                <Route path='settings' element={<Account />} />
            </Route>

            <Route path='/lady-signup' element={
                <>
                    <View style={{ position: 'fixed', zIndex: 1, width: '100%', flexDirection: 'column', backgroundColor: COLORS.lightBlack }}>
                        <Header />
                    </View>

                    <View style={{ height: initialHeight, paddingTop: normalize(70) }}>
                        <LadySignup independent/>
                    </View>

                    <Footer />
                </>
            } />

            <Route path='/establishment-signup' element={
                <>
                    <View style={{ position: 'fixed', zIndex: 1, width: '100%', flexDirection: 'column', backgroundColor: COLORS.lightBlack }}>
                        <Header />
                    </View>

                    <View style={{ height: initialHeight, paddingTop: normalize(70) }}>
                        <EstablishmentSignup />
                    </View>

                    <Footer />
                </>
            } />

            <Route path='/auth' element={
                <LayoutWithHeader>
                    <SignUpOrLogin />
                </LayoutWithHeader>
            } />

            <Route path='/verify-email' element={
                <RequireAuth>
                    <LayoutWithHeader>
                        <VerifyEmail />
                    </LayoutWithHeader>
                </RequireAuth>
            } />

            <Route path='/search' element={
                <LayoutWithHeader>
                    <SearchResults />
                </LayoutWithHeader>
            } />

            <Route path='*' element={
                <LayoutWithHeader>
                    <NotFound />
                </LayoutWithHeader>
            } />

            <Route path='/home' element={
                <LayoutWithHeader>
                    <Home />
                </LayoutWithHeader>
            } />
        </>
    ))

    router.subscribe(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant'})

        //reset scroll whenever user navigates
        if (scrollDisabled) {
            setTimeout(() => updateScrollDisabled(false))
        }
    })

    if (isLoggedIn == null) {
        return null
    }

    return (
        <>
            <View style={scrollDisabled ? { height, overflow: 'hidden' }: {flex:1}}>
                <RouterProvider router={router} />
            </View>

            <Toast ref={toastRef} />
        </>
    )
}

const mapStateToProps = (store) => ({
    scrollDisabled: store.appState.scrollDisabled,
    toastData: store.appState.toastData
})

export default connect(mapStateToProps, { updateScrollDisabled, fetchUser, storeToastRef, updateEstablishmentCities, updateLadyCities })(Main)