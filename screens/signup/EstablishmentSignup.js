import React, { useState, createRef, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES} from '../../constants'
import { normalize, encodeImageToBlurhash, getParam } from '../../utils'
import { ProgressBar, Button } from 'react-native-paper'
import { TabView } from 'react-native-tab-view'
import { MotiView } from 'moti'
import LottieView from 'lottie-react-native'
import { BlurView } from 'expo-blur'

import { connect } from 'react-redux'
import { updateCurrentUserInRedux } from '../../redux/actions'
import { IN_REVIEW } from '../../labels'

import LoginInformation from './steps/LoginInformation'
import EstablishmentDetails from './steps/EstablishmentDetails'
import LocationAndAvailability from './steps/LocationAndAvailability'
import EstablishmentPhotos from './steps/EstablishmentPhotos'
import EstablishmentRegistrationCompleted from './steps/EstablishmentRegistrationCompleted'

import { useSearchParams, useNavigate } from 'react-router-dom'

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, setDoc, doc, db, ref, uploadBytes, storage, getDownloadURL, runTransaction } from '../../firebase/config'

const EstablishmentSignup = ({ toastRef, updateCurrentUserInRedux }) => {
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
            { key: '1. Login Information' },
            { key: '2. Establishment Details' },
            { key: '3. Address & Working hours' },
            { key: '4. Upload Photos' },
            { key: '5. Registration Completed' }
        ]
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
            updateCurrentUserInRedux(data)

            setNextButtonIsLoading(false)
            setUploading(false)
            paginageNext()
        }
    }

    const uploadUserData = async () => {
        let data = {}
        routes.slice(0, routes.length - 1).forEach(route => data = { ...data, ...route.ref.current.data })
        data.status = IN_REVIEW

        const response = await createUserWithEmailAndPassword(getAuth(), data.email, data.password)

        delete data.password

        await sendEmailVerification(response.user)

        data = {
            ...data,
            id: getAuth().currentUser.uid,
            nameLowerCase: data.name.toLowerCase(),
            createdDate: new Date(),
            accountType: 'establishment'
        }

        //extract assets before uploading
        const images = data.images
        const videos = data.videos
        data.images = []
        data.videos = []

        await setDoc(doc(db, 'users', data.id), data)

        const infoRef = doc(db, 'info', 'webwide')

        await runTransaction(db, async (transaction) => {
            const infoDoc = await transaction.get(infoRef)

            const cities = infoDoc.data().establishmentCities

            if (cities.includes(data.address.city)) {
                return
            }

            transaction.update(infoRef, { establishmentCities: cities.concat([data.address.city]) })
        })

        //put assets back for further processing
        data.images = images
        data.videos = videos

        return data
    }

    const uploadUserAssets = async (data) => {
        let urls = await Promise.all([
            ...data.images.map(image => uploadAssetToFirestore(image.image, 'photos/' + data.id + '/' + image.id)),
            ...data.videos.map(video => uploadAssetToFirestore(video.video, 'videos/' + data.id + '/' + video.id + '/video')),
            ...data.videos.map(video => uploadAssetToFirestore(video.thumbnail, 'videos/' + data.id + '/' + video.id + '/thumbnail')),
        ])

        /*const imageBlurhashes = await Promise.all([
            ...data.images.map(image => encodeImageToBlurhash(image.image))
        ])

        for (let i = 0; i < data.images.length; i++) {
            data.images[i] = {...data.images[i], blurhash: imageBlurhashes[i]}
        }

        const videoThumbnailsBlurhashes = await Promise.all([
            ...data.videos.map(video => encodeImageToBlurhash(video.thumbnail))
        ])

        for (let i = 0; i < data.videos.length; i++) {
            data.videos[i] = {...data.videos[i], blurhash: videoThumbnailsBlurhashes[i]}
        }*/

        const imageURLs = urls.splice(0, data.images.length)
        const videoURLs = urls.splice(0, data.videos.length)
        const thumbanilURLs = urls.splice(0, data.videos.length)

        data.images.forEach((image, index) => {
            delete image.image
            image.downloadUrl = imageURLs[index]
        })

        data.videos.forEach((video, index) => {
            delete video.video
            delete video.thumbnail

            video.downloadUrl = videoURLs[index]
            video.thumbnailDownloadUrl = thumbanilURLs[index]
        })

        await setDoc(doc(db, 'users', data.id), data)
    }

    const uploadAssetToFirestore = async (assetUri, assetPath) => {
        const imageRef = ref(storage, assetPath)
    
        const response = await fetch(assetUri)
        const blob = await response.blob()

        const result = await uploadBytes(imageRef, blob)

        const downloadURL = await getDownloadURL(result.ref)
    
        return downloadURL
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case '1. Login Information':
                return <LoginInformation ref={route.ref} i={route.index} contentWidth={contentWidth} toastRef={toastRef}/>
            case '2. Establishment Details':
                return <EstablishmentDetails ref={route.ref} i={route.index} contentWidth={contentWidth} />
            case '3. Address & Working hours':
                return <LocationAndAvailability ref={route.ref} i={route.index} contentWidth={contentWidth} />
            case '4. Upload Photos':
                return <EstablishmentPhotos ref={route.ref} i={route.index} toastRef={toastRef} />
            case '5. Registration Completed':
                return <EstablishmentRegistrationCompleted visible={index === routes.length - 1} email={''}/>
        }
    }

    const progress = (index) / (Object.keys(routes).length - 1)

    return (
        <View style={{ height: '100%', backgroundColor: COLORS.lightBlack }}>
            <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', }}>
                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginHorizontal: SPACING.medium, marginVertical: SPACING.small, color: '#FFF' }}>
                    Establishment sign up
                </Text>
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
                style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', flex: 1, backgroundColor: COLORS.lightBlack, alignItems: 'center', justifyContent: 'center', padding: SPACING.medium }}>
                <View
                    style={{ flex: 1, maxWidth: '100%', backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' }}
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
                            labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#000' }}
                            style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                            rippleColor="rgba(0,0,0,.1)"
                            mode="outlined"
                            onPress={paginateBack}
                        >
                            Back
                        </Button>}

                        <Button
                            labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                            style={{ flexShrink: 1, borderRadius: 10 }}
                            buttonColor={index === Object.keys(routes).length - 2 ? COLORS.red : COLORS.lightBlack}
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

export default connect(mapStateToProps, { updateCurrentUserInRedux })(EstablishmentSignup)