import React, { useState, useMemo, useLayoutEffect, memo, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Dimensions } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { ActivityIndicator } from 'react-native-paper'
import { normalize, getParam, stripEmptyParams } from '../../utils'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import ContentLoader, { Rect } from "react-content-loader/native"
import { MotiView } from 'moti'
import { connect } from 'react-redux'
import { fetchNewLadies, updateLadyInRedux } from '../../redux/actions'

import { Ionicons, Entypo } from '@expo/vector-icons'

import PersonalDetails from '../account/PersonalDetails'
import Photos from '../account/Photos'
import Videos from '../account/Videos'

import { REJECTED, IN_REVIEW, ACTIVE } from '../../labels'

const EditNewLady = ({ offsetX = 0, toastRef, fetchNewLadies, newLadies }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { id } = useParams()

    const [index, setIndex] = useState(0)
    const [routes, setRoutes] = useState([
        { key: 'profileInformation', title: 'Profile information', height: '100%'  },
        { key: 'photos', title: 'Photos', height: '100%' },
        { key: 'videos', title: 'Videos', height: '100%' },
    ].map((route, index) => ({ ...route, index })))
    const [ladyData, setLadyData] = useState(null)

    useEffect(() => {
        if (newLadies === null) {
            fetchNewLadies()
        } else {
            const foundLadyInRedux = newLadies.find(lady => lady.id === id)
            if (foundLadyInRedux) {
                setLadyData(foundLadyInRedux)
            } else {
                navigate({
                    pathname: '/admin/new-ladies',
                    search: new URLSearchParams(stripEmptyParams(params)).toString()
                },{ replace: true })
                
                toastRef.show({
                    type: 'error',
                    text: 'Lady could not be found.'
                })
            }
        }
    }, [newLadies])

    const setTabHeight = (height, index) => {
        setRoutes(r => {
            r[index].height = height
            return [...r]
        })
    }

    const renderLazyPlaceholder = () => (
        <View style={{ alignSelf: 'center', marginTop: SPACING.xx_large }}>
            <ActivityIndicator animating color={COLORS.red} size={30} />
        </View>
    )

    const onTabPress = ({ route, preventDefault }) => {
        preventDefault()
        
        setIndex(routes.indexOf(route))
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'profileInformation':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <PersonalDetails userData={ladyData} user_type='lady' setTabHeight={(height) => setTabHeight(height, route.index)} />
                    </View>
                )
            case 'photos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Photos userData={ladyData} user_type='lady' setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} offsetX={offsetX} />
                    </View>
                )
            case 'videos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Videos userData={ladyData} user_type='lady' setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} offsetX={offsetX}/>
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

    const renderSkeletonLoader = () => (
        <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', marginVertical: SPACING.x_large}}>
            <View style={{ marginHorizontal: SPACING.large, justifyContent: 'space-between', flexDirection: 'row' }}>
                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                </ContentLoader>
                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                </ContentLoader>
                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                </ContentLoader>
                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                </ContentLoader>
            </View>

            <ContentLoader
                speed={2}
                height={200}
                style={{ marginHorizontal: SPACING.large, marginTop: SPACING.x_large, borderRadius: 20 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
            </ContentLoader>

            <ContentLoader
                speed={2}
                height={200}
                style={{ marginHorizontal: SPACING.large, marginTop: SPACING.medium, borderRadius: 20 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
            </ContentLoader>
        </View>
    )

    if (ladyData === null) {
        return renderSkeletonLoader()
    }

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
            lazy
            renderLazyPlaceholder={renderLazyPlaceholder}
        />
    )
}

const mapStateToProps = (store) => ({
    newLadies: store.adminState.newLadies,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchNewLadies })(memo(EditNewLady))