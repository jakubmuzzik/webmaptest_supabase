import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, Text, useWindowDimensions, Dimensions } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS, SUPPORTED_LANGUAGES } from '../constants'
import { ActivityIndicator, Button } from 'react-native-paper'
import { normalize, stripEmptyParams, getParam } from '../utils'
import { MotiText, AnimatePresence, MotiView } from 'moti'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import HoverableView from '../components/HoverableView'
import { Image } from 'expo-image'

import { connect } from 'react-redux'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import LadySignup from './signup/LadySignup'

import { Ionicons, Entypo } from '@expo/vector-icons'

import AccountSettings from './account/AccountSettings'
import EditLady from './account/EditLady'

import ContentLoader, { Rect } from "react-content-loader/native"
import { ACTIVE, IN_REVIEW, REJECTED } from '../labels'

import { updateDoc, doc, db, getAuth } from '../firebase/config'
import { updateCurrentUserInRedux } from '../redux/actions'

//todo - create texts for each account statuses 
//could be a status - Profile was not approved.. fix the following data: list of wrong data
//and then a button to re-submit a profile for a review after fixing the data
const ACCOUNT_MESSAGES = {
    'in_review': [
        'Profile is in review',
        'All profiles go through a standard review before they become visible.'
    ],
    'rejected_cover_photos': [
        'Missing cover photos',
        'All cover photos must be added and approved before your profile becomes visible.'
    ]
}

const ESTABLISHMENT_LADIES_MESSAGES = {
    'rejected_cover_photos': [
        'Missing cover photos',
        'All cover photos must be added and approved before your profile becomes visible.'
    ]
    //....
}

const { height: initialHeight } = Dimensions.get('window')

const Account = ({ navigation, route, currentUser={}, toastRef, updateCurrentUserInRedux}) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { width: windowWidth } = useWindowDimensions()

    const [index, setIndex] = useState(0)
    const [routes] = useState([
        { key: 'account', title: 'Account' },
        { key: 'edit_lady', title: 'Edit Lady' },
        { key: 'add_lady', title: 'Add Lady' },
    ]
    .map((route, index) => ({ ...route, index })))
    const [resubmitting, setResubmitting] = useState(false)

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (Object.keys(currentUser).length === 0) {
            return
        }

        if (
            (
                location.pathname.includes('add-lady') 
                || location.pathname.includes('edit-lady')
            )
            && currentUser.accountType !== 'establishment'
        ) {
            navigate({
                pathname: '/account',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            },{ replace: true })
        } else {
            if (location.pathname.includes('edit-lady')) {
                setIndex(1)
            } else if (location.pathname.includes('add-lady')) {
                setIndex(2)
            } else {
                setIndex(0)
            }
        }
    }, [location, currentUser])

    const onGoBackPress = () => {
        //can't go back
        if (location.key === 'default') {
            navigate({
                pathname: '/account/ladies',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            })
        } else {
            navigate(-1)
        }
    }

    const hasAllProfileInformation = () => {
        return currentUser.name 
            && currentUser.phone
            && currentUser.description
            && currentUser.address
    }

    const hasAllCoverPhotos = () => {
        if (currentUser.accountType === 'establishment') {
            const coverImage = currentUser.images.find(image => image.index === 0 && image.status === ACTIVE || image.status === IN_REVIEW)
            return coverImage
        } else {
            const coverImages = currentUser.images.filter(image => Number(image.index) < 5 && (image.status === ACTIVE || image.status === IN_REVIEW))
            return Number(coverImages.length) === 5
        }
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
            await updateDoc(doc(db, 'users', getAuth().currentUser.uid), { status: IN_REVIEW, lastSubmittedDate: new Date() })
            updateCurrentUserInRedux({ status: IN_REVIEW, id: getAuth().currentUser.uid, lastSubmittedDate: new Date() })

            toastRef.current.show({
                type: 'success',
                headerText: 'Profile re-submitted',
                text: 'Profile was re-submitted for review.'
            })
        } catch(e) {
            toastRef.current.show({
                type: 'error',
                headerText: 'Re-submit error',
                label: 'Your profile could not be submitted for review.'
            })

            console.error(e)
        } finally {
            setResubmitting(false)
        }
    }

    const renderPagesScene = ({ route }) => {
        if (Math.abs(index - routes.indexOf(route)) > 0) {
            return <View />
        }

        switch (route.key) {
            case 'account':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <AccountSettings currentUser={currentUser} />
                    </View>
                )
            case 'edit_lady':
                return (
                    <View style={{ marginTop: SPACING.large }}>
                        <EditLady offsetX={windowWidth * route.index} />
                    </View>
                )
            case 'add_lady':
                return (
                    <View style={{ paddingTop: SPACING.small, backgroundColor: COLORS.lightBlack, flex: 1 }}>
                        <LadySignup showHeaderText={false} offsetX={windowWidth * route.index} />
                    </View>
                )
            default:
                return null
        }
    }

    const renderAccountMessages = () => {
        if (index !== 0) {
            return null
        }

        if (currentUser.status === IN_REVIEW) {
            return (
                <MotiView
                    from={{
                        opacity: 0,
                        transform: [{ translateY: -10 }],
                    }}
                    animate={{
                        opacity: 1,
                        transform: [{ translateY: 0 }],
                    }}
                    style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, borderRadius: 10, backgroundColor: COLORS.darkGrey, borderWidth: 1, borderColor: '#f08135', marginTop: SPACING.x_small }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons name="information-circle-outline" size={normalize(20)} color="#f08135" style={{ marginRight: SPACING.xx_small, marginTop: 1 }} />
    
                        <View style={{ flexShrink: 1 }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}>
                                Profile is in review
                            </Text>
                            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, marginTop: SPACING.xx_small }}>
                                All profiles go through a standard review before they become visible.
                            </Text>
                        </View>
                    </View>
                </MotiView>
            )
        } else if (currentUser.status === REJECTED) {
            return (
                <MotiView
                    from={{
                        opacity: 0,
                        transform: [{ translateY: -10 }],
                    }}
                    animate={{
                        opacity: 1,
                        transform: [{ translateY: 0 }],
                    }}
                    style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, borderRadius: 10, backgroundColor: COLORS.darkGrey, borderWidth: 1, borderColor: '#d9100a', marginTop: SPACING.x_small }}
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
                            {resubmitting && <ActivityIndicator color={COLORS.red} style={{ width: 'fit-content', marginTop: SPACING.x_small  }} size={normalize(20)} />}
                        </View>
                    </View>
                </MotiView>
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

    return (
        <View style={{ backgroundColor: COLORS.lightBlack, height: routes[index].key === 'add_lady' ? initialHeight - normalize(70) : '100%' }}>
            <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', marginTop: SPACING.small, paddingHorizontal: SPACING.medium }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text
                        onPress={index !== 0 ? onGoBackPress : undefined}
                        style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: '#FFF', textDecorationLine: index !== 0 ? 'underline' : 'none' }}
                    >
                        Account
                    </Text>

                    <AnimatePresence>
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
                    </AnimatePresence>
                </View>

                {Object.keys(currentUser).length > 0 && renderAccountMessages()}
            </View>

            {Object.keys(currentUser).length === 0 && renderSkeletonLoader()}

            {Object.keys(currentUser).length > 0 && (
                <TabView
                    renderTabBar={props => null}
                    swipeEnabled={false}
                    navigationState={{ index, routes }}
                    renderScene={renderPagesScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                />
            )}
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { updateCurrentUserInRedux })(Account)