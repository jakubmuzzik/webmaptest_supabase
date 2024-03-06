import React, { useState, memo, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Modal, Text } from 'react-native'
import {isBrowser } from 'react-device-detect'
import Toast from '../Toast'
import { BlurView } from 'expo-blur'
import { MotiView } from 'moti'
import { normalize } from '../../utils'
import { FONTS, FONT_SIZES, COLORS, SPACING } from '../../constants'
import HoverableView from '../HoverableView'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

const ConfirmationModal = ({ 
    visible,
    icon, 
    headerText, 
    text, 
    confirmButtonColor=COLORS.red,
    confirmButtonTextColor=COLORS.white,
    onCancel, 
    onConfirm,
    cancelLabel='Cancel',
    confirmLabel='Delete',
    width=normalize(500),
    errorText='There was an error.',
    headerErrorText='Error'
}) => {
    const [working, setWorking] = useState(false)

    const modalToastRef = useRef()

    const closeModal = () => {
        onCancel()
        setWorking(false)
    }

    const onConfirmPress = async () => {
        if (working) {
            return
        }

        setWorking(true)

        try {
            await onConfirm()
            closeModal()
        } catch(error) {
            modalToastRef.current.show({
                type: 'error',
                text: errorText,
                headerText: headerErrorText
            })
            setWorking(false)
        }
    }

    const Content = () => (
        <>
            <View style={styles.modal__header}>
                <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}></View>
                <View style={{ flexShrink: 1, flexGrow: 0 }}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, textAlign: 'center' }}>{headerText}</Text>
                </View>
                <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                    <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                        <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                    </HoverableView>
                </View>
            </View>

            <View style={{ paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, alignItems: 'center', flex: 1 }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textAlign: 'center' }}>
                    {text}
                </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: COLORS.placeholder, paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.lightBlack }}
                    style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                    buttonColor="#FFF"
                    mode="outlined"
                    rippleColor='rgba(0,0,0,.1)'
                    onPress={closeModal}
                >
                    {cancelLabel}
                </Button>

                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: confirmButtonTextColor }}
                    style={{ flexShrink: 1, borderRadius: 10 }}
                    buttonColor={confirmButtonColor}
                    mode="contained"
                    onPress={onConfirmPress}
                    icon={icon}
                    loading={working}
                    disabled={working}
                >
                    {confirmLabel}
                </Button>
            </View>
        </>
    )

    return (
        <Modal transparent visible={visible} animationType='none'>
            <BlurView intensity={20} style={{ flex: 1 }}>
                <TouchableOpacity
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', cursor: 'default' }}
                    activeOpacity={1}
                    onPressOut={closeModal}
                >
                    <MotiView
                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', width: '100%' }}
                        from={{
                            opacity: 0,
                            //translateY: -100,
                            //transform: [{ scale: 0.7 }],
                        }}
                        animate={{
                            opacity: 1,
                            //translateY: 0,
                            //transform: [{ scale: 1 }],
                        }}
                        transition={{
                            type: 'timing',
                            duration: 150,
                        }}
                    >
                        <TouchableWithoutFeedback>
                            <View style={{
                                backgroundColor: COLORS.white,
                                borderRadius: 24,
                                width,
                                maxWidth: '90%',
                                maxHeight: '80%',
                                overflow: 'hidden',
                            }}>
                                <Content />
                            </View>
                        </TouchableWithoutFeedback>
                    </MotiView>
                </TouchableOpacity>
            </BlurView>

            <Toast ref={modalToastRef} />
        </Modal>
    )
}

export default ConfirmationModal

const styles = StyleSheet.create({
    modal__header: {
        height: normalize(55),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})