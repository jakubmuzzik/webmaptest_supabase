import React, { useMemo, useState, useRef, useEffect, memo } from 'react'
import { Modal, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import HoverableView from '../HoverableView'
import { normalize, getParam } from '../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    toastConfig
} from '../../constants'
import HoverableInput from '../HoverableInput'
import { Button } from 'react-native-paper'
import { TabView } from 'react-native-tab-view'
import { fetchUser } from '../../redux/actions'
import { connect } from 'react-redux'

import Toast from '../Toast'

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

import {
    db,
    getAuth,
    doc,
    updateDoc,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
  } from '../../firebase/config'

const window = Dimensions.get('window')

const Login = ({ visible, setVisible, onSignUpPress, toastRef, fetchUser }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
  
    let from = location.state?.from?.pathname || "/account"
    from = from === '/verify-email' ? '/account' : from

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [routes] = useState([
        { key: '1' },
        { key: '2' }
    ])

    const [data, setData] = useState({
        email: '',
        password: '',
        emailForReset: '',
        secureTextEntry: true
    })
    const [buttonIsLoading, setButtonIsLoading] = useState(false)
    const [resetPasswordButtonIsLoading, setResetPasswordButtonIsLoading] = useState(false)
    const [showErrorMessages, setShowErrorMessages] = useState(false)
    const [index, setIndex] = useState(0)

    const modalToastRef = useRef()

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

    const updateSecureTextEntry = () => {
        setData((data) => ({
            ...data,
            secureTextEntry: !data.secureTextEntry
        }))
    }

    const onForgotPasswordPress = () => {
        setIndex(1)
    }

    const onGoBackPress = () => {
        setIndex(0)
    }

    const onLoginPress = async () => {
        if (buttonIsLoading) {
            return
        }

        if (!data.email || !data.password) {
            setShowErrorMessages(true)
            return
        }

        setButtonIsLoading(true)

        const { email, password } = data

        try {
            await signInWithEmailAndPassword(getAuth(), email, password)
            updateDoc(doc(db, 'users', getAuth().currentUser.uid), {
                email
            })
            fetchUser()

            closeModal()

            if (params.language) {
                from += '?language=' + params.language
            }

            navigate(from, {
                replace: true
            })
        } catch(error) { 
            if (error.code?.includes('auth')) {
                modalToastRef.current.show({
                    type: 'error',
                    text: 'Invalid Username or Password.'
                })
            } else {
                modalToastRef.current.show({
                    type: 'error',
                    headerText: 'Login error',
                    text: 'Something went wrong.'
                })
            }
        } finally {
            setButtonIsLoading(false)
        }
    }

    const onResetPasswordPress = async () => {
        if (!data.emailForReset) {
            setShowErrorMessages(true)
            return
        }

        if(resetPasswordButtonIsLoading) {
            return
        }

        setResetPasswordButtonIsLoading(true)

        try {
            await sendPasswordResetEmail(getAuth(), data.emailForReset)
            
            toastRef.current.show({
                type: 'success',
                text: 'Instructions to reset your password have been sent to your Email address.'
            })
            closeModal()
        } catch(e) {
            modalToastRef.current.show({
                type: 'error',
                text: 'Provided Email address is invalid.'
            })
        } finally {
            setResetPasswordButtonIsLoading(false)
        }
    }

    const renderLoginPage = () => {
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
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.medium }}>
                        Log in
                    </Text>

                    <HoverableInput
                        placeholder="Enter your email"
                        label="Email"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.email}
                        setText={(text) => setData({ ...data, ['email']: text })}
                        leftIconName="email-outline"
                        errorMessage={showErrorMessages && !data.email ? 'Enter your Email' : undefined}
                        onSubmitEditing={onLoginPress}
                    />

                    <HoverableInput
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        placeholder="Enter your password"
                        label="Password"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.password}
                        setText={(text) => setData({ ...data, ['password']: text })}
                        leftIconName="lock-outline"
                        rightIconName={data.secureTextEntry ? 'eye-off' : 'eye'}
                        onRightIconPress={updateSecureTextEntry}
                        secureTextEntry={data.secureTextEntry}
                        errorMessage={showErrorMessages && !data.password ? 'Enter your Password' : undefined}
                        onSubmitEditing={onLoginPress}
                    />

                    <Text onPress={onForgotPasswordPress} style={{ alignSelf: 'flex-end', marginTop: SPACING.small, fontSize: FONTS.medium, fontStyle: FONTS.medium, color: 'blue' }}>
                        Forgot Password?
                    </Text>

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.medium, borderRadius: 10 }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onLoginPress}
                        loading={buttonIsLoading}
                        disabled={buttonIsLoading}
                    >
                        Log in
                    </Button>

                    <Text style={{ alignSelf: 'center', marginTop: SPACING.small, fontSize: FONTS.medium, fontStyle: FONTS.medium, color: COLORS.lightBlack }}>
                        Don't have an Account?
                        <Text onPress={onSignUpPress} style={{ marginLeft: SPACING.xxx_small, color: 'blue' }}>Sign up</Text>
                    </Text>
                </Animated.ScrollView>
            </>
        )
    }

    const renderForgotPasswordPage = () => {
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

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler2} style={{ zIndex: 1, paddingBottom: SPACING.small }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingHorizontal: SPACING.small }}>
                    <Image
                        resizeMode="contain"
                        source={require('../../assets/images/padlock-icon.png')}
                        style={{ width: '18%', height: '18%', alignSelf: 'center', marginTop: SPACING.xxxx_large, }}
                    />

                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.large, textAlign: 'center' }}>
                        Forgot your password?
                    </Text>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, paddingTop: SPACING.small, textAlign: 'center', marginBottom: SPACING.medium }}>
                        Enter your email and we will send you the instructions to reset your password.
                    </Text>

                    <HoverableInput
                        placeholder="Enter your email"
                        label="Email"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.emailForReset}
                        setText={(text) => setData({ ...data, ['emailForReset']: text })}
                        leftIconName="email-outline"
                        errorMessage={showErrorMessages && !data.emailForReset ? 'Enter Your Email' : undefined}
                        onSubmitEditing={onResetPasswordPress}
                    />

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.medium, marginBottom: SPACING.xx_large, borderRadius: 10 }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onResetPasswordPress}
                        loading={resetPasswordButtonIsLoading}
                        disabled={resetPasswordButtonIsLoading}
                    >
                        Reset password
                    </Button>
                </Animated.ScrollView>
            </>
        )
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return renderLoginPage()
            case '2':
                return renderForgotPasswordPage()
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
                        <TabView
                            renderTabBar={props => null}
                            swipeEnabled={false}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                        //initialLayout={{ width: contentWidth }}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>

            <Toast ref={modalToastRef}/>
        </Modal>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchUser })(memo(Login))

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