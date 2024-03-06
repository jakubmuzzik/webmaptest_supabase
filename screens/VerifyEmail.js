import React, { useEffect, useState, useMemo } from "react"
import { View, Text } from 'react-native'
import { Button } from "react-native-paper"
import { COLORS, SPACING, FONTS, FONT_SIZES, SUPPORTED_LANGUAGES } from "../constants"
import { normalize, getParam, stripEmptyParams } from "../utils"
import { getAuth, reload, updateDoc, doc, sendEmailVerification, db } from "../firebase/config"
import { connect } from "react-redux"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import EmailEditor from "../components/modal/account/EmailEditor"
import LottieView from 'lottie-react-native'

const VerifyEmail = ({ toastRef }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [continueButtonLoading, setContinueButtonLoading] = useState(false)
    const [resetButtonLoading, setResetButtonLoading] = useState(false)
    const [emailEditorVisible, setEmailEditorVisible] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
  
    const from = location.state?.from?.pathname || "/account"

    useEffect(() => {
        if (getAuth().currentUser.emailVerified) {
            navigate({
                pathname: '/account',
                search: new URLSearchParams(stripEmptyParams(params)).toString(),
                replace: true
            })
        }
    }, [])

    const onContinuePress = async () => {
        setContinueButtonLoading(true)
        try {
            await reload(getAuth().currentUser)
            if (getAuth().currentUser.emailVerified) {
                await updateDoc(doc(db, 'users', getAuth().currentUser.uid), {
                    email: getAuth().currentUser.email
                })

                toastRef.current.show({
                    type: 'success',
                    headerText: 'Success!',
                    text: 'Your account has been verified.'
                })

                if (params.language) {
                    from += '?language=' + params.language
                }

                navigate(from, {
                    replace: true
                })
            } else {
                toastRef.current.show({
                    type: 'warning',
                    text: 'Please verify your email address.'
                })
            }
        } catch(e) {
            console.error(e)
        } finally {
            setContinueButtonLoading(false)
        }
    }

    const onResendPress = async () => {
        setResetButtonLoading(true)
        try {
            await sendEmailVerification(getAuth().currentUser)
            toastRef.current.show({
                type: 'success',
                text: 'Confimation email has been re-sent.'
            })
        } catch (e) {
            console.error(e)
            toastRef.current.show({
                type: 'error',
                text: 'Email could not be sent. Try again later.'
            })
        } finally {
            setResetButtonLoading(false)
        }
    }

    const onChangeEmailPress = () => {
        setEmailEditorVisible(true)
    }

    return (
        <>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.large, width: normalize(500), maxWidth: '100%', alignSelf: 'center' }}>
                <LottieView
                    style={{  height: 130 }}
                    autoPlay
                    loop
                    source={require('../assets/mail-verification.json')}
                />

                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.h1, color: '#FFF', textAlign: 'center', marginTop: SPACING.x_large }}>Verify your email</Text>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, paddingTop: SPACING.small, color: COLORS.greyText, textAlign: 'center' }}>
                    We have sent a confirmation mail to
                    <Text style={{ color: '#FFF' }}> {getAuth().currentUser.email}</Text>.
                    Check your email and click the link to activate your account.
                </Text>

                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    style={{ marginTop: SPACING.large, borderRadius: 10, width: 200, alignSelf: 'center' }}
                    buttonColor={COLORS.red}
                    rippleColor="rgba(220, 46, 46, .16)"
                    mode="contained"
                    onPress={onContinuePress}
                    loading={continueButtonLoading}
                    disabled={continueButtonLoading}
                >
                    Continue
                </Button>

                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    style={{ marginTop: SPACING.small, borderRadius: 10, width: 200, flexShrink: 1, alignSelf: 'center' }}
                    rippleColor="rgba(220, 46, 46, .16)"
                    mode="outlined"
                    onPress={onResendPress}
                    loading={resetButtonLoading}
                    disabled={resetButtonLoading}
                >
                    Resend
                </Button>

                <Text style={{ alignSelf: 'center', marginTop: SPACING.small, fontSize: FONTS.medium, fontStyle: FONTS.medium, color: COLORS.greyText }}>
                    Wrong email?
                    <Text onPress={onChangeEmailPress} style={{ marginLeft: SPACING.xxx_small, color: '#FFF' }}>Change Email</Text>
                </Text>
            </View>

            <EmailEditor visible={emailEditorVisible} setVisible={setEmailEditorVisible} toastRef={toastRef}/>
        </>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps)(VerifyEmail)