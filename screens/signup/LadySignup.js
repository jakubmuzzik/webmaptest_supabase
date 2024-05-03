import React, { useState, createRef, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES } from '../../constants'
import { normalize, getMimeType, getParam, stripEmptyParams } from '../../utils'
import { ProgressBar, Button } from 'react-native-paper'

import LoginInformation from './steps/LoginInformation'
import PersonalDetails from './steps/PersonalDetails'
import ServicesAndPricing from './steps/ServicesAndPricing'
import LocationAndAvailability from './steps/LocationAndAvailability'
import UploadPhotos from './steps/UploadPhotos'
import LadyRegistrationCompleted from './steps/LadyRegistrationCompleted'

import { TabView } from 'react-native-tab-view'
import { MotiView } from 'moti'
import LottieView from 'lottie-react-native'
import { BlurView } from 'expo-blur'

import { connect } from 'react-redux'
import { updateCurrentUserInRedux, updateLadyInRedux } from '../../redux/actions'
import { IN_REVIEW } from '../../labels'
import { useSearchParams, useNavigate } from 'react-router-dom'
import uuid from 'react-native-uuid'
import { supabase } from '../../supabase/config'

const LadySignup = ({ independent=false, showHeaderText = true, offsetX = 0, updateCurrentUserInRedux, updateLadyInRedux, toastRef }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [nextButtonIsLoading, setNextButtonIsLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [index, setIndex] = useState(0)
    const [contentWidth, setContentWidth] = useState(normalize(800))

    const [routes] = useState(
        [
            //{ key: 'login_information' },
            //{ key: 'personal_details' },
            //{ key: 'services_and_pricing' },
            { key: 'address_and_availability' },
            { key: 'photos_and_videos' },
            { key: 'registration_completed' }
        ]
        .filter(r => r.key === 'login_information' ? independent : true)
        .map((r, index) => ({...r, ref: createRef(), index}))
    )

    const paginageNext = () => {
        setIndex(index => index + 1)
    }

    const paginateBack = () => {
        setIndex(index => index - 1)
    }

    const onNextPress = async () => {
        if (nextButtonIsLoading) {
            return
        }

        setNextButtonIsLoading(true)

        try {
            const isValid = await routes[index].ref.current.validate()
            if (!isValid) {
                setNextButtonIsLoading(false)
                return
            }

            if (index !== Object.keys(routes).length - 2) {
                setNextButtonIsLoading(false)
                paginageNext()
                return
            }
        } catch(e) {
            console.error(e)
            toastRef.current.show({
                type: 'error',
                text: 'Data could not be processed.'
            })
            setNextButtonIsLoading(false)
        }

        let data
        setUploading(true)

        //upload user data before uploading assets
        try {
            data = await uploadUserData()
        } catch(e) {
            console.error(e)
            toastRef.current.show({
                type: 'error',
                text: 'Data could not be processed.'
            })
            setNextButtonIsLoading(false)
            setUploading(false)

            return
        }

        //upload user assets
        try {
            await uploadUserAssets(data)
        } catch(e) {
            console.error(e)
            toastRef.current.show({
                type: 'error',
                text: 'Assets could not be uploaded.'
            })

            data.images = []
            data.videos = []
        } finally {
            if (independent) {
                updateCurrentUserInRedux(data)
            } else {
                updateLadyInRedux(data)
            }

            setNextButtonIsLoading(false)
            setUploading(false)
            paginageNext()
        }
    }

    const uploadUserData = async () => {
        let data = {}
        routes.slice(0, routes.length - 1).forEach(route => data = { ...data, ...route.ref.current.data })
        data.status = IN_REVIEW

        if (independent) {
            const { data: { user }, error: signUpError } = await supabase.auth.signUp(
                {
                    email: data.email,
                    password: data.password,
                    options: {
                        data: {
                            name: data.name,
                        user_type: 'lady'
                        }
                    }
                }
            )

            if (signUpError) {
                throw signUpError
            }

            delete data.password

            data.id = user.id
        } else {
            const { data: { user } } = await supabase.auth.getUser()//await supabase.auth.getSession()
            data.id = uuid.v4(),
            data.establishment_id = user.id
        }

        data = {
            ...data,
            name_lowercase: data.name.toLowerCase(),
            created_date: new Date(),
            independent
        }

        //extract assets
        const images = data.images
        const videos = data.videos

        delete data.images
        delete data.videos

        const { error: insertUserError } = await supabase
            .from('ladies')
            .insert(data)

        if (insertUserError) {
            throw insertUserError
        }

        //put assets back for further processing
        data.images = images
        data.videos = videos

        return data
    }

    const uploadUserAssets = async (data) => {
        let urls = await Promise.all([
            ...data.images.map(image => uploadAssetToSupabase(image.image, 'photos', data.id + '/' + image.id)),
            ...data.videos.map(video => uploadAssetToSupabase(video.video, 'videos', data.id + '/' + video.id + '/video')),
            ...data.videos.map(video => uploadAssetToSupabase(video.thumbnail, 'videos', data.id + '/' + video.id + '/thumbnail')),
        ])

        const imageURLs = urls.splice(0, data.images.length)
        const videoURLs = urls.splice(0, data.videos.length)
        const thumbanilURLs = urls.splice(0, data.videos.length)

        data.images.forEach((image, index) => {
            delete image.image
            image.download_url = imageURLs[index]
            image.lady_id = data.id
        })

        data.videos.forEach((video, index) => {
            delete video.video
            delete video.thumbnail

            video.download_url = videoURLs[index]
            video.thumbnail_download_url = thumbanilURLs[index]
            video.lady_id = data.id
        })

        if (data.images.length > 0) {
            console.log(data.images)
            const { error: insertImagesError } = await supabase
                .from('images')
                .insert(data.images)

            if (insertImagesError) {
                throw insertImagesError
            }
        }

        if (data.videos.length > 0) {
            const { error: insertVideosError } = await supabase
                .from('videos')
                .insert(data.videos)

            if (insertVideosError) {
                throw insertVideosError
            }
        }
    }

    const uploadAssetToSupabase = async (asset, from, assetPath) => {
        const arraybuffer = await fetch(asset).then((res) => res.arrayBuffer())

        const { data, error: uploadError } = await supabase
            .storage
            .from(from)
            .upload(assetPath, arraybuffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: getMimeType(asset),
            })

        if (uploadError) {
            throw uploadError
        }

        const { data: publicUrlData } = supabase.storage.from(from).getPublicUrl(assetPath)

        return publicUrlData.publicUrl
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'login_information':
                return <LoginInformation ref={route.ref} i={route.index} contentWidth={contentWidth} toastRef={toastRef} />
            case 'personal_details':
                return <PersonalDetails ref={route.ref} i={route.index} contentWidth={contentWidth} offsetX={offsetX} />
            case 'services_and_pricing':
                return <ServicesAndPricing ref={route.ref} i={route.index} contentWidth={contentWidth} offsetX={offsetX} />
            case 'address_and_availability':
                return <LocationAndAvailability ref={route.ref} i={route.index} contentWidth={contentWidth} />
            case 'photos_and_videos':
                return <UploadPhotos ref={route.ref} i={route.index} toastRef={toastRef} />
            case 'registration_completed':
                return <LadyRegistrationCompleted independent={independent} visible={index === routes.length - 1} toastRef={toastRef} />
        }
    }

    const progress = (index) / (Object.keys(routes).length - 1)

    return (
        <View style={{ height: '100%', backgroundColor: COLORS.lightBlack }}>
            <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', }}>
                {showHeaderText && <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginHorizontal: SPACING.medium, marginVertical: SPACING.small, color: '#FFF' }}>
                    {independent ? 'Lady sign up' : 'Add Lady'}
                </Text>}
                <ProgressBar style={{ marginHorizontal: SPACING.medium, borderRadius: 10 }} progress={progress == 0 ? 0.01 : progress} color={COLORS.error} />
            </View>
            <MotiView
                from={{
                    opacity: 0,
                    transform: [{ translateY: 40 }],
                }}
                animate={{
                    opacity: 1,
                    transform: [{ translateY: 0 }],
                }}
                transition={{
                    type: 'timing',
                    duration: 400,
                }}
                style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.medium }}>
                <View
                    style={{ 
                        flex: 1, 
                        maxWidth: '100%', 
                        backgroundColor: COLORS.grey,//'#261718',
                        borderRadius: 15, 
                        overflow: 'hidden', 
                        borderWidth: 1, 
                        borderColor: 'rgba(255, 255,255, .1)'//'rgba(220, 46, 46, .10)'//COLORS.darkGrey 
                    }}
                    onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
                >
                    {/* <View style={{ marginBottom: SPACING.small, marginTop: SPACING.large, marginHorizontal: SPACING.x_large, }}>
                        <ProgressBar progress={(index) / Object.keys(routes).length} color={COLORS.error} />
                    </View> */}

                    <TabView
                        renderTabBar={props => null}
                        swipeEnabled={false}
                        navigationState={{ index, routes }}
                        renderScene={renderScene}
                        onIndexChange={setIndex}
                        initialLayout={{ width: contentWidth }}
                    />

                    {index !== routes.length - 1 && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.x_large, marginVertical: SPACING.small, }}>
                        {index === 0 ? <View /> : <Button
                            labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.white }}
                            style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                            rippleColor="rgba(0,0,0,.1)"
                            mode="outlined"
                            onPress={paginateBack}
                        >
                            Back
                        </Button>}

                        <Button
                            labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                            style={{ flexShrink: 1, borderRadius: 10, borderWidth: index === Object.keys(routes).length - 2 ? 0 : 1, borderColor: COLORS.red }}
                            buttonColor={index === Object.keys(routes).length - 2 ? COLORS.red : COLORS.darkRedBackground}
                            rippleColor="rgba(220, 46, 46, .16)"
                            mode="contained"
                            onPress={onNextPress}
                            loading={nextButtonIsLoading}
                        >
                            {index === Object.keys(routes).length - 2 ? 'Sign up' : 'Next'}
                        </Button>
                    </View>}

                    {uploading && (
                        <MotiView 
                            style={{ ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(80,80,80,0.6)' }}
                            from={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1
                            }}
                        >
                            <BlurView intensity={20} style={{ height: '100%', width: '100%' }}>
                                <View style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,.6)', alignItems: "center", justifyContent: 'center' }}>
                                    <LottieView
                                        style={{ width: '50%', minWidth: 250, maxWidth: '90%' }}
                                        autoPlay
                                        loop
                                        source={require('../../assets/loading.json')}
                                    />
                                </View>
                            </BlurView>
                        </MotiView>
                    )}
                </View>
            </MotiView>
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { updateCurrentUserInRedux, updateLadyInRedux })(LadySignup)