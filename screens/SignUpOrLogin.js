import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS } from '../constants'
import { Button } from 'react-native-paper'
import { normalize } from '../utils'

import { useNavigate, useLocation } from 'react-router-dom'

import Login from '../components/modal/Login'
import Signup from '../components/modal/Signup'

const SignUpOrLogin = ({ }) => {
    const navigate = useNavigate()
    const location = useLocation()
  
    const from = location.state?.from?.pathname || "/"

    const [loginVisible, setLoginVisible] = useState(false)
    const [signUpVisible, setSignUpVisible] = useState(false)

    const onLoginPress = () => {
        setSignUpVisible(false)
        setLoginVisible(true)
    }

    const onSignUpPress = () => {
        setLoginVisible(false)
        setSignUpVisible(true)
    }

    return (
        <>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.large, width: normalize(500), maxWidth: '100%', alignSelf: 'center' }}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.h1, color: '#FFF', width: '100%' }}>Sign up or Log in</Text>

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.large, borderRadius: 10, width: '100%' }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onSignUpPress}
                    >
                        Sign up
                    </Button>

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.small, borderRadius: 10, width: '100%' }}
                        //buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="outlined"
                        onPress={onLoginPress}
                    >
                        Log in
                    </Button>
                </View>
            </View>

            <Login visible={loginVisible} setVisible={setLoginVisible} onSignUpPress={onSignUpPress} />
            <Signup visible={signUpVisible} setVisible={setSignUpVisible} onLoginPress={onLoginPress} />
        </>
    )
}

export default SignUpOrLogin