import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { StyleSheet, View, useWindowDimensions, Dimensions } from 'react-native'
import { normalize, stripEmptyParams, getParam } from '../utils'

import { connect } from 'react-redux'
import { updateScrollDisabled, fetchUser, storeToastRef, updateCities, updateCurrentAuthUser } from '../redux/actions'

import Toast from '../components/Toast'

import LadySignup from '../screens/signup/LadySignup'
import NotFound from '../screens/NotFound'
import Header from '../components/navigation/Header'
import Footer from '../components/navigation/Footer'
import Esc from '../screens/Esc'
import Clu from '../screens/Clu'
import Mas from '../screens/Mas'
import Account from '../screens/Account'
import EstablishmentSignup from '../screens/signup/EstablishmentSignup'
import SignUpOrLogin from '../screens/SignUpOrLogin'
import SearchResults from '../screens/SearchResults'
import Home from '../screens/Home'
import RequireAuth from './RequireAuth'
import RequireAdminUser from './RequireAdminUser'
import Lady from '../screens/Lady'
import Establishment from '../screens/Establishment'
import AdminNavigation from '../screens/admin/AdminNavigation'

import { COLORS, FONTS, FONT_SIZES, SMALL_SCREEN_THRESHOLD, SPACING, SUPPORTED_LANGUAGES } from '../constants'

import Explore from './Explore'

import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Outlet, Navigate, useLocation, useSearchParams } from 'react-router-dom'

import { supabase } from '../supabase/config'

const { height: initialHeight } = Dimensions.get('window')

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

const Main = ({ scrollDisabled, updateScrollDisabled, updateCities, fetchUser, storeToastRef, updateCurrentAuthUser }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null)

    const toastRef = useRef()
    const hasLoadedRef = useRef(false)

    const { height } = useWindowDimensions()

    useEffect(() => {
        storeToastRef(toastRef)
    }, [toastRef])

    useEffect(() => {
        supabase
            .from('cities')
            .select('city')
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching data:', error.message);
                    return;
                }

                updateCities(data.map(city => city.city))
            })
            .catch(error => {
                console.error('Error executing query:', error.message);
            });

        const subscription = supabase.auth.onAuthStateChange((_event, session) => {
            console.log(_event)
            console.log('session: ', session)

            if (_event === 'SIGNED_OUT') {
                toastRef.current?.show({
                    type: 'success',
                    text: "You've been logged out."
                })
            }

            if (!session) {
                setIsLoggedIn(false)
            } else {
                if (_event === 'USER_UPDATED') {
                    toastRef.current?.show({
                        type: 'success',
                        text: 'Your data has been successfully updated.'
                    })
                }

                updateCurrentAuthUser(session.user)
                //fetch only on page reloads and when already signed in
                if (!hasLoadedRef.current && session.user.app_metadata.userrole !== 'ADMIN') {
                    fetchUser(session.user.id, session.user.user_metadata.user_type)
                }
                setIsLoggedIn(true)
            }

            hasLoadedRef.current = true
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])
    
    //todo - put one global app wrapper for each route - and do the on auth state change in there - so that I can e.g. redirect user when USER_UPDATED has been emmitted
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

            <Route path='/lady/:id' element={
                <LayoutWithHeader>
                    <Lady />
                </LayoutWithHeader>
            } />

            <Route path='/establishment/:id' element={
                <LayoutWithHeader>
                    <Establishment />
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

            <Route path='/admin' element={
                <RequireAdminUser>
                    <LayoutWithHeader>
                        <Outlet />
                    </LayoutWithHeader>
                </RequireAdminUser>
            } >
                {/* <Route index element={<Redirect to="/admin" replace />} /> */}
                <Route index element={<AdminNavigation />} />
                <Route path='new-establishments' element={<AdminNavigation />} />
                <Route path='new-ladies' element={<AdminNavigation />} />
                <Route path='new-photos' element={<AdminNavigation />} />
                <Route path='new-videos' element={<AdminNavigation />} />
                <Route path='new-ladies/edit-lady/:id' element={<AdminNavigation />} />
                
            </Route>

            {/* <Route path='/admin' element={
                <RequireAdminUser>
                    <LayoutWithHeader>
                        <AdminNavigation />
                    </LayoutWithHeader>
                </RequireAdminUser>
            } /> */}

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

export default connect(mapStateToProps, { updateScrollDisabled, fetchUser, storeToastRef, updateCities, updateCurrentAuthUser })(Main)