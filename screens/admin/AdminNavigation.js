import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, Text, useWindowDimensions, Dimensions } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { ActivityIndicator, Button } from 'react-native-paper'
import { normalize, stripEmptyParams, getParam } from '../../utils'
import { MotiText, AnimatePresence, MotiView } from 'moti'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import HoverableView from '../../components/HoverableView'
import { Image } from 'expo-image'

import { connect } from 'react-redux'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import LadySignup from '../signup/LadySignup'

import { Ionicons, Entypo } from '@expo/vector-icons'


import AdminDashboard from './AdminDashboard'
import NewLadies from './NewLadies'
import EditNewLady from './EditNewLady'
import NewEstablishments from './NewEstablishments'
import EditNewEstablishment from './EditNewEstablishment'
import NewPhotos from './NewPhotos'
import NewVideos from './NewVideos'

import ContentLoader, { Rect } from "react-content-loader/native"
import { ACTIVE, IN_REVIEW, REJECTED } from '../../labels'

import { updateCurrentUserInRedux } from '../../redux/actions'

const { height: initialHeight } = Dimensions.get('window')

const AdminNavigation = ({ user_type, toastRef }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { width: windowWidth } = useWindowDimensions()

    const [index, setIndex] = useState(0)
    const [routes] = useState([
        { key: 'admin', title: 'Admin Dashboard', pathname: '/admin', navigationPaths: [] },
        { key: 'new-ladies', title: 'New Ladies', pathname: '/admin/new-ladies', navigationPaths: ['New Ladies'] },
        { key: 'new-establishments', title: 'New Establishments', pathname: '/admin/new-establishments', navigationPaths: ['New Establishments'] },
        { key: 'new-photos', title: 'New Photos', pathname: '/admin/new-photos', navigationPaths: ['New Photos'] },
        { key: 'new-videos', title: 'New Videos', pathname: '/admin/new-videos', navigationPaths: ['New Videos'] },
        { key: 'edit-lady', title: 'Edit Lady', pathname: '/admin/new-ladies/edit-lady/*', navigationPaths: ['New Ladies', 'Edit Lady'] },
        { key: 'edit-establishment', title: 'Edit Establishment', pathname: '/admin/new-establishments/edit-establishment/*', navigationPaths: ['New Establishments', 'Edit Establishment'] }
    ]
    .map((route, index) => ({ ...route, index })))

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const foundRoute = routes.find(route => route.pathname.includes('*') ? location.pathname.includes(route.pathname.replace('/*', '')) : location.pathname === route.pathname)
        
        setIndex(foundRoute ? foundRoute.index : 0)
    }, [location])

    const getURLPaths = () => {
        return routes[index].pathname.replace('/', '').replace('/*', '').split('/')
    }

    const onNavigationPathPress = (navigationPathIndex) => {
        if (routes[index].navigationPaths.length === 1 || navigationPathIndex === 0) {
            navigate({
                pathname: '/admin',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            })
        } else {
            navigate({
                pathname: routes.find(route => route.key === getURLPaths()[navigationPathIndex])?.pathname ?? '/admin',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            })
        }
    }

    const renderPagesScene = ({ route }) => {
        if (Math.abs(index - routes.indexOf(route)) > 0) {
            return <View />
        }

        switch (route.key) {
            case 'admin':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <AdminDashboard />
                    </View>
                )
            case 'new-ladies':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <NewLadies />
                    </View>
                )
            case 'new-establishments':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <NewEstablishments />
                    </View>
                )
            case 'new-photos':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <NewPhotos index={route.index} />
                    </View>
                )
            case 'new-videos':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <NewVideos index={route.index}/>
                    </View>
                )
            case 'edit-lady':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <EditNewLady offsetX={windowWidth * route.index} />
                    </View>
                )
            case 'edit-establishment':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <EditNewEstablishment offsetX={windowWidth * route.index} />
                    </View>
                )
            default:
                return null
        }
    }

    return (
        <View style={{ backgroundColor: COLORS.lightBlack, height: routes[index].key === 'add_lady' ? initialHeight - normalize(70) : '100%' }}>
            <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', marginTop: SPACING.small, paddingHorizontal: SPACING.medium }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text
                        onPress={index !== 0 ? () => onNavigationPathPress(0) : undefined}
                        style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: '#FFF', textDecorationLine: index !== 0 ? 'underline' : 'none' }}
                    >
                        Admin Dashboard
                    </Text>

                    {/* <AnimatePresence>
                        {index !== 0 &&

                            <MotiText
                                style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: '#FFF' }}
                                from={{
                                    opacity: 0,
                                    transform: [{ translatex: 100 }],
                                }}
                                animate={{
                                    opacity: 1,
                                    transform: [{ translatex: 0 }],
                                }}
                                exit={{
                                    opacity: 0,
                                    transform: [{ translatex: 100 }],
                                }}
                                transition={{
                                    type: 'timing'
                                }}
                            >
                                {` > ${routes[index].title}`}
                            </MotiText>
                        }
                    </AnimatePresence> */}

                    <AnimatePresence>
                        {routes[index].navigationPaths.map((navigationPath, pathIndex, navigationPaths) => (
                            <MotiText 
                                key={navigationPath}
                                style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: '#FFF' }}
                                from={{
                                    opacity: 0,
                                    transform: [{ translatex: 100 }],
                                }}
                                animate={{
                                    opacity: 1,
                                    transform: [{ translatex: 0 }],
                                }}
                                exit={{
                                    opacity: 0,
                                    transform: [{ translatex: 100 }],
                                }}
                                transition={{
                                    type: 'timing'
                                }}
                            >
                                {` > `}
                                <Text
                                    onPress={navigationPaths.length > pathIndex + 1 ? () => onNavigationPathPress(pathIndex + 1) : undefined}
                                    style={{ textDecorationLine: navigationPaths.length > pathIndex + 1 ? 'underline' : 'none' }}
                                >
                                    {navigationPath}
                                </Text>
                            </MotiText>
                        ))}
                    </AnimatePresence>
                </View>
            </View>

            <TabView
                renderTabBar={props => null}
                swipeEnabled={false}
                navigationState={{ index, routes }}
                renderScene={renderPagesScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get('window').width }}
                sceneContainerStyle={{ paddingBottom: SPACING.medium }}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    user_type: store.userState.currentAuthUser.user_metadata.user_type,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { updateCurrentUserInRedux })(AdminNavigation)