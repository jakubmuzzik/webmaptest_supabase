import React, { memo, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../../constants'
import HoverableInput from '../../../components/HoverableInput'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { normalize } from '../../../utils'
import { HelperText } from 'react-native-paper'
import { supabase } from '../../../supabase/config'

import { LinearGradient } from 'expo-linear-gradient'

const LoginInformation = forwardRef((props, ref) => {
    const { i, contentWidth, toastRef } = props

    const [data, setData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showErrors, setShowErrors] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [secureTextEntry, setSecureTextEntry] = useState(true)
    const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true)

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validate = async () => {
        if (!data.email || !data.password || !data.confirmPassword || data.password !== data.confirmPassword || data.password.length < 8 || !agreed) {
            setShowErrors(true)
            return false
        }

        const isEmailValid = isValidEmail(data.email)
        if (!isEmailValid) {
            toastRef.show({
                type: 'error',
                text: 'Provided Email address is invalid.'
            })
            return false
        }

        try {
            const { data: ladiesData, ladiesError } = await supabase
                .from('ladies')
                .select('email')
                .eq('email', data.email)

            if (ladiesError) {
                console.error(ladiesError)
                toastRef.show({
                    type: 'error',
                    text: 'Could not validate the email.'
                })

                return false
            }

            const { data: establishmentsData, establishmentsError } = await supabase
                .from('establishments')
                .select('email')
                .eq('email', data.email)

            if (establishmentsError) {
                console.error(establishmentsError)
                toastRef.show({
                    type: 'error',
                    text: 'Could not validate the email.'
                })

                return false
            }

            if ((ladiesData && ladiesData.length > 0) || (establishmentsData && establishmentsData.length > 0)) {
                toastRef.show({
                    type: 'error',
                    text: 'Email address is already in use.'
                })
                return false
            }
        } catch (error) {
            console.error(error)

            toastRef.show({
                type: 'error',
                text: 'Could not validate the email.'
            })

            return false
        }

        setShowErrors(false)

        return true
    }

    useImperativeHandle(ref, () => ({
        validate,
        data: { email: data.email, password: data.password }
    }))

    const scrollY = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const onValueChange = (value, attribute) => {
        setData(data => ({
            ...data,
            [attribute]: value
        }))
    }

    const onTermsOfServicePress = () => {

    }

    const onPrivacyPolicyPress = () => {

    }

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            color: COLORS.white,
            backgroundColor: COLORS.grey//'#261718'
        }
    })

    return (
        <>
            <View style={styles.modal__header}>
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Login Information`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                {/* <LinearGradient colors={[
                    '#221718',//'#4b010140',//COLORS.darkRedBackground,
                    '#261718',
                ]}
                    style={{ position: 'absolute', width: '100%', height: 300 }}
                /> */}

                <View style={{ paddingTop: SPACING.xxxxx_large }}>

                    <Text style={styles.pageHeaderText}>
                        {`${i + 1}. Login Information`}
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                        <HoverableInput
                            placeholder="lady@email.com"
                            label="Email"
                            containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                            text={data.email}
                            setText={(text) => onValueChange(text, 'email')}
                            leftIconName="email-outline"
                            errorMessage={showErrors && !data.email ? 'Enter your Email' : undefined}
                        />
                        <HoverableInput
                            placeholder="8 or more characters"
                            label="Password"
                            containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                            text={data.password}
                            setText={(text) => onValueChange(text, 'password')}
                            leftIconName='lock-outline'
                            rightIconName={secureTextEntry ? 'eye-off' : 'eye'}
                            onRightIconPress={() => setSecureTextEntry(a => !a)}
                            errorMessage={showErrors && (!data.password || data.password.length < 8) ? 'Password must be at least 8 characters long' : undefined}
                            secureTextEntry={secureTextEntry}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                        <HoverableInput
                            placeholder="Confirm your password"
                            label="Confirm password"
                            containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                            text={data.confirmPassword}
                            setText={(text) => onValueChange(text, 'confirmPassword')}
                            leftIconName="lock-outline"
                            rightIconName={confirmSecureTextEntry ? 'eye-off' : 'eye'}
                            onRightIconPress={() => setConfirmSecureTextEntry(a => !a)}
                            errorMessage={showErrors && (!data.confirmPassword || data.confirmPassword.length < 8) ? 'Password must be at least 8 characters long' : showErrors && data.password !== data.confirmPassword ? 'Provided passwords do not match.' : undefined}
                            secureTextEntry={confirmSecureTextEntry}
                        />

                        <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <BouncyCheckbox
                                    style={{}}
                                    disableBuiltInState
                                    isChecked={agreed}
                                    size={normalize(19)}
                                    fillColor={agreed ? COLORS.red : COLORS.placeholder}
                                    unfillColor="#FFFFFF"
                                    iconStyle={{ borderRadius: 3 }}
                                    innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                    onPress={() => setAgreed(a => !a)}
                                />
                                <Text style={{ fontSize: FONT_SIZES.medium, fontFamily: FONTS.medium, color: COLORS.white, alignSelf: 'flex-end' }}>
                                    I agree to Ladiesforfun <Text style={{ color: COLORS.linkColor }} onPress={onTermsOfServicePress}>Terms of Service</Text> and <Text style={{ color: COLORS.linkColor }} onPress={onPrivacyPolicyPress}>Privacy Policy</Text>.
                                </Text>
                            </View>
                            {showErrors && !agreed && <HelperText type="error" visible>
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error }}>
                                    You must agree before continuing
                                </Text>
                            </HelperText>}
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>
        </>
    )
})

export default memo(LoginInformation)

const styles = StyleSheet.create({
    pageHeaderText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginHorizontal: SPACING.x_large,
        marginBottom: SPACING.small
    },
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal__shadowHeader: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        backgroundColor: COLORS.white,
        zIndex: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5
    },
})