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
import { Ionicons } from '@expo/vector-icons'
import HoverableView from '../../HoverableView'
import HoverableInput from '../../HoverableInput'
import { normalize } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING
} from '../../../constants'

import { 
    getAuth, 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    writeBatch,
    db,
    getDocs,
    query,
    collection,
    where,
    deleteUser,
    doc,
    updateDoc
} from '../../../firebase/config'

import { Button } from 'react-native-paper'

import Toast from '../../Toast'

import BouncyCheckbox from "react-native-bouncy-checkbox"
import { DELETED } from '../../../labels'

import OverlaySpinner from '../OverlaySpinner'

const window = Dimensions.get('window')

const DeleteAccount = ({ visible, setVisible, toastRef, isEstablishment, logOut }) => {

    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [data, setData] = useState({
        password: '',
        secureTextEntry: true,
        confirmDelete: false
    })

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setData({
                password: '',
                secureTextEntry: true,
                confirmDelete: false
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
        const cred = EmailAuthProvider.credential(getAuth().currentUser.email, data.password)
        return reauthenticateWithCredential(getAuth().currentUser, cred)
    }

    const onDeletePress = async () => {
        if (isSaving) {
            return
        }

        setIsSaving(true)

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

            if (isEstablishment) {
                await deleteEstablishmentData()
            } else {
                await updateDoc(doc(db, 'users', getAuth().currentUser.uid), { status: DELETED })
            }

            await deleteUser(getAuth().currentUser)
            logOut()
            toastRef.current.show({
                type: 'success',
                text: 'Your account was successfully deleted.'
            })
        } catch(e) {
            modalToastRef.current.show({
                type: 'error',
                headerText: 'Delete error',
                text: 'Account could not be deleted. Please try again later.'
            })
            console.error(e)
        } finally {
            setIsSaving(false)
        }

    }

    const deleteEstablishmentData = async () => {
        const snapshot = await getDocs(query(collection(db, "users"), where('establishmentId', '==', getAuth().currentUser.uid), where('status', '!=', DELETED)))

        if (snapshot.empty) {
            return
        }

        const batches = []
        let ids = snapshot.docs.map(doc => doc.id)

        while (ids.length) {
            let batch = writeBatch(db)
            ids.splice(0, 500).forEach(id => {
                batch.update(doc(db, 'users', id), { status: DELETED })
            })

            batches.push(batch)
        }

        await Promise.all([
            ...batches.map((batch) => batch.commit()),
            updateDoc(doc(db, 'users', getAuth().currentUser.uid), { status: DELETED })
        ])
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

    const updateBoolean = (attribute) => {
        setData((data) => ({
            ...data,
            [attribute]: !data[attribute]
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
                                <Animated.Text style={modalHeaderTextStyles}>Delete account</Animated.Text>
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
                                Delete account
                            </Text>

                            <HoverableInput
                                containerStyle={{ marginTop: SPACING.xxx_small, marginHorizontal: SPACING.small }}
                                placeholder="Enter your password"
                                label="Confirm your password"
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
                                onRightIconPress={() => updateBoolean('secureTextEntry')}
                                secureTextEntry={data.secureTextEntry}
                                errorMessage={showErrorMessage && !data.password ? 'Enter your Password' : undefined}
                            />

                            <BouncyCheckbox
                                style={{ paddingTop: SPACING.small, marginHorizontal: SPACING.small }}
                                disableBuiltInState
                                isChecked={data.confirmDelete}
                                size={normalize(21)}
                                fillColor={COLORS.red}
                                unfillColor="#FFFFFF"
                                text="Yes, I want to permanently delete this account and all it's data."
                                iconStyle={{ borderRadius: 3 }}
                                innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none"}}
                                textContainerStyle={{ flexShrink: 1 }}
                                onPress={() => updateBoolean('confirmDelete')}
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
                                buttonColor={COLORS.red}
                                mode="contained"
                                onPress={onDeletePress}
                                loading={isSaving}
                                disabled={isSaving || !data.password || !data.confirmDelete}
                            >
                                Delete
                            </Button>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>

            {isSaving && <OverlaySpinner />}

            <Toast ref={modalToastRef}/>
        </Modal>
    )
}

export default memo(DeleteAccount)

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