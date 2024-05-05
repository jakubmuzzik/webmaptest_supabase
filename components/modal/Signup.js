import React, { useMemo, useState, useRef, useEffect, memo } from 'react'
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text, ImageBackground, Image, StyleSheet, Dimensions, ScrollView } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { Ionicons, AntDesign, MaterialCommunityIcons, Entypo } from '@expo/vector-icons'
import HoverableView from '../HoverableView'
import { normalize } from '../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../constants'
import HoverableInput from '../HoverableInput'
import { stripEmptyParams, getParam } from '../../utils'
import { TouchableRipple, Button, HelperText } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'

const window = Dimensions.get('window')

import { useSearchParams, useNavigate } from 'react-router-dom'

const Signup = ({ visible, setVisible, onLoginPress }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [routes] = useState([
        { key: '1' },
        { key: '2' }
    ])

    const [data, setData] = useState({
        gender: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secureTextEntry: true,
        confirmSecureTextEntry: true,
    })
    const [showErrorMessages, setShowErrorMessages] = useState(false)
    const [profileType, setProfileType] = useState()
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])

    const scrollY1 = useSharedValue(0)
    const scrollY2 = useSharedValue(0)

    const scrollHandler1 = useAnimatedScrollHandler((event) => {
        scrollY1.value = event.contentOffset.y
    })
    const scrollHandler2 = useAnimatedScrollHandler((event) => {
        scrollY2.value = event.contentOffset.y
    })

    const translateY = useSharedValue(window.height)

    const modalHeaderTextStyles1 = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY1.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            color: COLORS.white,
            backgroundColor: COLORS.grey//'#261718'
        }
    })

    const closeModal = () => {
        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
        setShowErrorMessages(false)
        setIndex(0)
        setProfileType(null)
    }

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: COLORS.grey,//'#261718',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: COLORS.lightGrey,
            width: normalize(500),
            maxWidth: '90%',
            height: normalize(650),
            maxHeight: '90%',
            overflow: 'hidden',
            transform: [{ translateY: translateY.value }]
        }
    })

    const onContinuePress = () => {
        if (profileType === 'member') {
            closeModal()
            navigate({
                pathname: '/establishment-signup',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            })
        } else if (profileType === 'lady') {
            closeModal()
            navigate({
                pathname: '/lady-signup',
                search: new URLSearchParams(stripEmptyParams(params)).toString()
            })
        }
    }

    const onSignUpPress = () => {
        if (!data.email || !data.password || !data.name || !data.confirmPassword || !data.gender || data.password !== data.confirmPassword) {
            setShowErrorMessages(true)
            return
        }
    }

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        })
    }

    const updateConfirmSecureTextEntry = () => {
        setData({
            ...data,
            confirmSecureTextEntry: !data.confirmSecureTextEntry
        })
    }

    const renderSignUpPage = () => {
        return (
            <>
                <View style={styles.modal__header}>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}></View>
                    <View style={{ flexShrink: 1, flexGrow: 0 }}>
                        <Animated.Text style={modalHeaderTextStyles1}>Sign up</Animated.Text>
                    </View>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                        <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground} backgroundColor={'#372b2b'}>
                            <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="white" />
                        </HoverableView>
                    </View>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles1]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler1} style={{ flex: 1, zIndex: 1, backgroundColor: COLORS.grey/*'#261718'*/ }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                    {/* <LinearGradient colors={[
                        COLORS.darkRedBackground,//'#4b010140',//COLORS.darkRedBackground,
                        COLORS.lightBlack,
                    ]}
                        style={{ position: 'absolute', width: '100%', height: 200 }}
                    /> */}
                    {/* <LinearGradient colors={[
                        '#221718',//'#4b010140',//COLORS.darkRedBackground,
                        '#261718',
                    ]}
                        style={{ position: 'absolute', width: '100%', height: 300 }}
                    /> */}

                    <View style={{ paddingHorizontal: SPACING.small }}>

                        <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, color: COLORS.white }}>
                            Sign up
                        </Text>

                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, paddingTop: SPACING.x_small, marginBottom: SPACING.x_small, color: COLORS.white }}>
                            How would you like to Sign up?
                        </Text>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableRipple style={{
                                flex: 1,
                                marginRight: SPACING.xx_small,
                                flexDirection: 'column',
                                borderRadius: 5,
                                borderColor: profileType === 'lady' ? COLORS.red : 'rgba(255, 255,255, .1)',
                                backgroundColor: profileType === 'lady' ? 'rgba(220, 46, 46, .10)' : 'transparent',
                                borderWidth: 1,
                                height: 350,
                                overflow: 'hidden'
                            }}
                                onPress={() => setProfileType('lady')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                <ImageBackground source={{ uri: require('../../assets/lady.jpg') }}
                                    style={{ flex: 1, padding: SPACING.x_small }}
                                    imageStyle={{ opacity: profileType === 'lady' ? 1 : 0.7 }}
                                    resizeMode='cover'>
                                    <Image 
                                        source={require('../../assets/lady-linear-gradient.png')}
                                        style={{ width: 40, height: 40, tintColor: COLORS.white }}
                                    />
                                    <Text style={{ color: COLORS.white, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginTop: SPACING.x_small }}>
                                        As Independent Lady
                                    </Text>
                                </ImageBackground>
                            </TouchableRipple>

                            <TouchableRipple style={{
                                flex: 1,
                                marginLeft: SPACING.xx_small,
                                flexDirection: 'column',
                                borderRadius: 5,
                                borderColor: profileType === 'member' ? COLORS.red : 'rgba(255, 255,255, .1)',
                                backgroundColor: profileType === 'member' ? 'rgba(220, 46, 46, .10)' : 'transparent',
                                borderWidth: 1,
                                overflow: 'hidden'
                            }}
                                onPress={() => setProfileType('member')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                <ImageBackground source={{ uri: require('../../assets/establishment.jpg') }}
                                    style={{ flex: 1, padding: SPACING.x_small }}
                                    imageStyle={{ opacity: profileType === 'member' ? 1 : 0.7 }}
                                    resizeMode='cover'>
                                    <Image
                                        source={require('../../assets/ladies-linear-gradient.png')}
                                        style={{ width: 40, height: 40, tintColor: COLORS.white }}
                                    />
                                    <Text style={{ color: COLORS.white, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginTop: SPACING.x_small }}>
                                        As Establishment
                                    </Text>
                                </ImageBackground>

                            </TouchableRipple>
                        </View>

                        <Button
                            disabled={!profileType}
                            labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                            style={{ marginTop: SPACING.medium, borderRadius: 10 }}
                            buttonColor={COLORS.red}
                            rippleColor="rgba(220, 46, 46, .16)"
                            mode="contained"
                            onPress={onContinuePress}
                            theme={{ colors: { surfaceDisabled: COLORS.hoveredLightGrey } }}
                        >
                            Continue
                        </Button>

                        <Text style={{ alignSelf: 'center', marginTop: SPACING.small, fontSize: FONTS.medium, fontStyle: FONTS.medium, color: COLORS.placeholder }}>
                            Already have an Account?
                            <Text onPress={onLoginPress} style={{ marginLeft: SPACING.xxx_small, color: COLORS.linkColor }}>Log in</Text>
                        </Text>
                    </View>
                </Animated.ScrollView>
            </>
        )
    }

    return (
        <Modal transparent={true}
            visible={visible}
            animationType="fade">
            <TouchableOpacity
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', cursor: 'default' }}
                activeOpacity={1}
                onPressOut={closeModal}
            >
                <TouchableWithoutFeedback>
                    <Animated.View style={modalContainerStyles}>
                        {renderSignUpPage()}
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default memo(Signup)

const styles = StyleSheet.create({
    modal__header: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        //backgroundColor: '#FFF',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modal__shadowHeader: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        backgroundColor: '#FFF',
        zIndex: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5
    }
})