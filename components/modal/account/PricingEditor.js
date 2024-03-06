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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import HoverableView from '../../HoverableView'
import HoverableInput from '../../HoverableInput'
import DropdownSelect from '../../DropdownSelect'
import { normalize, areValuesEqual } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    CURRENCIES,
    CURRENCY_SYMBOLS
} from '../../../constants'

import Toast from '../../Toast'

import { Button, IconButton, HelperText, SegmentedButtons } from 'react-native-paper'

import {
    db,
    doc,
    updateDoc,
} from '../../../firebase/config'

const HOURS = ['0.5 hour', '1 hour', '1.5 hour', '2 hours', '2.5 hour', '3 hours', '3.5 hour', '4 hours', '4.5 hour', '5 hours', '5.5 hour', '6 hours', '6.5 hour', '7 hours', '7.5 hour', '8 hours', '8.5 hour', '9 hours', '9.5 hour', '10 hours', '10.5 hour', '11 hours', '11.5 hour', '12 hours', '12.5 hour', '13 hours', '13.5 hour', '14 hours', '14.5 hour', '15 hours', '15.5 hour', '16 hours', '16.5 hour', '17 hours', '17.5 hour', '18 hours', '18.5 hour', '19 hours', '19.5 hour', '20 hours', '20.5 hour', '21 hours', '21.5 hour', '22 hours', '22.5 hour', '23 hours', '23.5 hour', '24 hours']

const window = Dimensions.get('window')

