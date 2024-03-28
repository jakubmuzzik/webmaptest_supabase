import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated'
import HoverableInput from '../components/HoverableInput'
import { normalize } from '../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING
} from '../constants'
import { supabase } from '../supabase/config'

import { Button } from 'react-native-paper'
import { connect } from 'react-redux'

import { useNavigate } from 'react-router-dom'

const ChangePassword = ({ toastRef }) => {
    const navigate = useNavigate()

    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [data, setData] = useState({
        newPassword: '',
        confirmNewPassword: '',
        newSecureTextEntry: true,
        confirmNewSecureTextEntry: true
    })

    const scrollY = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
        }
    })

    const onSavePress = async () => {
        if (!data.newPassword || data.newPassword !== data.confirmNewPassword || data.newPassword.length < 8) {
            setShowErrorMessage(true)
            return
        }

        if (isSaving) {
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            const { error } = await supabase.auth.updateUser({ password: data.newPassword })
            if (error) {
                throw error
            }
            
            navigate('/account/settings', {
                replace: true
            })
        } catch (e) {
            if (e.message?.includes('New password should be different from the old password')) {
                toastRef.current.show({
                    type: 'error',
                    text: e.message
                })
            } else {
                toastRef.current.show({
                    type: 'error',
                    headerText: 'Password change error',
                    text: 'Password could not be changed. Please try it again later.'
                })
            }
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    const updateSecureTextEntry = (attribute) => {
        setData((d) => ({ ...d, [attribute]: !d[attribute] }))
    }

    return (
        <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', cursor: 'default' }}
        >
            <Animated.View style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                width: normalize(450),
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'hidden'
            }}>
                <View style={styles.modal__header}>
                    <Animated.Text numberOfLines={1} style={modalHeaderTextStyles}>Change password</Animated.Text>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingHorizontal: SPACING.small }}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.small }}>
                        Change password
                    </Text>

                    <HoverableInput
                        placeholder="8 or more characters"
                        label="New password"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.newPassword}
                        setText={(text) => setData({ ...data, ['newPassword']: text.replaceAll(' ', '') })}
                        leftIconName="lock-outline"
                        rightIconName={data.newSecureTextEntry ? 'eye-off' : 'eye'}
                        onRightIconPress={() => updateSecureTextEntry('newSecureTextEntry')}
                        errorMessage={showErrorMessage && (!data.newPassword || data.newPassword.length < 8) ? 'Password must be at least 8 characters long' : undefined}
                        secureTextEntry={data.newSecureTextEntry}
                        onSubmitEditing={onSavePress}
                    />

                    <HoverableInput
                        placeholder="8 or more characters"
                        label="Confirm new password"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.confirmNewPassword}
                        setText={(text) => setData({ ...data, ['confirmNewPassword']: text.replaceAll(' ', '') })}
                        leftIconName="lock-outline"
                        rightIconName={data.confirmNewSecureTextEntry ? 'eye-off' : 'eye'}
                        onRightIconPress={() => updateSecureTextEntry('confirmNewSecureTextEntry')}
                        errorMessage={showErrorMessage && (!data.confirmNewPassword || data.confirmNewPassword.length < 8) ? 'Password must be at least 8 characters long' : showErrorMessage && data.newPassword !== data.confirmNewPassword ? 'Provided new passwords do not match.' : undefined}
                        secureTextEntry={data.confirmNewSecureTextEntry}
                        onSubmitEditing={onSavePress}
                    />

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                        style={{ marginTop: SPACING.large, borderRadius: 10, width: '100%' }}
                        //style={{ flexShrink: 1, borderRadius: 10 }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onSavePress}
                        loading={isSaving}
                        disabled={isSaving || !data.newPassword || !data.confirmNewPassword}
                    >
                        Change password
                    </Button>
                </Animated.ScrollView>
            </Animated.View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps)(ChangePassword)

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
        justifyContent: 'center',
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
    },
})