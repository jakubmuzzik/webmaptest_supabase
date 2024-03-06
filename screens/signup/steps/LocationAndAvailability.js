import React, { memo, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../../constants'
import HoverableInput from '../../../components/HoverableInput'
import { normalize } from '../../../utils'
import { HelperText, Switch } from 'react-native-paper'

import AddressSearch from '../../../components/modal/AddressSearch'

const LocationAndAvailability = forwardRef((props, ref) => {
    const { i, contentWidth } = props

    const [data, setData] = useState({
        workingHours: [{ day: 'monday', from: '', until: '', enabled: true }, { day: 'tuesday', from: '', until: '', enabled: true }, { day: 'wednesday', from: '', until: '', enabled: true }, { day: 'thursday', from: '', until: '', enabled: true }, { day: 'friday', from: '', until: '', enabled: true }, { day: 'saturday', from: '', until: '', enabled: true }, { day: 'sunday', from: '', until: '', enabled: true }],
        address: '',
        hiddenAddress: false
    })
    
    const [showErrors, setShowErrors] = useState(false)
    const [addressSearchVisible, setAddressSearchVisible] = useState(false)

    const validate = async () => {
        let dataValid = true

        if (!data.address) {
            dataValid = false
        }

        const workingHours = JSON.parse(JSON.stringify(data.workingHours))

        workingHours.filter(day => day.enabled).forEach(setup => {
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
            setShowErrors(true)
            setData(data => ({
                ...data,
                workingHours
            }))
            return false
        }

        setShowErrors(false)

        return true
    }

    useImperativeHandle(ref, () => ({
        validate,
        data
    }))

    const scrollY = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const onWorkingHourChange = (value, index, attribute) => {
        setData(d => {
            d.workingHours[index][attribute] = value
            if (attribute === 'enabled' && !value) {
                d.workingHours[index].from = ''
                d.workingHours[index].until = ''
            }
            return { ...d }
        })
    }

    const onSearchAddressPress = () => {
        setAddressSearchVisible(true)
    }

    const onAddressSelect = (value) => {
        const { title, id, address, position } = value
        setData((data) => ({
            ...data,
            address: { title, id, ...address, ...position }
        }))
    }

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
        }
    })

    return (
        <>
            <View style={styles.modal__header}>
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Address & Working Hours`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}>
                <Text style={styles.pageHeaderText}>
                    {`${i + 1}. Address & Working Hours`}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large, alignItems: 'flex-start' }}>
                    <TouchableOpacity
                        onPress={onSearchAddressPress}
                        style={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginRight: SPACING.x_large, marginTop: SPACING.xx_small }}>
                        <HoverableInput
                            pointerEventsDisabled
                            placeholder="Search address"
                            label="Search address"
                            borderColor={COLORS.placeholder}
                            hoveredBorderColor={COLORS.red}
                            textColor='#000'
                            textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                            labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            text={data.address?.title}
                            leftIconName='map-marker-outline'
                            errorMessage={showErrors && !data.address?.title ? 'Enter your address' : undefined}
                        />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xx_small, flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginRight: SPACING.x_large, marginTop: SPACING.xx_small }}>
                        <View style={{ flex: 1, flexDirection: 'column', marginRight: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>
                                Show your specific location
                            </Text>
                            <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2 }}>
                                If not selected, only city will be visible on your profile
                            </Text>
                        </View>
                        <Switch
                            value={!data.hiddenAddress}
                            onValueChange={(value) => setData({
                                ...data,
                                hiddenAddress: !value
                            })} 
                            color={COLORS.red}
                        />
                    </View>
                </View>

                <View style={[styles.table, { marginHorizontal: SPACING.x_large, marginTop: SPACING.small, }]}>
                    <View style={{ flexShrink: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                            <Text style={styles.tableHeaderText}>Day</Text>
                        </View>
                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[0].enabled ? 'none' : 'line-through' }]}>Monday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[0].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 0, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[0].invalidFrom || data.workingHours[0].invalidUntil) && data.workingHours[0].enabled) &&
                            <View style={{ height: data.workingHours[0].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[1].enabled ? 'none' : 'line-through' }]}>Tuesday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[1].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 1, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[1].invalidFrom || data.workingHours[1].invalidUntil) && data.workingHours[1].enabled) &&
                            <View style={{ height: data.workingHours[1].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[2].enabled ? 'none' : 'line-through' }]}>Wednesday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[2].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 2, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[2].invalidFrom || data.workingHours[2].invalidUntil) && data.workingHours[2].enabled) &&
                            <View style={{ height: data.workingHours[2].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[3].enabled ? 'none' : 'line-through' }]}>Thursday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[3].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 3, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[3].invalidFrom || data.workingHours[3].invalidUntil) && data.workingHours[3].enabled) &&
                            <View style={{ height: data.workingHours[3].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[4].enabled ? 'none' : 'line-through' }]}>Friday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[4].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 4, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[4].invalidFrom || data.workingHours[4].invalidUntil) && data.workingHours[4].enabled) &&
                            <View style={{ height: data.workingHours[4].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[5].enabled ? 'none' : 'line-through' }]}>Saturday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[5].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 5, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[5].invalidFrom || data.workingHours[5].invalidUntil) && data.workingHours[5].enabled) &&
                            <View style={{ height: data.workingHours[5].errorHeight }} />
                        }

                        <View style={[styles.column, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                            <Text numberOfLines={1} style={[styles.tableHeaderValue, { textDecorationLine: data.workingHours[6].enabled ? 'none' : 'line-through' }]}>Sunday</Text>
                            <Switch
                                style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }], marginLeft: SPACING.xxx_small }}
                                value={data.workingHours[6].enabled}
                                onValueChange={(value) => onWorkingHourChange(value, 6, 'enabled')}
                                color={COLORS.red}
                            />
                        </View>
                        {((data.workingHours[6].invalidFrom || data.workingHours[6].invalidUntil) && data.workingHours[6].enabled) &&
                            <View style={{ height: data.workingHours[6].errorHeight }} />
                        }
                    </View>

                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                            <Text style={styles.tableHeaderText}>From</Text>
                        </View>
                        {data.workingHours.map((value, index) => (
                            <View key={value.day} style={{ padding: 4, opacity: data.workingHours[index].enabled ? 1 : 0.3 }}>
                                <TextInput
                                    style={[styles.column, {
                                        fontFamily: FONTS.regular,
                                        fontSize: FONT_SIZES.medium,
                                        outlineStyle: 'none',
                                        color: '#000',
                                        height: styles.column.height - 8,
                                        borderColor: data.workingHours[index].invalidFrom && data.workingHours[index].enabled ? COLORS.error : '#000',
                                        borderWidth: 1,
                                        borderRadius: 5
                                    }]}
                                    editable={data.workingHours[index].enabled}
                                    onChangeText={(text) => onWorkingHourChange(text.replaceAll(' ', '').replace(/[^\d:]/g, ''), index, 'from')}
                                    value={data.workingHours[index].from}
                                    placeholder='HH:mm'
                                    placeholderTextColor="grey"
                                    maxLength={5}
                                />
                                {((data.workingHours[index].invalidFrom || data.workingHours[index].invalidUntil) && data.workingHours[index].enabled) &&
                                    <HelperText onLayout={(event) => onWorkingHourChange(event.nativeEvent.layout.height, index, 'errorHeight')} type="error" visible>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error, opacity: data.workingHours[index].invalidFrom ? 1 : 0 }}>
                                            {data.workingHours[index].invalidFrom || data.workingHours[index].invalidUntil}
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
                        {data.workingHours.map((value, index) => (
                            <View key={value.day} style={{ padding: 4, opacity: data.workingHours[index].enabled ? 1 : 0.3 }}>
                                <TextInput
                                    style={[styles.column, {
                                        fontFamily: FONTS.regular,
                                        fontSize: FONT_SIZES.medium,
                                        outlineStyle: 'none',
                                        color: '#000',
                                        height: styles.column.height - 8,
                                        borderColor: data.workingHours[index].invalidUntil && data.workingHours[index].enabled ? COLORS.error : '#000',
                                        borderWidth: 1,
                                        borderRadius: 5
                                    }]}
                                    editable={data.workingHours[index].enabled}
                                    onChangeText={(text) => onWorkingHourChange(text.replaceAll(' ', '').replace(/[^\d:]/g, ''), index, 'until')}
                                    value={data.workingHours[index].until}
                                    placeholder='HH:mm'
                                    placeholderTextColor="grey"
                                    maxLength={5}
                                />
                                {((data.workingHours[index].invalidFrom || data.workingHours[index].invalidUntil) && data.workingHours[index].enabled) &&
                                    <HelperText onLayout={(event) => onWorkingHourChange(event.nativeEvent.layout.height, index, 'errorHeight')} type="error" visible>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error, opacity: data.workingHours[index].invalidUntil ? 1 : 0 }}>
                                            {data.workingHours[index].invalidFrom || data.workingHours[index].invalidUntil}
                                        </Text>
                                    </HelperText>
                                }
                            </View>
                        ))}
                    </View>
                </View>
            </Animated.ScrollView>

            <AddressSearch visible={addressSearchVisible} setVisible={setAddressSearchVisible} onSelect={onAddressSelect} />
        </>
    )
})

export default memo(LocationAndAvailability)

const styles = StyleSheet.create({
    pageHeaderText: {
        //color: '#FFF', 
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginHorizontal: SPACING.x_large,
        marginBottom: SPACING.small
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