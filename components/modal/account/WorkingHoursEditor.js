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
import { normalize, areValuesEqual } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../../constants'

import {
    db,
    doc,
    updateDoc,
} from '../../../firebase/config'

import Toast from '../../Toast'

import { Button, Switch, HelperText } from 'react-native-paper'

const window = Dimensions.get('window')

const WorkingHoursEditor = ({ visible, setVisible, workingHours, toastRef, userId, updateRedux }) => {
    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [changedWorkingHours, setChangedWorkingHours] = useState(workingHours)
    const [isChanged, setIsChanged] = useState(false)

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setChangedWorkingHours(workingHours)
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
        setIsChanged(false)
    }

    const onSavePress = async () => {
        if (isSaving) {
            return
        }

        let dataValid = true

        let wh = JSON.parse(JSON.stringify(changedWorkingHours))

        wh.filter(day => day.enabled).forEach(setup => {
            if (!setup.from) {
                setup.invalidFrom = 'Enter value in HH:mm format.'
            } else {
                setup.invalidFrom = false
            }

            if (!setup.until) {
                setup.invalidUntil = 'Enter value in HH:mm format.'
            } else {
                setup.invalidUntil = false
            }

            if (setup.invalidFrom || setup.invalidUntil) {
                dataValid = false
                return
            }

            try {
                let hours = parseInt(setup.from.split(':')[0], 10)
                let minutes = parseInt(setup.from.split(':')[1], 10)

                if (hours >= 0 && hours <= 24 && minutes >= 0 && minutes <= 59) {
                    setup.invalidFrom = false
                } else {
                    setup.invalidFrom = 'Hours must be between 0 and 24, and minutes between 0 and 59.'
                }

                hours = parseInt(setup.until.split(':')[0], 10)
                minutes = parseInt(setup.until.split(':')[1], 10)

                if (hours >= 0 && hours <= 24 && minutes >= 0 && minutes <= 59) {
                    setup.invalidUntil = false
                } else {
                    setup.invalidUntil = 'Hours must be between 0 and 24, and minutes between 0 and 59.'
                }
            } catch (e) {
                console.error(e)
                dataValid = false
            }

            if (setup.invalidFrom || setup.invalidUntil) {
                dataValid = false
            }
        })

        if (!dataValid) {
            setShowErrorMessage(true)
            setChangedWorkingHours(wh)
            return
        }

        wh = wh.map(workingHour => {
            delete workingHour.invalidFrom
            delete workingHour.invalidUntil

            return workingHour
        })

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            await updateDoc(doc(db, 'users', userId), {workingHours: wh, lastModifiedDate: new Date()})

            closeModal()

            toastRef.current.show({
                type: 'success',
                headerText: 'Success!',
                text: 'Working Hours were changed successfully.'
            })

            updateRedux({workingHours: wh, id: userId, lastModifiedDate: new Date()})
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

    const onWorkingHourChange = (value, index, attribute) => {
        setChangedWorkingHours(d => {
            let data = JSON.parse(JSON.stringify(d))
            data[index][attribute] = value
            if (attribute === 'enabled' && !value) {
                data[index].from = ''
                data[index].until = ''
            }

            setIsChanged(!areValuesEqual(data, workingHours))
            return data
        })
    }

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: '#FFF',
            borderRadius: 24,
            width: normalize(800),
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
                                <Animated.Text style={modalHeaderTextStyles}>Edit Working Hours</Animated.Text>
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
                                Edit Working Hours
                            </Text>

                            <View style={[styles.table, { marginHorizontal: SPACING.small }]}>
                                <View style={{ flexShrink: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                                        <Text style={styles.tableHeaderText}>Day</Text>
                                    </View>
                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[0].enabled ? 'none' : 'line-through' }]}>Monday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[0].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 0, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[0].invalidFrom || changedWorkingHours[0].invalidUntil) && changedWorkingHours[0].enabled) &&
                                        <View style={{ height: changedWorkingHours[0].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[1].enabled ? 'none' : 'line-through' }]}>Tuesday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[1].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 1, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[1].invalidFrom || changedWorkingHours[1].invalidUntil) && changedWorkingHours[1].enabled) &&
                                        <View style={{ height: changedWorkingHours[1].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[2].enabled ? 'none' : 'line-through' }]}>Wednesday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[2].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 2, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[2].invalidFrom || changedWorkingHours[2].invalidUntil) && changedWorkingHours[2].enabled) &&
                                        <View style={{ height: changedWorkingHours[2].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[3].enabled ? 'none' : 'line-through' }]}>Thursday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[3].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 3, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[3].invalidFrom || changedWorkingHours[3].invalidUntil) && changedWorkingHours[3].enabled) &&
                                        <View style={{ height: changedWorkingHours[3].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[4].enabled ? 'none' : 'line-through' }]}>Friday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[4].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 4, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[4].invalidFrom || changedWorkingHours[4].invalidUntil) && changedWorkingHours[4].enabled) &&
                                        <View style={{ height: changedWorkingHours[4].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[5].enabled ? 'none' : 'line-through' }]}>Saturday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[5].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 5, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[5].invalidFrom || changedWorkingHours[5].invalidUntil) && changedWorkingHours[5].enabled) &&
                                        <View style={{ height: changedWorkingHours[5].errorHeight }} />
                                    }

                                    <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                                        <Text style={[styles.tableHeaderValue, { textDecorationLine: changedWorkingHours[6].enabled ? 'none' : 'line-through' }]}>Sunday</Text>
                                        <Switch
                                            style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                            value={changedWorkingHours[6].enabled}
                                            onValueChange={(value) => onWorkingHourChange(value, 6, 'enabled')}
                                            color={COLORS.red}
                                        />
                                    </View>
                                    {((changedWorkingHours[6].invalidFrom || changedWorkingHours[6].invalidUntil) && changedWorkingHours[6].enabled) &&
                                        <View style={{ height: changedWorkingHours[6].errorHeight }} />
                                    }
                                </View>

                                <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                                        <Text style={styles.tableHeaderText}>From</Text>
                                    </View>
                                    {changedWorkingHours.map((value, index) => (
                                        <View key={value.day} style={{ padding: 4, opacity: changedWorkingHours[index].enabled ? 1 : 0.3 }}>
                                            <TextInput
                                                style={[styles.column, {
                                                    fontFamily: FONTS.regular,
                                                    fontSize: FONT_SIZES.medium,
                                                    outlineStyle: 'none',
                                                    color: '#000',
                                                    height: styles.column.height - 8,
                                                    borderColor: changedWorkingHours[index].invalidFrom && changedWorkingHours[index].enabled ? COLORS.error : '#000',
                                                    borderWidth: 1,
                                                    borderRadius: 5
                                                }]}
                                                editable={changedWorkingHours[index].enabled}
                                                onChangeText={(text) => onWorkingHourChange(text.replaceAll(' ', '').replace(/[^\d:]/g, ''), index, 'from')}
                                                value={changedWorkingHours[index].from}
                                                placeholder='HH:mm'
                                                placeholderTextColor="grey"
                                                maxLength={5}
                                            />
                                            {((changedWorkingHours[index].invalidFrom || changedWorkingHours[index].invalidUntil) && changedWorkingHours[index].enabled) &&
                                                <HelperText onLayout={(event) => onWorkingHourChange(event.nativeEvent.layout.height, index, 'errorHeight')} type="error" visible>
                                                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error, opacity: changedWorkingHours[index].invalidFrom ? 1 : 0 }}>
                                                        {changedWorkingHours[index].invalidFrom || changedWorkingHours[index].invalidUntil}
                                                    </Text>
                                                </HelperText>
                                            }
                                        </View>
                                    ))}
                                </View>

                                <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey, flexShrink: 0 }]}>
                                        <Text style={styles.tableHeaderText}>Until</Text>
                                    </View>
                                    {changedWorkingHours.map((value, index) => (
                                        <View key={value.day} style={{ padding: 4, opacity: changedWorkingHours[index].enabled ? 1 : 0.3 }}>
                                            <TextInput
                                                style={[styles.column, {
                                                    fontFamily: FONTS.regular,
                                                    fontSize: FONT_SIZES.medium,
                                                    outlineStyle: 'none',
                                                    color: '#000',
                                                    height: styles.column.height - 8,
                                                    borderColor: changedWorkingHours[index].invalidUntil && changedWorkingHours[index].enabled ? COLORS.error : '#000',
                                                    borderWidth: 1,
                                                    borderRadius: 5
                                                }]}
                                                editable={changedWorkingHours[index].enabled}
                                                onChangeText={(text) => onWorkingHourChange(text.replaceAll(' ', '').replace(/[^\d:]/g, ''), index, 'until')}
                                                value={changedWorkingHours[index].until}
                                                placeholder='HH:mm'
                                                placeholderTextColor="grey"
                                                maxLength={5}
                                            />
                                            {((changedWorkingHours[index].invalidFrom || changedWorkingHours[index].invalidUntil) && changedWorkingHours[index].enabled) &&
                                                <HelperText onLayout={(event) => onWorkingHourChange(event.nativeEvent.layout.height, index, 'errorHeight')} type="error" visible>
                                                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error, opacity: changedWorkingHours[index].invalidUntil ? 1 : 0 }}>
                                                        {changedWorkingHours[index].invalidFrom || changedWorkingHours[index].invalidUntil}
                                                    </Text>
                                                </HelperText>
                                            }
                                        </View>
                                    ))}
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
                                disabled={isSaving || !isChanged || changedWorkingHours.some(w => w.enabled && (!w.from || !w.until))}
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

export default memo(WorkingHoursEditor)

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
    table: {
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden'
    },
    tableHeaderText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium,
        color: '#FFF'
    },
    tableHeaderValue: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium,
        color: '#000'
    },
    column: {
        paddingHorizontal: SPACING.xx_small,
        height: normalize(45),
        justifyContent: 'center'
    },
})