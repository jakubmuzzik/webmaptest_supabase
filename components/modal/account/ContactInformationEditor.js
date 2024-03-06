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
import { Ionicons, FontAwesome5, EvilIcons } from '@expo/vector-icons'
import HoverableView from '../../HoverableView'
import HoverableInput from '../../HoverableInput'
import { normalize, areValuesEqual } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../../constants'
import BouncyCheckbox from "react-native-bouncy-checkbox"

import {
    db,
    doc,
    updateDoc,
} from '../../../firebase/config'

import Toast from '../../Toast'

import { Button } from 'react-native-paper'
import { ACTIVE } from '../../../labels'

const window = Dimensions.get('window')

const ContactInformationEditor = ({ visible, setVisible, contactInformation, toastRef, userId, updateRedux, isEstablishment }) => {
    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [changedContactInformation, setChangedContactInformation] = useState(contactInformation)

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setChangedContactInformation(contactInformation)
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

    const onSavePress = async () => {
        if (isSaving) {
            return
        }

        if (
            !changedContactInformation.name
            || !changedContactInformation.phone
        ) {
            setShowErrorMessage(true)
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            let changedData = {...changedContactInformation}

            if (!isEstablishment) {
                delete changedData.website
            }

            await updateDoc(doc(db, 'users', userId), {...changedData, lastModifiedDate: new Date()})

            closeModal()

            toastRef.current.show({
                type: 'success',
                headerText: 'Success!',
                text: 'Contact Information was changed successfully.'
            })

            updateRedux({...changedData, id: userId, lastModifiedDate: new Date()})
        } catch(e) {
            console.error(e)
            modalToastRef.current.show({
                type: 'error',
                //headerText: 'Success!',
                text: "Failed to save the data. Please try again later."
            })
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

    const onNameChange = (value) => {
        setChangedContactInformation(data => ({
            ...data,
            name: value,
            nameLowerCase: value.toLowerCase()
        }))
    }

    const onValueChange = (value, attribute) => {
        setChangedContactInformation(data => ({
            ...data,
            [attribute]: value
        }))
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
                                <Animated.Text style={modalHeaderTextStyles}>Edit Contact Information</Animated.Text>
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
                                Edit Contact Information
                            </Text>

                            <View style={{ marginHorizontal: SPACING.small }}>
                                <HoverableInput
                                    placeholder="Enter your name"
                                    label="Name"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ marginTop: SPACING.xxx_small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedContactInformation.name}
                                    setText={(text) => onNameChange(text)}
                                    leftIconName="badge-account-outline"
                                    errorMessage={showErrorMessage && !changedContactInformation.name ? 'Enter your Name' : undefined}
                                />
                            </View>
                            <View style={{ marginHorizontal: SPACING.small }}>
                                <HoverableInput
                                    placeholder="+420 777 666 777"
                                    label="Phone number"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ marginTop: SPACING.xxx_small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedContactInformation.phone}
                                    setText={(text) => onValueChange(text, 'phone')}
                                    errorMessage={showErrorMessage && !changedContactInformation.phone ? 'Enter your phone' : undefined}
                                />
                            </View>
                            {isEstablishment && <View style={{ marginHorizontal: SPACING.small }}>
                                <HoverableInput
                                    placeholder="www.website.com"
                                    label="Website"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ marginTop: SPACING.xxx_small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedContactInformation.website}
                                    setText={(text) => onValueChange(text, 'website')}
                                />
                            </View>}
                            <View style={{ marginHorizontal: SPACING.small, marginTop: SPACING.x_small}}>
                                <View style={{ flexDirection: 'row' }}>
                                    <BouncyCheckbox
                                        style={{ marginRight: SPACING.xx_small }}
                                        disableBuiltInState
                                        isChecked={changedContactInformation.whatsapp}
                                        size={normalize(19)}
                                        fillColor={changedContactInformation.whatsapp ? 'green' : COLORS.placeholder}
                                        unfillColor="#FFFFFF"
                                        iconStyle={{ borderRadius: 3 }}
                                        innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                        onPress={() => setChangedContactInformation(data => ({ ...data, whatsapp: !data.whatsapp }))}
                                        textComponent={
                                            <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#108a0c', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                                                <FontAwesome5 name="whatsapp" size={18} color="white" />
                                            </View>
                                        }
                                    />
                                    <BouncyCheckbox
                                        style={{ marginRight: SPACING.xx_small }}
                                        disableBuiltInState
                                        isChecked={changedContactInformation.viber}
                                        size={normalize(19)}
                                        fillColor={changedContactInformation.viber ? 'green' : COLORS.placeholder}
                                        unfillColor="#FFFFFF"
                                        iconStyle={{ borderRadius: 3 }}
                                        innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                        onPress={() => setChangedContactInformation(data => ({ ...data, viber: !data.viber }))}
                                        textComponent={
                                            <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#7d3daf', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                                                <FontAwesome5 name="viber" size={18} color="white" />
                                            </View>
                                        }
                                    />
                                    <BouncyCheckbox
                                        disableBuiltInState
                                        isChecked={changedContactInformation.telegram}
                                        size={normalize(19)}
                                        fillColor={changedContactInformation.telegram ? 'green' : COLORS.placeholder}
                                        unfillColor="#FFFFFF"
                                        iconStyle={{ borderRadius: 3 }}
                                        innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                        onPress={() => setChangedContactInformation(data => ({ ...data, telegram: !data.telegram }))}
                                        textComponent={
                                            <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#38a5e4', borderRadius: 30, alignItems: 'center', marginLeft: SPACING.xxx_small, justifyContent: 'center' }}>
                                                <EvilIcons name="sc-telegram" size={22} color="white" />
                                            </View>
                                        }
                                    />
                                </View>
                            </View>
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
                                disabled={isSaving || areValuesEqual(changedContactInformation, contactInformation)}
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

export default memo(ContactInformationEditor)

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