const PricingEditor = ({ visible, setVisible, pricing, toastRef, userId, updateRedux }) => {

    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMEssage] = useState(false)
    const [changedPricing, setChangedPricing] = useState(pricing)
    const [isChanged, setIsChanged] = useState(false)

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setChangedPricing(pricing)
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])

    const currencyDropdownRef = useRef()
    const pricesDropdownPress = useRef()
    const containerRef = useRef()

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

        setIsSaving(true)

        try {
            await updateDoc(doc(db, 'users', userId), {...changedPricing, lastModifiedDate: new Date()})

            closeModal()

            toastRef.current.show({
                type: 'success',
                headerText: 'Success!',
                text: 'Pricing was changed successfully.'
            })

            updateRedux({...changedPricing, id: userId, lastModifiedDate: new Date()})
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

    const onAddNewPricePress = () => {
        pricesDropdownPress.current?.onDropdownPress()
    }

    const updateIsChanged = (value, attribute) => {
        setIsChanged(!areValuesEqual(value, pricing[attribute]))
    }

    const onAddNewPrice = (val) => {
        const newPricing = (changedPricing.prices.concat({ length: Number(val.substring(0, val.indexOf('h') - 1)), incall: '', outcall: '' }))
            .sort((a, b) => a.length - b.length)

        setChangedPricing(data => ({
            ...data,
            ['prices']: newPricing
        }))
        updateIsChanged(newPricing, 'prices')
    }

    const onPriceDeletePress = (index) => {
        const newPricing = JSON.parse(JSON.stringify(changedPricing.prices))
        newPricing.splice(index, 1)
        
        setChangedPricing(data => ({
            ...data,
            ['prices']: newPricing
        }))
        updateIsChanged(newPricing, 'prices')
    }

    const onPriceChange = (text, index, priceType) => {
        const newPricing = JSON.parse(JSON.stringify(changedPricing.prices))
        newPricing[index][priceType] = text.replace(/[^0-9]/g, '')

        setChangedPricing(data => ({
            ...data,
            ['prices']: newPricing
        }))
        updateIsChanged(newPricing, 'prices')
    }

    const onValueChange = (value, attribute) => {
        setChangedPricing(data => ({
            ...data,
            [attribute]: value
        }))
        updateIsChanged(value, attribute)
    }

    const onServiceTypeChange = (values) => {
        setChangedPricing(data => ({ ...data, ...values }))

        setIsChanged(!areValuesEqual(values.outcall, pricing['outcall']) || !areValuesEqual(values.incall, pricing['incall']))
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
        <Modal ref={containerRef}
            transparent={true}
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
                                <Animated.Text style={modalHeaderTextStyles}>Edit Pricing</Animated.Text>
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
                                Edit Pricing
                            </Text>

                            <View style={{ marginHorizontal: SPACING.small }}>
                                <Text style={{ marginBottom: SPACING.xx_small, color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginRight: SPACING.xx_small }}>
                                    Available for:
                                </Text>

                                <SegmentedButtons
                                    onValueChange={() => null}
                                    theme={{ roundness: 1.5 }}
                                    buttons={[
                                        {
                                            style: { borderColor: COLORS.placeholder, backgroundColor: changedPricing.incall && changedPricing.outcall ? COLORS.red : 'transparent', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                                            value: changedPricing.incall && changedPricing.outcall,
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: changedPricing.incall && changedPricing.outcall ? '#FFF' : '#000' }}>Both</Text>,
                                            onPress: () => onServiceTypeChange({ outcall: true, incall: true }),
                                            rippleColor: "rgba(220, 46, 46, .10)"
                                        },
                                        {
                                            style: { borderColor: COLORS.placeholder, backgroundColor: changedPricing.outcall && !changedPricing.incall ? COLORS.red : 'transparent' },
                                            value: changedPricing.outcall && !changedPricing.incall,
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: changedPricing.outcall && !changedPricing.incall ? '#FFF' : '#000' }}>Outcall</Text>,
                                            checkedColor: '#FFF',
                                            onPress: () => onServiceTypeChange({ outcall: true, incall: false }),
                                            rippleColor: "rgba(220, 46, 46, .10)"
                                        },
                                        {
                                            style: { borderColor: COLORS.placeholder, backgroundColor: changedPricing.incall && !changedPricing.outcall ? COLORS.red : 'transparent', borderTopRightRadius: 10, borderBottomRightRadius: 10 },
                                            value: changedPricing.incall && !changedPricing.outcall,
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: changedPricing.incall && !changedPricing.outcall ? '#FFF' : '#000' }}>Incall</Text>,
                                            checkedColor: '#FFF',
                                            onPress: () => onServiceTypeChange({ incall: true, outcall: false }),
                                            rippleColor: "rgba(220, 46, 46, .10)"
                                        }
                                    ]}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', marginHorizontal: SPACING.small, marginBottom: SPACING.xx_small, marginTop: SPACING.medium, alignItems: 'center' }}>
                                <Text style={{ color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginRight: SPACING.xx_small }}>
                                    Pricing
                                </Text>
                                <DropdownSelect
                                    ref={currencyDropdownRef}
                                    containerRef={containerRef}
                                    text={changedPricing.currency}
                                    values={CURRENCIES}
                                    setText={(text) => onValueChange(text, 'currency')}
                                >
                                    <TouchableOpacity
                                        onPress={() => currencyDropdownRef.current?.onDropdownPress()}
                                        style={{ marginLeft: SPACING.xxx_small, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#000' }}>
                                            {changedPricing.currency}
                                        </Text>
                                        <MaterialCommunityIcons style={{ marginLeft: 4, }} name="chevron-down" size={normalize(20)} color="black" />
                                    </TouchableOpacity>
                                </DropdownSelect>
                            </View>
                            {changedPricing.prices.length === 0 && showErrorMessage &&
                                <HelperText type="error" visible style={{ marginHorizontal: SPACING.small, padding: 0 }}>
                                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.error }}>
                                        Define your pricing
                                    </Text>
                                </HelperText>
                            }

                            {changedPricing.prices.length > 0 && <View style={[styles.table, { marginHorizontal: SPACING.small, marginBottom: SPACING.xx_small }]}>
                                <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                                        <Text style={styles.tableHeaderText}>Length</Text>
                                    </View>
                                    {changedPricing.prices.map(price => (
                                        <View key={price.length} style={styles.column}>
                                            <Text style={styles.tableHeaderValue}>{price.length + ((price['length'].toString()).includes('.') || price['length'] === 1 ? ' hour' : ' hours')}</Text>
                                        </View>
                                    ))}
                                </View>
                                {changedPricing.incall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                                        <Text style={styles.tableHeaderText}>Incall • {CURRENCY_SYMBOLS[changedPricing.currency]}</Text>
                                    </View>
                                    {changedPricing.prices.map((price, index) => (
                                        <View key={price.length} style={{ padding: 4 }}>
                                            <TextInput
                                                style={[styles.column, {
                                                    fontFamily: FONTS.regular,
                                                    fontSize: FONT_SIZES.medium,
                                                    outlineStyle: 'none',
                                                    color: '#000',
                                                    height: styles.column.height - 8,
                                                    borderColor: '#000',
                                                    borderWidth: 1,
                                                    borderRadius: 5
                                                }]}
                                                onChangeText={(text) => onPriceChange(text, index, 'incall')}
                                                value={price.incall}
                                                placeholder='0'
                                                placeholderTextColor="grey"
                                            />
                                        </View>
                                    ))}
                                </View>}
                                {changedPricing.outcall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                                        <Text style={styles.tableHeaderText}>Outcall • {CURRENCY_SYMBOLS[changedPricing.currency]}</Text>
                                    </View>
                                    {changedPricing.prices.map((price, index) => (
                                        <View key={price.length} style={{ padding: 4 }}>
                                            <TextInput
                                                style={[styles.column, {
                                                    fontFamily: FONTS.regular,
                                                    fontSize: FONT_SIZES.medium,
                                                    outlineStyle: 'none',
                                                    color: '#000',
                                                    height: styles.column.height - 8,
                                                    borderColor: '#000',
                                                    borderWidth: 1,
                                                    borderRadius: 5
                                                }]}
                                                onChangeText={(text) => onPriceChange(text, index, 'outcall')}
                                                value={price.outcall}
                                                placeholder='0'
                                                placeholderTextColor="grey"
                                            />
                                        </View>
                                    ))}
                                </View>}
                                <View style={{ flexBasis: 45, flexShrink: 0, flexGrow: 0 }}>
                                    <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>

                                    </View>
                                    {changedPricing.prices.map((price, index) => (
                                        <View key={price.length} style={{ alignItems: 'center', justifyContent: 'center', paddingRight: 4, height: normalize(45) }}>
                                            <IconButton
                                                icon="delete-outline"
                                                iconColor='black'
                                                size={20}
                                                onPress={() => onPriceDeletePress(index)}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>}

                            <View style={{ flexDirection: 'row', marginHorizontal: SPACING.small }}>
                                <DropdownSelect
                                    ref={pricesDropdownPress}
                                    containerRef={containerRef}
                                    values={HOURS.filter(hour => !changedPricing.prices.some(price => price.length === Number(hour.substring(0, hour.indexOf('h') - 1))))}
                                    setText={onAddNewPrice}
                                >
                                    <Button
                                        labelStyle={{ fontSize: normalize(20), color: '#000' }}
                                        //style={{ borderRadius: 10, borderColor: '#000', borderWidth: 2 }}
                                        contentStyle={{ height: 35 }}
                                        rippleColor="rgba(0, 0, 0, .1)"
                                        icon="plus"
                                        mode="outlined"
                                        onPress={onAddNewPricePress}
                                    >
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}>
                                            Add price
                                        </Text>
                                    </Button>
                                </DropdownSelect>
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
                                disabled={isSaving || !isChanged}
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

export default memo(PricingEditor)

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