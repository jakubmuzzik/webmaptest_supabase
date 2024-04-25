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
import Toast from "../components/Toast"
import { Link } from 'react-router-dom'

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay
} from 'react-native-reanimated'

import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from "react-redux"
import { ACTIVE, MASSAGE_SERVICES } from "../labels"

import { supabase } from "../supabase/config"

const Lady = ({ toastRef }) => {
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

    const establishmentNameRotateX = useSharedValue('90deg')
    const leftPhotoOpacity = useSharedValue(0)
    const rightPhotosOpacity1 = useSharedValue(0)
    const rightPhotosOpacity2 = useSharedValue(0)
    const leftPhotoTranslateY = useSharedValue(20)
    const rightPhotosTranslateY1 = useSharedValue(20)
    const rightPhotosTranslateY2 = useSharedValue(20)

    const establishmentNameAnimatedStyle = useAnimatedStyle(() => {
        return {
            color: COLORS.greyText,
            fontSize: FONT_SIZES.large,
            fontFamily: FONTS.medium,
            transform: [{ rotateX: establishmentNameRotateX.value }],
        }
    })

    const leftPhotoAnimatedStyle = useAnimatedStyle(() => {
        return {
            width: '50%',
            flexShrink: 1,
            marginRight: SPACING.xxx_small,
            opacity: leftPhotoOpacity.value,
            transform: [{ translateY: leftPhotoTranslateY.value }],
        }
    })

    const rightPhotosAnimatedStyle1 = useAnimatedStyle(() => {
        return {
            flexDirection: 'row',
            marginBottom: SPACING.xxx_small,
            flexGrow: 1,
            opacity: rightPhotosOpacity1.value,
            transform: [{ translateY: rightPhotosTranslateY1.value }],
        }
    })

    const rightPhotosAnimatedStyle2 = useAnimatedStyle(() => {
        return {
            flexDirection: 'row',
            flexGrow: 1,
            opacity: rightPhotosOpacity2.value,
            transform: [{ translateY: rightPhotosTranslateY2.value }],
        }
    })

    useLayoutEffect(() => {
        if (data) {
            setLoading(false)

            if (data.establishment_id) {
                fetchEstablishmentName(data.establishment_id)
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
            const { data, error } = await supabase
                .from('ladies')
                .select('*, images(*), videos(*)')
                .eq('id', id)

            if (error) {
                throw error
            }

            if (!data[0]) {
                throw new Error('Lady was not found.')
            }

            setData(data[0])

            if (data[0].establishment_id) {
                fetchEstablishmentName(data[0].establishment_id)
            }

            setLoading(false)
        } catch (error) {
            console.error(error)

            setData(undefined)

            toastRef.current.show({
                type: 'error',
                text: 'We could not find the lady.'
            })
        }
    }

    const fetchEstablishmentName = async (establishment_id) => {
        try {
            const { data, error } = await supabase
                .from('establishments')
                .select('name')
                .eq('id', establishment_id)

            if (error) {
                throw error
            }

            if (!data[0]) {
                throw new Error('Establishment name was not found.')
            }

            setEstablishmentName(data[0].name)
        } catch (error) {
            console.error(error)
        }
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

    const onEstablishmentLinkPress = async () => {
        navigate({
            pathname: '/establishment/' + data.establishment_id,
            search: new URLSearchParams({
                ...stripEmptyParams(params)
            }).toString(),
            state: null
        })
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
                        style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3 / 4 }}
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
                            style={{ borderRadius: 10, alignSelf: 'center', marginRight: SPACING.xxx_small, aspectRatio: 3 / 4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3 / 4, }}
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
                            style={{ borderRadius: 10, alignSelf: 'center', marginRight: SPACING.xxx_small, aspectRatio: 3 / 4, }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                        </ContentLoader>
                        <ContentLoader
                            speed={2}
                            height={'100%'}
                            width='100%'
                            style={{ borderRadius: 10, alignSelf: 'center', aspectRatio: 3 / 4, }}
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
            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.greyText, marginBottom: SPACING.xx_small }}>
                {calculateAgeFromDate(data.date_of_birth)} years <Text style={{ color: COLORS.red }}>•</Text> {data.height} cm <Text style={{ color: COLORS.red }}>•</Text> {data.weight} kg
            </Text>
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
                                source={images[0]?.download_url}
                                placeholder={images[0]?.blurhash}
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
                                    source={images[1]?.download_url}
                                    placeholder={images[1]?.blurhash}
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
                                    source={images[2]?.download_url}
                                    placeholder={images[2]?.blurhash}
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
                                    source={images[3]?.download_url}
                                    placeholder={images[3]?.blurhash}
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
                                    source={images[4]?.download_url}
                                    placeholder={images[4]?.blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                            </TouchableOpacity>
                        </HoverableView>
                    </Animated.View>
                </View>
            </View>

            <View style={{ alignSelf: 'center', flexDirection: 'row', marginTop: SPACING.x_small, backgroundColor: COLORS.darkRedBackground, borderRadius: 5, borderWidth: 1, borderColor: COLORS.darkRedBorderColor2, paddingHorizontal: SPACING.xxx_small, paddingVertical: 4 }}>
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
            <LinearGradient colors={[
                COLORS.darkRedBackground,
                COLORS.darkRedBackground2,
            ]}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            <View style={{ padding: SPACING.small }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        About
                    </Text>
                    {!data.establishment_id && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                        • Independent lady
                    </Text>}
                    {data.establishment_id && establishmentName && (
                        <Animated.Text
                            numberOfLines={2}
                            style={establishmentNameAnimatedStyle}
                        >
                            • Lady from <Text onPress={onEstablishmentLinkPress} style={{ color: COLORS.red, textDecorationLine: 'underline' }}>{establishmentName}</Text>
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
        </View>
    )

    const renderPersonalDetails = () => (
        <View style={styles.section}>
            <LinearGradient colors={[
                COLORS.darkRedBackground,
                COLORS.darkRedBackground2,
            ]}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View style={{ paddingVertical: SPACING.small }}>
                <Text style={[styles.sectionHeaderText, { marginLeft: SPACING.small }]}>
                    Personal Details
                </Text>
                <View style={{ flex: 1, flexDirection: isSmallScreen ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', flex: 1, marginHorizontal: SPACING.small }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Age</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{calculateAgeFromDate(data.date_of_birth)}</Text>
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
                            <Text style={styles.attributeValue}>{data.body_type}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Pubic hair</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{data.pubic_hair}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Breast size</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{data.breast_size}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Breast type</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{data.breast_type}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Hair color</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{data.hair_color}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.attributeName} numberOfLines={1}>Eye color</Text>
                            <View style={styles.attributeDivider}></View>
                            <Text style={styles.attributeValue}>{data.eye_color}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )

    const renderServices = () => (
        <View style={styles.section}>
            <LinearGradient colors={[
                COLORS.darkRedBackground,
                COLORS.darkRedBackground2,
            ]}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            <View style={{ padding: SPACING.small }}>
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
        </View>
    )

    const renderWorkingHours = () => {
        const todaysDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase()
        const todaysWorkingHours = data.working_hours.find(working_hours => working_hours.day === todaysDay)

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
                <LinearGradient colors={[
                    COLORS.darkRedBackground,
                    COLORS.darkRedBackground2,
                ]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                <View style={{ padding: SPACING.small }}>
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
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[0].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[0].enabled ? (data.working_hours[0].from + ' - ' + data.working_hours[0].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[1].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[1].enabled ? (data.working_hours[1].from + ' - ' + data.working_hours[1].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[2].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[2].enabled ? (data.working_hours[2].from + ' - ' + data.working_hours[2].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[3].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[3].enabled ? (data.working_hours[3].from + ' - ' + data.working_hours[3].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[4].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[4].enabled ? (data.working_hours[4].from + ' - ' + data.working_hours[4].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[5].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[5].enabled ? (data.working_hours[5].from + ' - ' + data.working_hours[5].until) : 'Not available'}</Text>
                            </HoverableView>
                            <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={[styles.tableHeaderValue, { color: data.working_hours[6].enabled ? COLORS.white : COLORS.greyText }]}>{data.working_hours[6].enabled ? (data.working_hours[6].from + ' - ' + data.working_hours[6].until) : 'Not available'}</Text>
                            </HoverableView>
                        </View>
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
                <LinearGradient colors={[
                    COLORS.darkRedBackground,
                    COLORS.darkRedBackground2,
                ]}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                />

                <View style={{ padding: SPACING.small }}>
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
            </View>
        )
    }

    const renderAddress = () => (
        <View style={styles.section}>
            <LinearGradient colors={[
                COLORS.darkRedBackground,
                COLORS.darkRedBackground2,
            ]}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            <View style={{ padding: SPACING.small }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Address
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                        <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.white} style={{ marginRight: 3 }} />
                        <Text numberOfLines={1} style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: data.address ? COLORS.white : COLORS.error }}>
                            {data.address ? (data.hidden_address ? data.address.city : data.address.title) : 'Enter your address'}
                        </Text>
                    </View>
                </View>

                {!data.hidden_address && <View style={{ width: '100%', height: 300, borderRadius: 5, overflow: 'hidden' }}>
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
        </View>
    )

    if (loading) {
        return renderSkeleton()
    }

    return (
        <>
            <LinearGradient colors={[
                COLORS.darkRedBackground,
                COLORS.lightBlack,
            ]}
                style={{ position: 'absolute', width: '100%', height: Dimensions.get('window').height - normalize(400) }}
            />

            <View style={{ alignSelf: 'center', maxWidth: '100%', width: 800 + SPACING.xxx_small, padding: SPACING.large }}>
                {renderHeaderInfo()}

                {renderPhotosGrid()}

                {renderAbout()}

                {renderPersonalDetails()}

                {renderPricing()}

                {renderServices()}

                {renderWorkingHours()}

                {renderAddress()}
            </View>

            <AssetsTabView visible={photosModalVisible} pressedAssetIndex={pressedImageIndexRef.current} images={Object.values(images)} videos={videos} closeModal={closeModal} />
        </>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps)(Lady)

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.large,
        //padding: SPACING.small,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.darkRedBorderColor2,
        //backgroundColor: COLORS.darkRedBackground,
        backgroundColor: 'transparent',
        overflow: 'hidden'

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