import React, { useMemo, useState, useCallback, useRef, useEffect, memo } from 'react'
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text, TextInput, Image, StyleSheet, Dimensions } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import HoverableView from '../../HoverableView'
import HoverableInput from '../../HoverableInput'
import { normalize } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../../constants'
import Toast from '../../Toast'

import { Button } from 'react-native-paper'

import { supabase } from '../../../supabase/config'
import { useLocation, useNavigate } from 'react-router-dom'

const window = Dimensions.get('window')

const PasswordEditor = ({ visible, setVisible, toastRef }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [data, setData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        currentSecureTextEntry: true,
        newSecureTextEntry: true,
        confirmNewSecureTextEntry: true
    })

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
                currentSecureTextEntry: true,
                newSecureTextEntry: true,
                confirmNewSecureTextEntry: true
            })
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])


    const scrollY = useSharedValue(0)
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const translateY = useSharedValue(window.height)

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            color: COLORS.white,
            backgroundColor: COLORS.grey
        }
    })

    const closeModal = () => {
        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
    }

    const onSavePress = async () => {
        if (!data.newPassword || data.newPassword !== data.confirmNewPassword || data.newPassword.length < 8 || (!data.currentPassword && !new URLSearchParams(location.search).get('change_password'))) {
            setShowErrorMessage(true)
            return
        }

        if (isSaving) {
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            if (!new URLSearchParams(location.search).get('change_password')) {
                const { error: updatePasswordError, data: updatePasswordData } = await supabase.functions.invoke('secure_update_password', {
                    body: {
                        oldPassword: data.currentPassword,
                        newPassword: data.newPassword
                    }
                })

                if (updatePasswordData?.error === 'Invalid old password') {
                    modalToastRef.current.show({
                        type: 'error',
                        text: 'Invalid old password'
                    })
                    return
                }

                if (updatePasswordError) {
                    throw updatePasswordError
                }
            } else {
                const { error: clientUpdateError } = await supabase.auth.updateUser({ password: data.newPassword })

                if (clientUpdateError) {
                    throw clientUpdateError
                }
            }
            
            toastRef.show({
                type: 'success',
                text: 'Your password has been successfully changed.'
            })

            closeModal()

            navigate('/account/settings', {
                replace: true
            })
        } catch (e) {
            if (e.message?.includes('New password should be different from the old password')) {
                modalToastRef.current.show({
                    type: 'error',
                    text: e.message
                })
            } else {
                modalToastRef.current.show({
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

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: COLORS.grey,
            borderRadius: 24,
            width: normalize(500),
            maxWidth: '90%',
            height: normalize(500),
            maxHeight: '80%',
            overflow: 'hidden',
            transform: [{ translateY: translateY.value }]
        }
    })

    const updateSecureTextEntry = (attribute) => {
        setData((d) => ({ ...d, [attribute]: !d[attribute] }))
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
                        <View style={styles.modal__header}>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}></View>
                            <View style={{ flexShrink: 1, flexGrow: 0 }}>
                                <Animated.Text style={modalHeaderTextStyles}>Change password</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground} backgroundColor={'#372b2b'}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="white" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.small, marginHorizontal: SPACING.small }}>
                                Change password
                            </Text>

                            {!new URLSearchParams(location.search).get('change_password') && <HoverableInput
                                placeholder="Enter your current password"
                                label="Current password"
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
                                text={data.currentPassword}
                                setText={(text) => setData({ ...data, ['currentPassword']: text.replaceAll(' ', '') })}
                                leftIconName='lock-outline'
                                rightIconName={data.currentSecureTextEntry ? 'eye-off' : 'eye'}
                                onRightIconPress={() => updateSecureTextEntry('currentSecureTextEntry')}
                                errorMessage={showErrorMessage && !data.currentPassword ? 'Enter your current password' : undefined}
                                secureTextEntry={data.currentSecureTextEntry}
                                onSubmitEditing={onSavePress}
                            />}

                            <HoverableInput
                                placeholder="8 or more characters"
                                label="New password"
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
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
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
                                text={data.confirmNewPassword}
                                setText={(text) => setData({ ...data, ['confirmNewPassword']: text.replaceAll(' ', '') })}
                                leftIconName="lock-outline"
                                rightIconName={data.confirmNewSecureTextEntry ? 'eye-off' : 'eye'}
                                onRightIconPress={() => updateSecureTextEntry('confirmNewSecureTextEntry')}
                                errorMessage={showErrorMessage && (!data.confirmNewPassword || data.confirmNewPassword.length < 8) ? 'Password must be at least 8 characters long' : showErrorMessage && data.newPassword !== data.confirmNewPassword ? 'Provided new passwords do not match.' : undefined}
                                secureTextEntry={data.confirmNewSecureTextEntry}
                                onSubmitEditing={onSavePress}
                            />
                        </Animated.ScrollView>

                        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.placeholder, paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.white }}
                                style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                                buttonColor={COLORS.grey}
                                mode="outlined"
                                rippleColor='rgba(0,0,0,.1)'
                                onPress={closeModal}
                            >
                                Cancel
                            </Button>

                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.red}
                                mode="contained"
                                onPress={onSavePress}
                                loading={isSaving}
                                disabled={isSaving || !data.newPassword}
                                theme={{ colors: { surfaceDisabled: COLORS.hoveredLightGrey }}}
                            >
                                Save
                            </Button>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>

            <Toast ref={modalToastRef}/>
        </Modal>
    )
}

export default memo(PasswordEditor)

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
    },
})