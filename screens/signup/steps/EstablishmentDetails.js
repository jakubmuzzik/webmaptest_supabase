import React, { memo, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../../constants'
import HoverableInput from '../../../components/HoverableInput'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import DropdownSelect from '../../../components/DropdownSelect'
import { normalize } from '../../../utils'
import { FontAwesome5, EvilIcons } from '@expo/vector-icons'
import {
    ESTABLISHMENT_TYPES
} from '../../../labels'


const EstablishmentDetails = forwardRef((props, ref) => {
    const { i, contentWidth, offsetX = 0 } = props

    const [data, setData] = useState({
        name: '',
        establishmentType: '',
        website: '',
        phone: '',
        viber: false,
        whatsapp: false,
        telegram: false,
        description: '',
    })
    const [showErrors, setShowErrors] = useState(false)

    const validate = async () => {
        if (
            !data.name
            || !data.establishmentType
            || !data.phone
            || !data.description
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
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Establishment Details`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}>
                <Text style={styles.pageHeaderText}>
                    {`${i + 1}. Establishment Details`}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="Agency xxx"
                        label="Establishment Name"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large, }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.name}
                        setText={(text) => onValueChange(text, 'name')}
                        //leftIconName="badge-account-outline"
                        errorMessage={showErrors && !data.name ? 'Enter your Name' : undefined}
                    />

                    <DropdownSelect
                        values={ESTABLISHMENT_TYPES}
                        offsetX={contentWidth * i}
                        placeholder="Select establishment type"
                        label="Establishment type"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.establishmentType}
                        setText={(text) => onValueChange(text, 'establishmentType')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.establishmentType ? 'Select the establishment type' : undefined}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', marginLeft: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="www.website.com"
                        label="Website"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.website}
                        setText={(text) => onValueChange(text, 'website')}
                    />

                    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}>
                        <HoverableInput
                            placeholder="+420 777 666 777"
                            label="Phone number"
                            borderColor={COLORS.placeholder}
                            hoveredBorderColor={COLORS.red}
                            textColor='#000'

                            textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                            labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                            text={data.phone}
                            setText={(text) => onValueChange(text, 'phone')}
                            errorMessage={showErrors && !data.phone ? 'Enter your phone' : undefined}
                        />

                        <View style={{ flexDirection: 'row', marginTop: SPACING.xx_small }}>
                            <BouncyCheckbox
                                style={{ marginRight: SPACING.xx_small }}
                                disableBuiltInState
                                isChecked={data.whatsapp}
                                size={normalize(19)}
                                fillColor={data.whatsapp ? 'green' : COLORS.placeholder}
                                unfillColor="#FFFFFF"
                                iconStyle={{ borderRadius: 3 }}
                                innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                onPress={() => setData(data => ({ ...data, whatsapp: !data.whatsapp }))}
                                textComponent={
                                    <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#108a0c', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesome5 name="whatsapp" size={18} color="white" />
                                    </View>
                                }
                            />
                            <BouncyCheckbox
                                style={{ marginRight: SPACING.xx_small }}
                                disableBuiltInState
                                isChecked={data.viber}
                                size={normalize(19)}
                                fillColor={data.viber ? 'green' : COLORS.placeholder}
                                unfillColor="#FFFFFF"
                                iconStyle={{ borderRadius: 3 }}
                                innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                onPress={() => setData(data => ({ ...data, viber: !data.viber }))}
                                textComponent={
                                    <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#7d3daf', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesome5 name="viber" size={18} color="white" />
                                    </View>
                                }
                            />
                            <BouncyCheckbox
                                disableBuiltInState
                                isChecked={data.telegram}
                                size={normalize(19)}
                                fillColor={data.telegram ? 'green' : COLORS.placeholder}
                                unfillColor="#FFFFFF"
                                iconStyle={{ borderRadius: 3 }}
                                innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                onPress={() => setData(data => ({ ...data, telegram: !data.telegram }))}
                                textComponent={
                                    <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#38a5e4', borderRadius: 30, alignItems: 'center', marginLeft: SPACING.xxx_small, justifyContent: 'center' }}>
                                        <EvilIcons name="sc-telegram" size={22} color="white" />
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </View>

                <View style={{ marginHorizontal: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="Describe your establishment"
                        multiline
                        numberOfLines={5}
                        maxLength={1000}
                        label="Description"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ marginTop: SPACING.xxx_small }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.description}
                        setText={(text) => onValueChange(text, 'description')}
                        errorMessage={showErrors && !data.description ? 'Desribe yourself' : undefined}
                    />
                </View>
                <View style={{ marginHorizontal: SPACING.x_large, marginTop: 3 }}>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: 'grey' }}>
                        {`${data.description.length}/1000`}
                    </Text>
                </View>
            </Animated.ScrollView>
        </>
    )
})

export default memo(EstablishmentDetails)

const styles = StyleSheet.create({
    pageHeaderText: {
        //color: '#FFF', 
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginHorizontal: SPACING.x_large,
        marginBottom: SPACING.small
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