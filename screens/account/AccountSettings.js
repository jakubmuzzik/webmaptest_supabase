import React, { useState, useRef, useLayoutEffect, memo, useMemo } from 'react'
import { View, Text, ScrollView, Dimensions } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { ActivityIndicator } from 'react-native-paper'
import { normalize, getParam, stripEmptyParams } from '../../utils'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'

import PersonalDetails from './PersonalDetails'
import Photos from './Photos'
import Videos from './Videos'
import Settings from './Settings'
import Ladies from './Ladies'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'

const AccountSettings = ({ currentUser }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [index, setIndex] = useState(0)
    const [routes, setRoutes] = useState([
        { key: 'profile-information', title: 'Profile information', height: '100%', path: '/account/profile-information' },
        { key: 'ladies', title: 'Ladies', height: '100%', path: '/account/ladies' },
        { key: 'photos', title: 'Photos', height: '100%', path: '/account/photos' },
        { key: 'videos', title: 'Videos', height: '100%', path: '/account/videos' },
        { key: 'settings', title: 'Settings', height: '100%', path: '/account/settings' },
    ]
    .filter(route => route.key === 'ladies' ? currentUser.accountType === 'establishment' : true)
    .map((route, index) => ({ ...route, index })))

    const navigate = useNavigate()
    const location = useLocation()

    useLayoutEffect(() => {
        const newIndex = routes.find(route => route.path === location.pathname)?.index
        setIndex(newIndex ?? 0)
    }, [location])

    const setTabHeight = (height, index) => {
        setRoutes(r => {
            r[index].height = height
            return [...r]
        })
    }

    const onTabPress = ({ route, preventDefault }) => {
        preventDefault()

        setIndex(routes.indexOf(route))

        navigate({
            pathname: route.path,
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    //todo - this is used only for photos tab - implement skeleton loading
    const renderLazyPlaceholder = () => (
        <View style={{ alignSelf: 'center', marginTop: SPACING.xx_large }}>
            <ActivityIndicator animating color={COLORS.red} size={30} />
        </View>
    )

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'profile-information':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <PersonalDetails userData={currentUser} setTabHeight={(height) => setTabHeight(height, route.index)} />
                    </View>
                )
            case 'ladies':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Ladies setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} />
                    </View>
                )
            case 'photos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Photos userData={currentUser} setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} />
                    </View>
                )
            case 'videos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Videos userData={currentUser} setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} />
                    </View>
                )
            case 'settings':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Settings currentUser={currentUser} setTabHeight={(height) => setTabHeight(height, route.index)} />
                    </View>
                )
            default:
                return null
        }
    }

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'red', left: SPACING.medium }}
            style={{ backgroundColor: 'transparent', width: normalize(800), maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.medium }}
            tabStyle={{ width: 'auto' }}
            scrollEnabled={true}
            renderLabel={({ route, focused, color }) => (
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: focused ? '#FFF' : 'rgba(255,255,255,0.7)' }}>
                    {route.title}
                </Text>
            )}
            onTabPress={onTabPress}
        />
    )

    return (
        <TabView
            renderTabBar={renderTabBar}
            swipeEnabled={false}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            sceneContainerStyle={{
                width: normalize(800),
                maxWidth: '100%',
                alignSelf: 'center',
                paddingHorizontal: SPACING.medium,
            }}
            initialLayout={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
            lazy={({ route }) => route.key !== 'settings'}
            renderLazyPlaceholder={renderLazyPlaceholder}
        />
    )
}

export default memo(AccountSettings)