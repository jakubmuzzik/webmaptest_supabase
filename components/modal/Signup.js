import React, { useMemo, useState, useRef, useEffect, memo } from 'react'
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text, FlatList, Image, StyleSheet, Dimensions, ScrollView } from 'react-native'
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
import { TabView } from 'react-native-tab-view'

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
        }
    })
    const modalHeaderTextStyles2 = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY2.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
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
            backgroundColor: '#FFF',
            borderRadius: 24,
            width: normalize(500),
            maxWidth: '90%',
            height: normalize(500),
            maxHeight: '80%',
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
                        <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                            <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                        </HoverableView>
                    </View>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles1]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler1} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingHorizontal: SPACING.small }}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large }}>
                        Sign up
                    </Text>

                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, paddingTop: SPACING.small, marginBottom: SPACING.medium }}>
                        How would you like to Sign up?
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableRipple style={{
                            flex: 1,
                            marginRight: SPACING.xx_small,
                            flexDirection: 'column',
                            padding: SPACING.x_small,
                            borderRadius: 5,
                            borderColor: profileType === 'lady' ? COLORS.red : COLORS.placeholder,
                            backgroundColor: profileType === 'lady' ? 'rgba(220, 46, 46, .10)' : 'transparent',
                            borderWidth: 1
                        }}
                            onPress={() => setProfileType('lady')}
                            rippleColor="rgba(220, 46, 46, .10)"
                        >
                            <>
                                <View>
                                    <Entypo name="mask" size={28} color="black" />
                                </View>
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginTop: SPACING.x_small }}>
                                    As Independent Lady
                                </Text>
                            </>
                        </TouchableRipple>

                        <TouchableRipple style={{
                            flex: 1,
                            marginLeft: SPACING.xx_small,
                            flexDirection: 'column',
                            padding: SPACING.x_small,
                            borderRadius: 5,
                            borderColor: profileType === 'member' ? COLORS.red : COLORS.placeholder,
                            backgroundColor: profileType === 'member' ? 'rgba(220, 46, 46, .10)' : 'transparent',
                            borderWidth: 1
                        }}
                            onPress={() => setProfileType('member')}
                            rippleColor="rgba(220, 46, 46, .10)"
                        >
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <MaterialCommunityIcons name="guy-fawkes-mask" size={28} color="black" />
                                </View>
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginTop: SPACING.x_small }}>
                                    As Establishment
                                </Text>
                            </>

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
                    >
                        Continue
                    </Button>

                    <Text style={{ alignSelf: 'center', marginTop: SPACING.small, fontSize: FONTS.medium, fontStyle: FONTS.medium, color: COLORS.lightBlack }}>
                        Already have an Account?
                        <Text onPress={onLoginPress} style={{ marginLeft: SPACING.xxx_small, color: 'blue' }}>Log in</Text>
                    </Text>
                </Animated.ScrollView>
            </>
        )
    }

    const renderMemberSignUp = () => {
        return (
            <>
                <View style={styles.modal__header}>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}>
                        <HoverableView style={{ marginLeft: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                            <Ionicons onPress={() => setIndex(0)} name="arrow-back" size={normalize(25)} color="black" />
                        </HoverableView>
                    </View>
                    <View style={{ flexShrink: 1, flexGrow: 0 }}>
                        <Animated.Text style={modalHeaderTextStyles2}>Sign up</Animated.Text>
                    </View>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                        <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                            <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                        </HoverableView>
                    </View>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles2]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler2} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingHorizontal: SPACING.small}}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large }}>
                        Member sign up
                    </Text>

                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, paddingTop: SPACING.small, marginBottom: SPACING.xx_small }}>
                        Who are you?
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                        <TouchableRipple style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.x_small, marginRight: SPACING.x_small, borderRadius: 10 }}
                            onPress={() => setData({ ...data, gender: 'man' })}
                            rippleColor="rgba(220, 46, 46, .10)"
                        >
                            <Image
                                resizeMode="contain"
                                source={require('../../assets/images/man.png')}
                                style={[
                                    {
                                        width: normalize(45),
                                        height: normalize(45),
                                    },
                                    data.gender === 'man' ? {} : { tintColor: COLORS.placeholder }
                                ]}
                            />
                        </TouchableRipple>
                        <TouchableRipple style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.x_small, marginLeft: SPACING.x_small, borderRadius: 10 }}
                            onPress={() => setData({ ...data, gender: 'woman' })}
                            rippleColor="rgba(220, 46, 46, .10)"
                        >
                            <Image
                                resizeMode="contain"
                                source={require('../../assets/images/woman.png')}
                                style={[
                                    {
                                        width: normalize(45),
                                        height: normalize(45),
                                    },
                                    data.gender === 'woman' ? {} : { tintColor: COLORS.placeholder }
                                ]}
                            />
                        </TouchableRipple>
                    </View>
                    {showErrorMessages && !data.gender && <HelperText type="error" visible>
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error }}>
                            Select Your Gender
                        </Text>
                    </HelperText>}

                    <HoverableInput
                        placeholder="Enter your name"
                        label="Name"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.name}
                        setText={(text) => setData({ ...data, ['name']: text })}
                        leftIconName="badge-account-outline"
                        errorMessage={showErrorMessages && !data.name ? 'Enter your name' : undefined}
                    />

                    <HoverableInput
                        placeholder="Enter your email"
                        label="Email"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.email}
                        setText={(text) => setData({ ...data, ['email']: text })}
                        leftIconName="email-outline"
                        errorMessage={showErrorMessages && !data.email ? 'Enter your email' : undefined}
                    />

                    <HoverableInput
                        placeholder="Password (8 or more characters)"
                        label="Password"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.password}
                        setText={(text) => setData({ ...data, ['password']: text.replaceAll(' ', '') })}
                        leftIconName='lock-outline'
                        rightIconName={data.secureTextEntry ? 'eye-off' : 'eye'}
                        onRightIconPress={updateSecureTextEntry}
                        errorMessage={showErrorMessages && (!data.password || data.password.length < 8) ? 'Password must be at least 8 characters long' : undefined}
                        secureTextEntry={data.secureTextEntry}
                    />

                    <HoverableInput
                        placeholder="Confirm your password"
                        label="Confirm password"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.confirmPassword}
                        setText={(text) => setData({ ...data, ['confirmPassword']: text.replaceAll(' ', '') })}
                        leftIconName="lock-outline"
                        rightIconName={data.confirmSecureTextEntry ? 'eye-off' : 'eye'}
                        onRightIconPress={updateConfirmSecureTextEntry}
                        errorMessage={showErrorMessages && (!data.confirmPassword || data.confirmPassword.length < 8) ? 'Password must be at least 8 characters long' : showErrorMessages && data.password !== data.confirmPassword ? 'Provided passwords do not match.' : undefined}
                        secureTextEntry={data.confirmSecureTextEntry}
                    />

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.medium, borderRadius: 10 }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onSignUpPress}
                    >
                        Sign up
                    </Button>
                </Animated.ScrollView>
            </>
        )
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return renderSignUpPage()
            case '2':
                return renderMemberSignUp()
        }
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
                        {/* <TabView
                            renderTabBar={props => null}
                            swipeEnabled={false}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                        /> */}
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