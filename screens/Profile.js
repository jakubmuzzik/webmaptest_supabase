import React, { useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect } from "react"
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions, Modal, ScrollView, ImageBackground, Dimensions } from "react-native"
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES, LARGE_SCREEN_THRESHOLD, SMALL_SCREEN_THRESHOLD, CURRENCY_SYMBOLS } from "../constants"
import { calculateAgeFromDate, normalize, stripEmptyParams, getParam } from "../utils"
import { Image } from 'expo-image'
import { AntDesign, Ionicons, Feather, FontAwesome, Octicons, FontAwesome5, MaterialCommunityIcons, EvilIcons, Entypo } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import HoverableView from "../components/HoverableView"
import MapView, { Marker } from 'react-native-maps'
import AssetsTabView from "../components/modal/profile/AssetsTabView"
import { isBrowser } from 'react-device-detect'
import { MotiText, MotiView } from "moti"
import ContentLoader, { Rect } from "react-content-loader/native"
import { getDoc, doc, db } from "../firebase/config"
import Toast from "../components/Toast"
import { Link } from 'react-router-dom'
import RenderLady from "../components/list/RenderLady"

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay
} from 'react-native-reanimated'

import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from "react-redux"
import { ACTIVE, MASSAGE_SERVICES } from "../labels"

