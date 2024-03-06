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
import { fetchLadies, updateLadyInRedux } from '../../redux/actions'

import { Ionicons, Entypo } from '@expo/vector-icons'

import PersonalDetails from './PersonalDetails'
import Photos from './Photos'
import Videos from './Videos'

import { updateDoc, doc, db } from '../../firebase/config'
import { REJECTED, IN_REVIEW, ACTIVE } from '../../labels'

const EditLady = ({ offsetX = 0, ladies, fetchLadies, toastRef, updateLadyInRedux }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { id } = useParams()

    const [index, setIndex] = useState(0)
    const [routes, setRoutes] = useState([
        { key: 'profileInformation', title: 'Profile information', height: '100%'  },
        { key: 'photos', title: 'Photos', height: '100%'  },
        { key: 'videos', title: 'Videos', height: '100%'  },
    ].map((route, index) => ({ ...route, index })))
    const [ladyData, setLadyData] = useState(null)
    const [resubmitting, setResubmitting] = useState(false)

    useEffect(() => {
        if (!ladies) {
            fetchLadies()
        } else {
            const foundLadyInRedux = ladies.find(lady => lady.id === id)
            if (foundLadyInRedux) {
                setLadyData(foundLadyInRedux)
            } else {
                navigate({
                    pathname: '/account/ladies',
                    search: new URLSearchParams(stripEmptyParams(params)).toString()
                },{ replace: true })
                
                toastRef.current.show({
                    type: 'error',
                    text: 'Selected Lady could not be found.'
                })
            }
        }
    }, [ladies])

    const setTabHeight = (height, index) => {
        setRoutes(r => {
            r[index].height = height
            return [...r]
        })
    }

    //todo - this is used only for photos tab - implement skeleton loading
    const renderLazyPlaceholder = () => (
        <View style={{ alignSelf: 'center', marginTop: SPACING.xx_large }}>
            <ActivityIndicator animating color={COLORS.red} size={30} />
        </View>
    )

    const onTabPress = ({ route, preventDefault }) => {
        preventDefault()
        
        setIndex(routes.indexOf(route))
    }

    const onResubmitPress = async () => {
        if (resubmitting) {
            return
        }

        if (!hasAllCoverPhotos() || !hasAllProfileInformation()) {
            toastRef.current.show({
                type: 'error',
                headerText: 'Missing data',
                text: 'Fix all of the rejected data before re-submitting the profile.'
            })

            return
        }

        setResubmitting(true)
        try {
            await updateDoc(doc(db, 'users', ladyData.id), { status: IN_REVIEW, lastSubmittedDate: new Date() })
            updateLadyInRedux({ status: IN_REVIEW, id: ladyData.id, lastSubmittedDate: new Date() })

            toastRef.current.show({
                type: 'success',
                headerText: 'Profile re-submitted',
                text: 'Profile was re-submitted for review.'
            })
        } catch(e) {
            toastRef.current.show({
                type: 'error',
                headerText: 'Re-submit error',
                text: 'Your profile could not be submitted for review.'
            })

            console.error(e)
        } finally {
            setResubmitting(false)
        }
    }

    const hasAllProfileInformation = () => {
        return ladyData.name 
            && ladyData.phone
            && ladyData.description
            && ladyData.address
    }

    const hasAllCoverPhotos = () => {
        const coverImages = ladyData.images.filter(image => Number(image.index) < 5 && (image.status === ACTIVE || image.status === IN_REVIEW))
        return Number(coverImages.length) === 5
    }

    const renderScene = ({ route }) => {
        if (Math.abs(index - routes.indexOf(route)) > 0) {
            //return <View />
        }

        switch (route.key) {
            case 'profileInformation':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <PersonalDetails userData={ladyData} setTabHeight={(height) => setTabHeight(height, route.index)} />
                    </View>
                )
            case 'photos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Photos userData={ladyData} setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} offsetX={offsetX} />
                    </View>
                )
            case 'videos':
                return (
                    <View style={{ width: normalize(800), maxWidth: '100%', height: routes[index].height, alignSelf: 'center' }}>
                        <Videos userData={ladyData} setTabHeight={(height) => setTabHeight(height, route.index)} index={route.index} offsetX={offsetX}/>
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

    const renderLadiesMessages = () => {
        if (ladyData.status === IN_REVIEW) {
            return (
                <View style={{ paddingHorizontal: SPACING.medium }}>
                    <MotiView
                        from={{
                            opacity: 0,
                            transform: [{ translateY: -10 }],
                        }}
                        animate={{
                            opacity: 1,
                            transform: [{ translateY: 0 }],
                        }}
                        style={{ width: normalize(800) - SPACING.medium - SPACING.medium, maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, borderRadius: 10, backgroundColor: COLORS.darkGrey, borderWidth: 1, borderColor: '#f08135', marginBottom: SPACING.medium }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="information-circle-outline" size={normalize(20)} color="#f08135" style={{ marginRight: SPACING.xx_small }} />

                            <View style={{ flexShrink: 1 }}>
                                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}>
                                    Lady is in review
                                </Text>
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, marginTop: SPACING.xx_small }}>
                                    All profiles go through a standard review before they become visible.
                                </Text>
                            </View>
                        </View>
                    </MotiView>
                </View>
            )
        } else if (ladyData.status === REJECTED) {
            return (
                <View style={{ paddingHorizontal: SPACING.medium }}>
                    <MotiView
                        from={{
                            opacity: 0,
                            transform: [{ translateY: -10 }],
                        }}
                        animate={{
                            opacity: 1,
                            transform: [{ translateY: 0 }],
                        }}
                        style={{ width: normalize(800) - SPACING.medium - SPACING.medium, maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, borderRadius: 10, backgroundColor: COLORS.darkGrey, borderWidth: 1, borderColor: '#d9100a', marginBottom: SPACING.medium }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <Entypo name="circle-with-cross" size={normalize(20)} color="#d9100a" style={{ marginRight: SPACING.xx_small, marginTop: 1 }} />

                            <View style={{ flexShrink: 1, flexDirection: 'column' }}>
                                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}>
                                    Profile has been rejected
                                </Text>
                                {(!hasAllCoverPhotos() || !hasAllProfileInformation()) && <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.white, marginTop: SPACING.xx_small }}>
                                    Please fix the following data and re-submit your profile for review:
                                </Text>}
                                <View style={{ marginTop: 4, flexDirection: 'column' }}>
                                    {!hasAllCoverPhotos() && <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: COLORS.white }}>
                                        • Cover photos
                                    </Text>}
                                    {!hasAllProfileInformation() && <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: COLORS.white }}>
                                        • Profile information
                                    </Text>}
                                </View>

                                {!resubmitting && <Text onPress={onResubmitPress} style={{ width: 'fit-content', color: COLORS.linkColor, fontFamily: FONTS.bold, fontSize: FONTS.medium, marginTop: SPACING.x_small }}>
                                    Re-submit
                                </Text>}
                                {resubmitting && <ActivityIndicator color={COLORS.red} style={{ width: 'fit-content', marginTop: SPACING.x_small }} size={normalize(20)} />}
                            </View>
                        </View>
                    </MotiView>
                </View>
            )
        } else {
            return null
        }
        
    }

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
        <>
            {renderLadiesMessages()}

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
        </>
    )
}

const mapStateToProps = (store) => ({
    ladies: store.userState.ladies,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchLadies, updateLadyInRedux })(memo(EditLady))