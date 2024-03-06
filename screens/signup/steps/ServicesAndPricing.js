import React, { memo, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES, CURRENCIES } from '../../../constants'
import HoverableView from '../../../components/HoverableView'
import DropdownSelect from '../../../components/DropdownSelect'
import { normalize } from '../../../utils'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { HelperText, SegmentedButtons, TouchableRipple, Button, IconButton } from 'react-native-paper'

import ServicesPicker from '../../../components/modal/ServicesPicker'

const HOURS = ['0.5 hour', '1 hour', '1.5 hour', '2 hours', '2.5 hour', '3 hours', '3.5 hour', '4 hours', '4.5 hour', '5 hours', '5.5 hour', '6 hours', '6.5 hour', '7 hours', '7.5 hour', '8 hours', '8.5 hour', '9 hours', '9.5 hour', '10 hours', '10.5 hour', '11 hours', '11.5 hour', '12 hours', '12.5 hour', '13 hours', '13.5 hour', '14 hours', '14.5 hour', '15 hours', '15.5 hour', '16 hours', '16.5 hour', '17 hours', '17.5 hour', '18 hours', '18.5 hour', '19 hours', '19.5 hour', '20 hours', '20.5 hour', '21 hours', '21.5 hour', '22 hours', '22.5 hour', '23 hours', '23.5 hour', '24 hours']