const Profile = ({ toastRef }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { id } = useParams()

    const initiallyRendered = useRef(false)

    useEffect(() => {
        //reload page when navigate from profile to profile
        if (initiallyRendered.current) {
            navigate(0)
        }
        initiallyRendered.current = true
    }, [id])

    const { width } = useWindowDimensions()
    const isSmallScreen = width <= SMALL_SCREEN_THRESHOLD

    const mapRef = useRef()
    const pressedImageIndexRef = useRef()

    const [showTextTriggeringButton, setShowTextTriggeringButton] = useState(false)
    const [moreTextShown, setMoreTextShown] = useState(false)
    const [photosModalVisible, setPhotosModalVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(location.state?.lady)
    const [establishmentName, setEstablishmentName] = useState()
    const [ladiesUnderEstablishment, setLadiesUnderEstablishment] = useState()

    const establishmentNameRotateX = useSharedValue('90deg')
    const leftPhotoOpacity = useSharedValue(0)
    const coverPhotoOpacity = useSharedValue(0)
    const rightPhotosOpacity1 = useSharedValue(0)
    const rightPhotosOpacity2 = useSharedValue(0)
    const leftPhotoTranslateY = useSharedValue(20)
    const rightPhotosTranslateY1 = useSharedValue(20)
    const rightPhotosTranslateY2 = useSharedValue(20)
    const coverPhotoTranslateY = useSharedValue(20)

    const establishmentNameAnimatedStyle = useAnimatedStyle(() => {
        return {
            color: COLORS.greyText, 
            fontSize: FONT_SIZES.large, 
            fontFamily: FONTS.medium,
            transform: [{ rotateX: establishmentNameRotateX.value }],
        }
    })

    const coverPhotoAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: '100%',
            opacity: coverPhotoOpacity.value,
            transform: [{ translateY:coverPhotoTranslateY.value  }],
        }
    })

    const leftPhotoAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: '50%', 
            flexShrink: 1, 
            marginRight: SPACING.xxx_small,
            opacity: leftPhotoOpacity.value,
            transform: [{ translateY:leftPhotoTranslateY.value  }],
        }
    })

    const rightPhotosAnimatedStyle1 = useAnimatedStyle(() => {
        return {
            flexDirection: 'row', 
            marginBottom: SPACING.xxx_small, 
            flexGrow: 1,
            opacity: rightPhotosOpacity1.value,
            transform: [{ translateY:rightPhotosTranslateY1.value  }],
        }
    })

    const rightPhotosAnimatedStyle2 = useAnimatedStyle(() => {
        return {
            flexDirection: 'row', 
            flexGrow: 1,
            opacity: rightPhotosOpacity2.value,
            transform: [{ translateY:rightPhotosTranslateY2.value  }],
        }
    })

    useLayoutEffect(() => {
        console.log(location.state)
        if (data) {
            setLoading(false)
            console.log('has data')

            if (data.establishmentId) {
                fetchEstablishmentName(data.establishmentId)
            }
        } else {
            fetchUser()
        }
    }, [data])

    useEffect(() => {
        if (establishmentName) {
            establishmentNameRotateX.value = withTiming('0deg', {
                useNativeDriver: true
            })
        }
    }, [establishmentName])

    useEffect(() => {
        if (loading || !data) {
            return
        }

        if (data.accountType === 'lady') {
            leftPhotoOpacity.value = withTiming(1, {
                useNativeDriver: true
            })
            leftPhotoTranslateY.value = withTiming(0, {
                useNativeDriver: true
            })
            rightPhotosOpacity1.value = withDelay(20, withTiming(1, {
                useNativeDriver: true
            }))
            rightPhotosTranslateY1.value = withDelay(20, withTiming(0, {
                useNativeDriver: true
            }))
            rightPhotosOpacity2.value = withDelay(40, withTiming(1, {
                useNativeDriver: true
            }))
            rightPhotosTranslateY2.value = withDelay(40, withTiming(0, {
                useNativeDriver: true
            }))
        } else {
            coverPhotoOpacity.value = withTiming(1, {
                useNativeDriver: true
            })
            coverPhotoTranslateY.value = withTiming(0, {
                useNativeDriver: true
            })
        }
    }, [loading, data])

    useEffect(() => {
        if (!photosModalVisible && !isNaN(pressedImageIndexRef.current)) {
            pressedImageIndexRef.current = undefined
        }
    }, [photosModalVisible])

    const images = useMemo(() => {
        if (!data) {
            return {}
        }

        return data.images.filter(image => image.status === ACTIVE).reduce((out, current) => {
            out[current.index] = current

            return out
        }, {})
    }, [data])

    const videos = useMemo(() => {
        if (!data) {
            return []
        }

        return data.videos.filter(video => video.status === ACTIVE)
    }, [data])

    const fetchUser = async () => {
        try {
            const snapshot = await getDoc(doc(db, 'users', id))
            if (snapshot.exists()) {
                const snapshotData = snapshot.data()
                setData({
                    ...snapshotData,
                    id: snapshotData.id
                })

                if (snapshotData.establishmentId) {
                    fetchEstablishmentName(snapshotData.establishmentId)
                } else if (snapshotData.accountType === 'establishment') {
                    fetchLadiesUnderEstablishment(snapshotData.id)
                }
            }
        } catch (error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                text: 'We could not find the lady.'
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchEstablishmentName = async (establishmentId) => {
        try {
            let snapshot = await getDoc(doc(db, 'users', establishmentId))
            if (snapshot.exists()) {
                setEstablishmentName(snapshot.data().name)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchLadiesUnderEstablishment = async (establishmentId) => {
        setTimeout(() => {
            setLadiesUnderEstablishment(new Array(30).fill({
                name: 'lady xxx',
                dateOfBirth: '25071996',
                address: {city: 'Praha'},
                images: [{ downloadUrl: require('../assets/dummy_photo.png') }]
            }, 0))
        }, 1500)
    }

    const closeModal = () => {
        setPhotosModalVisible(false)
    }

    const onTextLayout = useCallback((e) => {
        const element = e.nativeEvent.target
        const count = Math.floor(e.nativeEvent.layout.height / getComputedStyle(element).lineHeight.replace('px', ''))

        if (count >= 5 || isNaN(count)) {
            setShowTextTriggeringButton(true)
        }
    }, [])

    const onEstablishmentLinkPress = () => {
        setLoading(true)
        //setEstablishmentName(null)
        //setData(null)
        navigate({
            pathname: '/profile/' + data.establishmentId,
            search: new URLSearchParams({ 
                ...stripEmptyParams(params)
            }).toString(),
            state: null
        })

        
        //fetchUser()
        //navigate(0)
    }

    const loadingMapFallback = useMemo(() => {
        return (
            <View style={{ ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading</Text>
            </View>
        );
    }, [])

    const onImagePress = (index) => {
        pressedImageIndexRef.current = index
        setPhotosModalVisible(true)
    }

    const renderSkeleton = () => (
        <View style={{ alignSelf: 'center', maxWidth: '100%', width: 800 + SPACING.xxx_small, /*backgroundColor: COLORS.lightBlack,*/ padding: SPACING.large }}>
            <ContentLoader
                speed={2}
                height={FONT_SIZES.large * 2}
                width='45%'
                style={{ borderRadius: 5, marginTop: SPACING.large, alignSelf: 'center' }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
            </ContentLoader>
            <ContentLoader
                speed={2}
                height={FONT_SIZES.large * 2}
                width='50%'
                style={{ borderRadius: 5, marginTop: SPACING.small, alignSelf: 'center' }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
            </ContentLoader>
            <ContentLoader
                speed={2}
                height={FONT_SIZES.large * 2}
                width='50%'
                style={{ borderRadius: 5, marginTop: SPACING.small, alignSelf: 'center' }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
            </ContentLoader>

            <View style={{ flexDirection: 'row', marginTop: SPACING.large }}>
                <View style={{ width: '50%', flexShrink: 1, marginRight: SPACING.xxx_small, }}>
                    <ContentLoader
                        speed={2}
                        height={'100%'}
                        width='100%'
                        style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3/4 }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                </View>
                <View style={{ flexDirection: 'column', width: '50%', flexShrink: 1 }}>
                    <View style={{ flexDirection: 'row', marginBottom: SPACING.xxx_small, flexGrow: 1 }}>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', marginRight: SPACING.xxx_small, aspectRatio: 3/4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3/4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                    </View>
                    <View style={{ flexDirection: 'row', flexGrow: 1 }}>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', marginRight: SPACING.xxx_small, aspectRatio: 3/4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3/4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                    </View>
                </View>
            </View>

            <ContentLoader
                speed={2}
                height={200}
                style={{ marginTop: SPACING.x_large, borderRadius: 20 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
            </ContentLoader>
            <ContentLoader
                speed={2}
                height={200}
                style={{ marginTop: SPACING.x_large, borderRadius: 20 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
            </ContentLoader>
            <ContentLoader
                speed={2}
                height={200}
                style={{ marginTop: SPACING.x_large, borderRadius: 20 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
            </ContentLoader>
        </View>
    )

    const renderHeaderInfo = () => (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#FFF', marginBottom: SPACING.x_small, marginHorizontal: SPACING.xx_small, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, }}>
                {data.name}
            </Text>
            {data.accountType === 'lady' && <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginBottom: SPACING.xx_small }}>
                {calculateAgeFromDate(data.dateOfBirth)} years <Text style={{ color: COLORS.red }}>•</Text> {data.height} cm <Text style={{ color: COLORS.red }}>•</Text> {data.weight} kg
            </Text>}
            <View style={{ flexDirection: 'row', marginBottom: SPACING.xx_small, alignItems: 'center' }}>
                <MaterialCommunityIcons name="phone" size={20} color={COLORS.greyText} style={{ marginRight: 3 }} />
                <Text onPress={() => console.log('')} style={{ marginRight: SPACING.xx_small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {data.phone}
                </Text>
                {data.whatsapp && <TouchableOpacity style={{ padding: 5, width: 28, height: 28, backgroundColor: '#108a0c', borderRadius: '50%', marginRight: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="whatsapp" size={18} color="white" />
                </TouchableOpacity>}
               {data.viber && <TouchableOpacity style={{ padding: 5, width: 28, height: 28, backgroundColor: '#7d3daf', borderRadius: '50%', marginRight: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="viber" size={18} color="white" />
                </TouchableOpacity>}
                {data.telegram && <TouchableOpacity style={{ padding: 5, width: 28, height: 28, backgroundColor: '#38a5e4', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                    <EvilIcons name="sc-telegram" size={22} color="white" />
                </TouchableOpacity>}
            </View>
            {data.website && <View style={{ flexDirection: 'row', marginBottom: SPACING.xx_small, alignItems: 'center' }}>
                <MaterialCommunityIcons name="web" size={20} color={COLORS.greyText} style={{ marginRight: 3 }} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {data.website}
                </Text>
            </View>}
            <View style={{ flexDirection: 'row', marginBottom: SPACING.medium, alignItems: 'center' }}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.greyText} style={{ marginRight: 3 }} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {data.address.city}
                </Text>
            </View>
        </View>
    )

    const renderPhotosGrid = () => (
        <>
            <View style={{ flexDirection: 'row', }}>
                <Animated.View 
                    /*transition={{
                        type: 'timing',
                        duration: 300,
                    }}*/
                    style={leftPhotoAnimatedStyle}
                >
                    <HoverableView hoveredOpacity={0.8}>
                        <TouchableOpacity onPress={() => onImagePress(0)}>
                            <Image
                                style={{
                                    aspectRatio: 3 / 4,
                                    width: 'auto',
                                    borderRadius: 10
                                }}
                                source={images[0].downloadUrl}
                                placeholder={images[0].blurhash}
                                resizeMode="cover"
                                transition={200}
                            />
                        </TouchableOpacity>
                    </HoverableView>
                </Animated.View>
                <View style={{ flexDirection: 'column', width: '50%', flexShrink: 1 }}>
                    <Animated.View
                        style={rightPhotosAnimatedStyle1}
                    >
                        <HoverableView hoveredOpacity={0.8} style={{ flex: 1, marginRight: SPACING.xxx_small, }}>
                            <TouchableOpacity onPress={() => onImagePress(1)}>
                                <Image
                                    style={{
                                        aspectRatio: 3 / 4,
                                        flex: 1,
                                        borderRadius: 10
                                    }}
                                    source={images[1].downloadUrl}
                                    placeholder={images[1].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                            </TouchableOpacity>
                        </HoverableView>
                        <HoverableView hoveredOpacity={0.8} style={{ flex: 1 }}>
                            <TouchableOpacity onPress={() => onImagePress(2)}>
                                <Image
                                    style={{
                                        aspectRatio: 3 / 4,
                                        flex: 1,
                                        borderRadius: 10
                                    }}
                                    source={images[2].downloadUrl}
                                    placeholder={images[2].blurhash}
                                    contentFit="cover"
                                    transition={200}
                                />
                            </TouchableOpacity>
                        </HoverableView>
                    </Animated.View>
                    <Animated.View
                        style={rightPhotosAnimatedStyle2}
                    >
                        <HoverableView hoveredOpacity={0.8} style={{ flex: 1, marginRight: SPACING.xxx_small, }}>
                            <TouchableOpacity onPress={() => onImagePress(3)}>
                                <Image
                                    style={{
                                        aspectRatio: 3 / 4,
                                        flex: 1,
                                        borderRadius: 10
                                    }}
                                    source={images[3].downloadUrl}
                                    placeholder={images[3].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                            </TouchableOpacity>
                        </HoverableView>
                        <HoverableView hoveredOpacity={0.8} style={{ flex: 1 }}>
                            <TouchableOpacity onPress={() => onImagePress(4)}>
                                <Image
                                    style={{
                                        aspectRatio: 3 / 4,
                                        flex: 1,
                                        borderRadius: 10
                                    }}
                                    source={images[4].downloadUrl}
                                    placeholder={images[4].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                            </TouchableOpacity>
                        </HoverableView>
                    </Animated.View>
                </View>
            </View>

            <View style={{ alignSelf: 'center', flexDirection: 'row', marginTop: SPACING.small }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {Object.keys(images).length} {Object.keys(images).length > 1 ? 'photos' : 'photo'}
                </Text>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginHorizontal: SPACING.xx_small }}>
                    |
                </Text>
                {videos.length > 0 && <><Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {videos.length} {videos.length > 1 ? 'videos' : 'video'}
                </Text>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginHorizontal: SPACING.xx_small }}>
                        |
                    </Text></>}
                <TouchableOpacity onPress={() => setPhotosModalVisible(true)} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: '#FFF', marginRight: 4 }}>View all</Text>
                    <MaterialCommunityIcons name="dots-grid" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </>
    )

    const renderCoverPhoto = () => (
        <>
            <Animated.View
                style={coverPhotoAnimatedStyle}
            >
                <HoverableView hoveredOpacity={0.8}>
                    <TouchableOpacity onPress={() => onImagePress(0)}>
                        <Image
                            style={{
                                aspectRatio: 16 / 9,
                                width: 'auto',
                                borderRadius: 10
                            }}
                            source={images[0].downloadUrl}
                            placeholder={images[0].blurhash}
                            resizeMode="cover"
                            transition={200}
                        />
                    </TouchableOpacity>
                </HoverableView>
            </Animated.View>

            <View style={{ alignSelf: 'center', flexDirection: 'row', marginTop: SPACING.small }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {Object.keys(images).length} {Object.keys(images).length > 1 ? 'photos' : 'photo'}
                </Text>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginHorizontal: SPACING.xx_small }}>
                    |
                </Text>
                {videos.length > 0 && <><Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText }}>
                    {videos.length} {videos.length > 1 ? 'videos' : 'video'}
                </Text>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginHorizontal: SPACING.xx_small }}>
                        |
                    </Text></>}
                <TouchableOpacity onPress={() => setPhotosModalVisible(true)} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: '#FFF', marginRight: 4 }}>View all</Text>
                    <MaterialCommunityIcons name="dots-grid" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </>
    )

    const renderAbout = () => (
        <View style={[styles.section, { marginTop: SPACING.xxx_large }]}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                    About
                </Text>
                {!data.establishmentId && data.accountType === 'lady' && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                    • Independent lady
                </Text>}
                {data.establishmentType && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                    • {data.establishmentType}
                </Text>}
                {data.establishmentId && establishmentName && (
                    <Animated.Text
                        numberOfLines={2}
                        style={establishmentNameAnimatedStyle}
                    >
                        • Lady from <Text onPress={onEstablishmentLinkPress} style={{ color: COLORS.linkColor, textDecorationLine: 'underline' }}>{establishmentName}</Text>
                    </Animated.Text>
                )}
            </View>

            <Text style={{ color: '#FFF', fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, lineHeight: 22 }}
                onLayout={onTextLayout}
                numberOfLines={moreTextShown ? undefined : 5}
            >
                {data.description}
            </Text>
            {
                showTextTriggeringButton && (
                    <Text
                        onPress={() => setMoreTextShown(v => !v)}
                        style={{ color: '#FFF', fontFamily: FONTS.medium, marginTop: SPACING.small, fontSize: FONT_SIZES.medium }}>
                        {moreTextShown ? 'Read less...' : 'Read more...'}
                    </Text>
                )
            }
        </View>
    )

    const renderPersonalDetails = () => (
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
            <Text style={[styles.sectionHeaderText, { marginLeft: SPACING.small }]}>
                Personal Details
            </Text>
            <View style={{ flex: 1, flexDirection: isSmallScreen ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'column', flex: 1, marginHorizontal: SPACING.small }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Age</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{calculateAgeFromDate(data.dateOfBirth)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Sexual orientation</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.sexuality}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Nationality</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.nationality}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={styles.attributeName}>Languages</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.languages.join(', ')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Height</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.height} cm</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Weight</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.weight} kg</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'column', flex: 1, marginHorizontal: SPACING.small }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Body type</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.bodyType}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Pubic hair</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.pubicHair}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Breast size</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.breastSize}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Breast type</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.breastType}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Hair color</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.hairColor}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Eye color</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{data.eyeColor}</Text>
                    </View>
                </View>
            </View>
        </View>
    )

    const renderServices = () => (
        <View style={styles.section}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                    Services
                </Text>
                {data.services.every(service => MASSAGE_SERVICES.includes(service)) && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                    • Only massages
                </Text>}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {data.services.map(service => (
                    <View key={service} style={styles.chip}>
                        <Text style={styles.chipText}>{service}</Text>
                    </View>
                ))}
            </View>
        </View>
    )

    const renderWorkingHours = () => {
        const todaysDay = new Date().toLocaleString('en-us', {weekday:'long'}).toLowerCase()
        const todaysWorkingHours = data.workingHours.find(workingHours => workingHours.day === todaysDay)

        let availableNow = false

        if (todaysWorkingHours.enabled) {
            const fromHour = todaysWorkingHours.from.split(':')[0]
            const fromMinutes = todaysWorkingHours.from.split(':')[1]
            const untilHour = todaysWorkingHours.until.split(':')[0]
            const untilMinutes = todaysWorkingHours.until.split(':')[1]

            const now = new Date()
            const currentHour = now.getHours()
            const currentMinutes = now.getMinutes()

            if (
                (currentHour > fromHour || (currentHour === fromHour && currentMinutes >= fromMinutes)) &&
                (currentHour < untilHour || (currentHour === untilHour && currentMinutes <= untilMinutes))
            ) {
                availableNow = true
            }
        }

        return (
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Working hours
                    </Text>
                    {availableNow && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                        <Text style={{ color: availableNow ? 'green' : COLORS.greyText }}>•</Text>
                        &nbsp;Currently Available
                    </Text>}
                </View>

                <View style={styles.table}>
                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]} backgroundColor={COLORS.lightGrey} hoveredBackgroundColor={COLORS.grey}>
                            <Text style={styles.tableHeaderText}>Day</Text>
                        </View>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Monday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Tuesday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Wednesday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Thursday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Friday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Saturday</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={styles.tableHeaderValue}>Sunday</Text>
                        </HoverableView>
                    </View>
                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                            <Text style={styles.tableHeaderText}>Availability</Text>
                        </View>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[0].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[0].enabled ? (data.workingHours[0].from + ' - ' + data.workingHours[0].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[1].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[1].enabled ? (data.workingHours[1].from + ' - ' + data.workingHours[1].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[2].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[2].enabled ? (data.workingHours[2].from + ' - ' + data.workingHours[2].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[3].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[3].enabled ? (data.workingHours[3].from + ' - ' + data.workingHours[3].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[4].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[4].enabled ? (data.workingHours[4].from + ' - ' + data.workingHours[4].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[5].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[5].enabled ? (data.workingHours[5].from + ' - ' + data.workingHours[5].until) : 'Not available'}</Text>
                        </HoverableView>
                        <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                            <Text style={[styles.tableHeaderValue, { color: data.workingHours[6].enabled ? COLORS.white : COLORS.greyText }]}>{data.workingHours[6].enabled ? (data.workingHours[6].from + ' - ' + data.workingHours[6].until) : 'Not available'}</Text>
                        </HoverableView>
                    </View>
                </View>
            </View>
        )
    }

    const renderPricing = () => {
        if (data.prices.length === 0) {
            return null
        }

        return (
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Pricing
                    </Text>
                    <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                        • {data.currency}
                    </Text>
                </View>

                <View style={styles.table}>
                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]} backgroundColor={COLORS.lightGrey} hoveredBackgroundColor={COLORS.grey}>
                            <Text style={styles.tableHeaderText}>Length</Text>
                        </View>
                        {data.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.length} {price.length > 1 ? 'hours' : 'hour'}</Text>
                            </HoverableView>
                        ))}
                    </View>
                    {data.incall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                            <Text style={styles.tableHeaderText}>Incall</Text>
                        </View>
                        {data.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.incall} {CURRENCY_SYMBOLS[data.currency]}</Text>
                            </HoverableView>
                        ))}
                    </View>}
                    {data.outcall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                            <Text style={styles.tableHeaderText}>Outcall</Text>
                        </View>
                        {data.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.outcall} {CURRENCY_SYMBOLS[data.currency]}</Text>
                            </HoverableView>
                        ))}
                    </View>}
                </View>
            </View>
        )
    }

    const renderAddress = () => (
        <View style={styles.section}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                    Address
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.white} style={{ marginRight: 3 }} />
                    <Text numberOfLines={1} style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: data.address ? COLORS.white : COLORS.error }}>
                        {data.address ? (data.hiddenAddress ? data.address.city : data.address.title) : 'Enter your address'}
                    </Text>
                </View>
            </View>

            {!data.hiddenAddress && <View style={{ width: '100%', height: 300, borderRadius: 5, overflow: 'hidden' }}>
                <MapView
                    ref={mapRef}
                    googleMapsApiKey="AIzaSyCA1Gw6tQbTOm9ME6Ru0nulUNFAOotVY3s"
                    provider="google"
                    style={{ flex: 1 }}
                    animationEnabled
                    zoomTapEnabled
                    loadingFallback={loadingMapFallback}
                    initialCamera={{
                        center: {
                            latitude: data.address.lat,
                            longitude: data.address.lng,
                        },
                        zoom: 13,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: data.address.lat,
                            longitude: data.address.lng
                        }}
                        title={data.name}
                    >
                        <Image
                            source={require('../assets/sport_marker.png')}
                            style={{
                                width: 30,
                                height: 30,
                                position: 'absolute',
                                top: -30,
                                left: -15
                            }}
                            resizeMode="contain"
                        />
                    </Marker>
                </MapView>
            </View>}
        </View>
    )

    const renderLadiesUnderEstablishment = () => {
        if (!ladiesUnderEstablishment) {
            return (
                <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
                    <ContentLoader
                        speed={2}
                        height={35}
                        width='45%'
                        style={{ borderRadius: 5, marginTop: SPACING.large, alignSelf: 'center' }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                    </ContentLoader>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.medium }}>
                        <View style={{ width: 150, aspectRatio: 3/4, borderRadius: 10 }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center',}}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                        <View style={{ width: 150, aspectRatio: 3/4, marginLeft: SPACING.large }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center' }}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                        <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3/4 }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center' }}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                        <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3/4 }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center' }}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                        <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3/4 }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center' }}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                        <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3/4 }}>
                            <ContentLoader
                                speed={2}
                                height={'100%'}
                                width='100%'
                                style={{ borderRadius: 10, alignSelf: 'center' }}
                                backgroundColor={COLORS.grey}
                                foregroundColor={COLORS.lightGrey}
                            >
                                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                            </ContentLoader>
                        </View>
                    </ScrollView>
                </View>
            )
        }

        if (ladiesUnderEstablishment.length === 0) {
            return null
        }

        return (
            <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
                <MotiText 
                    style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h2, color: '#FFF', marginBottom: SPACING.medium, textAlign: 'center' }}
                    from={{
                        opacity: 0,
                        transform: [{ translateY: -20 }],
                    }}
                    animate={{
                        opacity: 1,
                        transform: [{ translateY: 0 }],
                    }}
                    transition={{
                        type: 'timing'
                    }}
                >
                    Ladies in {data.name}
                </MotiText> 

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {ladiesUnderEstablishment.map((data, index) => <View key={data.id} style={{ marginLeft: index === 0 ? 0 : SPACING.large, width: 150 }}>
                        <RenderLady lady={data} width={150} delay={index * 20} />
                    </View>)}
                </ScrollView>
            </View>
        )
    }

    if (loading) {
        return renderSkeleton()
    }

    return (
        <>
            <LinearGradient colors={[
                COLORS.grey,
                COLORS.lightBlack,
            ]}
                style={{ position: 'absolute', width: '100%', height: Dimensions.get('window').height - normalize(70) }}
            />

            <View style={{ alignSelf: 'center', maxWidth: '100%', width: 800 + SPACING.xxx_small, padding: SPACING.large }}>
                {renderHeaderInfo()}

                {data.accountType === 'lady' && renderPhotosGrid()}

                {data.accountType === 'establishment' && renderCoverPhoto()}

                {renderAbout()}

                {data.accountType === 'lady' && renderPersonalDetails()}

                {data.accountType === 'lady' && renderPricing()}

                {data.accountType === 'lady' && renderServices()}

                {renderWorkingHours()}

                {renderAddress()}

                {data.accountType === 'establishment' && renderLadiesUnderEstablishment()}
            </View>

            <AssetsTabView visible={photosModalVisible} pressedAssetIndex={pressedImageIndexRef.current} images={Object.values(images)} videos={videos} closeModal={closeModal} />
        </>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps)(Profile)

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.large,
        padding: SPACING.small,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
        backgroundColor: COLORS.grey,

        //boxShadow:  '-5px 5px 20px #1d1c20,5px -5px 20px #1d1c20'

        /*shadowColor: COLORS.red,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,*/
    },
    sectionHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.small,
    },
    sectionHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginBottom: SPACING.small,
    },
    attributeName: {
        color: COLORS.greyText,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    attributeValue: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium
    },
    attributeDivider: {
        flexGrow: 1,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        marginBottom: 4
    },
    serviceText: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.regular
    },
    chip: {
        marginRight: SPACING.xx_small,
        backgroundColor: COLORS.darkRed2,
        paddingHorizontal: SPACING.xx_small,
        paddingVertical: 5,
        borderRadius: 10,
        borderColor: COLORS.lightGrey,
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xx_small,
        overflow: 'hidden'
    },
    chipText: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    table: {
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        flexDirection: 'row',
        borderRadius: 5,
        overflow: 'hidden'
    },
    tableHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium
    },
    tableHeaderValue: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    column: {
        padding: SPACING.xx_small
    }
})