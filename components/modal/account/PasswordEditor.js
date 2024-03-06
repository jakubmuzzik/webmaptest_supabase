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
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from '../../../firebase/config'
import Toast from '../../Toast'

import { Button } from 'react-native-paper'

const window = Dimensions.get('window')

const PasswordEditor = ({ visible, setVisible, toastRef }) => {

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
        }
    })

    const closeModal = () => {
        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
    }

    const reauthenticate = async () => {
        const cred = EmailAuthProvider.credential(getAuth().currentUser.email, data.currentPassword)
        return reauthenticateWithCredential(getAuth().currentUser, cred)
    }

    const onSavePress = async () => {
        if (!data.newPassword || !data.currentPassword || data.newPassword !== data.confirmNewPassword) {
            setShowErrorMessage(true)
            return
        }

        if (isSaving) {
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            await reauthenticate()
        } catch(e) {
            console.error(e)
            modalToastRef.current.show({
                type: 'error',
                text: 'Invalid password.'
            })
            setIsSaving(false)
            return
        }

        try {
            await updatePassword(getAuth().currentUser, data.newPassword)
            
            toastRef.current.show({
                type: 'success',
                text: 'Your password has been successfully changed.'
            })

            closeModal()
        } catch(e) {
            if (e.code?.includes('auth')) {
                modalToastRef.current.show({
                    type: 'error',
                    text: 'Invalid password.'
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
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.small, marginHorizontal: SPACING.small }}>
                                Change password
                            </Text>

                            <HoverableInput
                                placeholder="Enter your password"
                                label="Current password"
                                borderColor={COLORS.placeholder}
                                hoveredBorderColor={COLORS.red}
                                textColor='#000'
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
                                textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                text={data.currentPassword}
                                setText={(text) => setData({ ...data, ['currentPassword']: text.replaceAll(' ', '') })}
                                leftIconName='lock-outline'
                                rightIconName={data.currentSecureTextEntry ? 'eye-off' : 'eye'}
                                onRightIconPress={() => updateSecureTextEntry('currentSecureTextEntry')}
                                errorMessage={showErrorMessage && !data.currentPassword ? 'Enter your password' : undefined}
                                secureTextEntry={data.currentSecureTextEntry}
                                onSubmitEditing={onSavePress}
                            />

                            <HoverableInput
                                placeholder="8 or more characters"
                                label="New password"
                                borderColor={COLORS.placeholder}
                                hoveredBorderColor={COLORS.red}
                                textColor='#000'
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
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
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
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
                        </Animated.ScrollView>

                        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.placeholder, paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.lightBlack }}
                                style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                                buttonColor="#FFF"
                                mode="outlined"
                                rippleColor='rgba(0,0,0,.1)'
                                onPress={closeModal}
                            >
                                Cancel
                            </Button>

                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.lightBlack}
                                mode="contained"
                                onPress={onSavePress}
                                loading={isSaving}
                                disabled={isSaving || !data.currentPassword || !data.newPassword}
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