const ServicesAndPricing = forwardRef((props, ref) => {
    const { i, contentWidth, offsetX = 0 } = props

    const [data, setData] = useState({
        services: [],
        currency: 'CZK',
        prices: [],
        incall: true,
        outcall: true,
    })
    const [showErrors, setShowErrors] = useState(false)
    const [servicesPickerVisible, setServicesPickerVisible] = useState(false)

    const currencyDropdownRef = useRef()
    const pricesDropdownPress = useRef()

    const validate = async () => {
        if (
            !data.services.length
        ) {
            setShowErrors(true)
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

    const onValueChange = (value, attribute) => {
        setData(data => ({
            ...data,
            [attribute]: value
        }))
    }

    const onMultiPicklistChange = (value, attribute) => {
        setData(data => ({
            ...data,
            [attribute]: data[attribute].includes(value)
                ? data[attribute].filter(s => s !== value)
                : data[attribute].concat(value)
        }))
    }

    const onAddServicePress = () => {
        setServicesPickerVisible(true)
    }

    const onAddNewPricePress = () => {
        pricesDropdownPress.current?.onDropdownPress()
    }

    const onAddNewPrice = (val) => {
        setData(data => ({
            ...data,
            ['prices']: (data.prices.concat({ length: Number(val.substring(0, val.indexOf('h') - 1)), incall: '', outcall: '' }))
                .sort((a, b) => a.length - b.length)
        }))
    }

    const onPriceDeletePress = (index) => {
        setData(d => {
            d.prices.splice(index, 1)
            return { ...d }
        })
    }

    const onPriceChange = (text, index, priceType) => {
        setData(d => {
            d.prices[index][priceType] = text.replace(/[^0-9]/g, '')
            return { ...d }
        })
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
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Services & Pricing`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}>
                <Text style={styles.pageHeaderText}>
                    {`${i + 1}. Services & Pricing`}
                </Text>

                <Text style={{ marginBottom: SPACING.xx_small, marginHorizontal: SPACING.x_large, color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginRight: SPACING.xx_small }}>
                    Available for:
                </Text>

                <SegmentedButtons
                    style={{ marginHorizontal: SPACING.x_large }}
                    onValueChange={() => null}
                    theme={{ roundness: 1.5 }}
                    buttons={[
                        {
                            style: { borderColor: COLORS.placeholder, backgroundColor: data.incall && data.outcall ? COLORS.red : 'transparent', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                            value: data.incall && data.outcall,
                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: data.incall && data.outcall ? '#FFF' : '#000' }}>Both</Text>,
                            onPress: () => setData(data => ({ ...data, outcall: true, incall: true })),
                            rippleColor: "rgba(220, 46, 46, .10)"
                        },
                        {
                            style: { borderColor: COLORS.placeholder, backgroundColor: data.outcall && !data.incall ? COLORS.red : 'transparent' },
                            value: data.outcall && !data.incall,
                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: data.outcall && !data.incall ? '#FFF' : '#000' }}>Outcall</Text>,
                            checkedColor: '#FFF',
                            onPress: () => setData(data => ({ ...data, outcall: true, incall: false })),
                            rippleColor: "rgba(220, 46, 46, .10)"
                        },
                        {
                            style: { borderColor: COLORS.placeholder, backgroundColor: data.incall && !data.outcall ? COLORS.red : 'transparent', borderTopRightRadius: 10, borderBottomRightRadius: 10 },
                            value: data.incall && !data.outcall,
                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: data.incall && !data.outcall ? '#FFF' : '#000' }}>Incall</Text>,
                            checkedColor: '#FFF',
                            onPress: () => setData(data => ({ ...data, incall: true, outcall: false })),
                            rippleColor: "rgba(220, 46, 46, .10)"
                        }
                    ]}
                />

                <Text style={{ color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginHorizontal: SPACING.x_large, marginBottom: SPACING.xx_small, marginTop: SPACING.medium }}>
                    Services <Text style={{ fontSize: FONT_SIZES.medium }}>({data.services.length})</Text>
                </Text>
                {data.services.length === 0 && showErrors && <HelperText type="error" visible style={{ marginHorizontal: SPACING.x_large, padding: 0, marginBottom: SPACING.xx_small }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.error }}>
                        Add your services.
                    </Text>
                </HelperText>}


                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: SPACING.x_large }}>
                    {data.services.map((service) => (
                        <HoverableView key={service} style={{ flexDirection: 'row', overflow: 'hidden', borderRadius: 20, borderWidth: 2, borderColor: COLORS.red, marginRight: SPACING.xxx_small, marginBottom: SPACING.xx_small, }} hoveredBackgroundColor='rgba(220, 46, 46, .10)' /*backgroundColor={COLORS.red}*/>
                            <TouchableRipple
                                onPress={() => onMultiPicklistChange(service, 'services')}
                                style={styles.chip}
                            >
                                <>
                                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, marginRight: SPACING.xx_small, }}>{service}</Text>
                                    <Ionicons onPress={() => onMultiPicklistChange(service, 'services')} name="close" size={normalize(18)} color="black" />
                                </>
                            </TouchableRipple>
                        </HoverableView>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', marginHorizontal: SPACING.x_large }}>
                    <Button
                        labelStyle={{ fontSize: normalize(20), color: '#000' }}
                        //style={{ borderRadius: 10, borderColor: '#000', borderWidth: 2 }}
                        contentStyle={{ height: 35 }}
                        rippleColor="rgba(0, 0, 0, .1)"
                        icon="plus"
                        mode="outlined"
                        onPress={onAddServicePress}
                    >
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}>
                            Add service
                        </Text>
                    </Button>
                </View>

                <View style={{ flexDirection: 'row', marginHorizontal: SPACING.x_large, marginBottom: SPACING.x_small, marginBottom: SPACING.xx_small, marginTop: SPACING.medium, alignItems: 'center' }}>
                    <Text style={{ color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginRight: SPACING.xx_small }}>
                        Pricing
                    </Text>

                    <DropdownSelect
                        ref={currencyDropdownRef}
                        offsetX={offsetX + (contentWidth * i)}
                        text={data.currency}
                        values={CURRENCIES}
                        setText={(text) => onValueChange(text, 'currency')}
                    >
                        <TouchableOpacity
                            onPress={() => currencyDropdownRef.current?.onDropdownPress()}
                            style={{ marginLeft: SPACING.xxx_small, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#000' }}>
                                {data.currency}
                            </Text>
                            <MaterialCommunityIcons style={{ marginLeft: 4, }} name="chevron-down" size={normalize(20)} color="black" />
                        </TouchableOpacity>
                    </DropdownSelect>
                </View>
                {/* {data.prices.length === 0 && showErrors && <HelperText type="error" visible style={{ marginHorizontal: SPACING.x_large, padding: 0 }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.error }}>
                        Define your pricing
                    </Text>
                </HelperText>} */}

                {data.prices.length > 0 && <View style={[styles.table, { marginHorizontal: SPACING.x_large, marginBottom: SPACING.xx_small }]}>
                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                            <Text style={styles.tableHeaderText}>Length</Text>
                        </View>
                        {data.prices.map(price => (
                            <View key={price.length} style={styles.column}>
                                <Text style={styles.tableHeaderValue}>{price.length + ((price['length'].toString()).includes('.') || price['length'] === 1 ? ' hour' : ' hours')}</Text>
                            </View>
                        ))}
                    </View>
                    {data.incall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                            <Text style={styles.tableHeaderText}>Incall</Text>
                        </View>
                        {data.prices.map((price, index) => (
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
                                    keyboardType='numeric'
                                />
                            </View>
                        ))}
                    </View>}
                    {data.outcall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>
                            <Text style={styles.tableHeaderText}>Outcall</Text>
                        </View>
                        {data.prices.map((price, index) => (
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
                                    keyboardType='numeric'
                                />
                            </View>
                        ))}
                    </View>}
                    <View style={{ flexBasis: 45, flexShrink: 0, flexGrow: 0 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.lightGrey }]}>

                        </View>
                        {data.prices.map((price, index) => (
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

                <View style={{ flexDirection: 'row', marginHorizontal: SPACING.x_large }}>
                    <DropdownSelect
                        ref={pricesDropdownPress}
                        offsetX={offsetX + (contentWidth * i)}
                        values={HOURS.filter(hour => !data.prices.some(price => price.length === Number(hour.substring(0, hour.indexOf('h') - 1))))}
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

            <ServicesPicker visible={servicesPickerVisible} setVisible={setServicesPickerVisible} services={data.services} onSelect={(service) => onMultiPicklistChange(service, 'services')} />
        </>
    )
})

export default memo(ServicesAndPricing)

const styles = StyleSheet.create({
    pageHeaderText: {
        //color: '#FFF', 
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginHorizontal: SPACING.x_large,
        marginBottom: SPACING.small
    },
    chip: {
        flexDirection: 'row',
        width: 'fit-content',
        paddingHorizontal: SPACING.xx_small,
        paddingVertical: 5,
        borderRadius: 10,
        // borderColor: 'rgba(255, 255, 255, 0.5)',
        // borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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