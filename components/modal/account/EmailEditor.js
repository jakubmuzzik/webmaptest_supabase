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

import { Button } from 'react-native-paper'

import Toast from '../../Toast'

import { supabase } from '../../../supabase/config'

import * as Linking from 'expo-linking'

const window = Dimensions.get('window')

const EmailEditor = ({ visible, setVisible, toastRef, currentEmail }) => {

    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [data, setData] = useState({
        newEmail: '',
        confirmNewEmail: '',
        secureTextEntry: true
    })

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setData({
                newEmail: '',
                confirmNewEmail: '',
                secureTextEntry: true
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
        if (!data.newEmail || !data.confirmNewEmail) {
            setShowErrorMessage(true)
            return
        }

        if (isSaving) {
            return
        }

        if (data.newEmail === currentEmail) {
            modalToastRef.current.show({
                type: 'error',
                headerText: 'Email already in use',
                text: 'A user with this email address has already been registered.'
            })
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            const emailRedirectTo = Linking.createURL("/account/settings")

            const { error } = await supabase.auth.updateUser({
                email: data.newEmail,
                options: { emailRedirectTo }
            })

            if (error) {
                throw error
            }

            toastRef.current.show({
                type: 'success',
                text: 'Confirmation link was sent to the provided email address.'
            })
            closeModal()
        } catch(e) {
            if (e.message === 'A user with this email address has already been registered') {
                modalToastRef.current.show({
                    type: 'error',
                    text: e.message
                })
            } else if (e.message.includes('Unable to validate email address')) {
                modalToastRef.current.show({
                    type: 'error',
                    text: 'Provided Email address is invalid.'
                })
            } else {
                modalToastRef.current.show({
                    type: 'error',
                    text: 'Email could not be changed. Please log out and try it again later.'
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
                                <Animated.Text style={modalHeaderTextStyles}>Change email</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground} backgroundColor={'#372b2b'}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="white" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.small, marginHorizontal: SPACING.small }}>
                                Change email
                            </Text>

                            <HoverableInput
                                placeholder="Enter new email"
                                label="New email"
                                borderColor={COLORS.placeholder}
                                hoveredBorderColor={COLORS.red}
                                textColor='#000'
                                textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                containerStyle={{ marginHorizontal: SPACING.small }}
                                text={data.newEmail}
                                setText={(text) => setData({ ...data, ['newEmail']: text })}
                                leftIconName="email-outline"
                                errorMessage={showErrorMessage && !data.newEmail ? 'Enter your email' : undefined}
                                onSubmitEditing={onSavePress}
                            />

                            <HoverableInput
                                placeholder="Confirm new email"
                                label="Confirm new email"
                                borderColor={COLORS.placeholder}
                                hoveredBorderColor={COLORS.red}
                                textColor='#000'
                                textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                containerStyle={{ marginHorizontal: SPACING.small }}
                                text={data.confirmNewEmail}
                                setText={(text) => setData({ ...data, ['confirmNewEmail']: text })}
                                leftIconName="email-outline"
                                errorMessage={showErrorMessage && !data.confirmNewEmail ? 'Confirm your new email' : undefined}
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
                                disabled={isSaving || !data.confirmNewEmail || !data.newEmail || data.newEmail !== data.confirmNewEmail}
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

export default memo(EmailEditor)

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