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
    LANGUAGES,
    NATIONALITIES,
    BODY_TYPES,
    PUBIC_HAIR_VALUES,
    HAIR_COLORS,
    BREAST_SIZES,
    BREAST_TYPES,
    EYE_COLORS,
    SEXUAL_ORIENTATION
} from '../../../labels'

const PersonalDetails = forwardRef((props, ref) => {
    const { i, contentWidth, offsetX = 0 } = props

    const [data, setData] = useState({
        name: '',
        dateOfBirth: '',
        nationality: '',
        languages: [],
        height: '',
        weight: '',
        bodyType: '',
        pubicHair: '',
        breastSize: '',
        breastType: '',
        hairColor: '',
        eyeColor: '',
        sexuality: '',
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
            || !data.dateOfBirth 
            || data.dateOfBirth.length !== 8
            || !data.nationality 
            || !data.languages.length 
            || !data.height 
            || !data.weight 
            || !data.bodyType 
            || !data.pubicHair 
            || !data.breastSize 
            || !data.breastType 
            || !data.hairColor 
            || !data.eyeColor
            || !data.sexuality
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

    const getDateOfBirth = () => {
        switch (data.dateOfBirth.length) {
            case 0:
                return ''
            case 1:
                return data.dateOfBirth
            case 2:
                return data.dateOfBirth //+ '.'
            case 3:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2]
            case 4:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] //+ '.'
            case 5:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] + '.' + data.dateOfBirth[4]
            case 6:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] + '.' + data.dateOfBirth[4] + data.dateOfBirth[5]
            case 7:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] + '.' + data.dateOfBirth[4] + data.dateOfBirth[5] + data.dateOfBirth[6]
            case 8:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] + '.' + data.dateOfBirth[4] + data.dateOfBirth[5] + data.dateOfBirth[6] + data.dateOfBirth[7]
            default:
                return data.dateOfBirth[0] + data.dateOfBirth[1] + '.' + data.dateOfBirth[2] + data.dateOfBirth[3] + '.' + data.dateOfBirth[4] + data.dateOfBirth[5] + data.dateOfBirth[5] + data.dateOfBirth[7]
        }
    }

    const onBirthdateChange = (text) => {
        const strippedText = text.replaceAll('.', '').replaceAll(' ', '').replace(/[^0-9]/g, '')

        if (strippedText.length > 8) {
            return
        }

        onValueChange(strippedText, 'dateOfBirth')
    }

    const onMultiPicklistChange = (value, attribute) => {
        setData(data => ({
            ...data,
            [attribute]: data[attribute].includes(value)
                ? data[attribute].filter(s => s !== value)
                : data[attribute].concat(value)
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
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Personal Details`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}>
                <Text style={styles.pageHeaderText}>
                    {`${i + 1}. Personal Details`}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="Lady xxx"
                        label="Name"
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
                    <HoverableInput
                        placeholder="DD.MM.YYYY"
                        label="Date of birth"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={getDateOfBirth()}
                        setText={(text) => onBirthdateChange(text)}
                        errorMessage={showErrors && !data.dateOfBirth ? 'Enter your date of birth' : showErrors && data.dateOfBirth.length !== 8 ? 'Enter a date in DD.MM.YYYY format.' : undefined}
                        numeric={true}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <DropdownSelect
                        values={NATIONALITIES}
                        offsetX={offsetX + (contentWidth * i)}
                        //searchable
                        //searchPlaceholder="Search nationality"
                        placeholder="Select your nationality"
                        label="Nationality"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.nationality}
                        setText={(text) => onValueChange(text, 'nationality')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.nationality ? 'Select your nationality' : undefined}
                    />
                    <DropdownSelect
                        values={LANGUAGES}
                        offsetX={offsetX + (contentWidth * i)}
                        multiselect
                        searchable
                        searchPlaceholder="Search language"
                        placeholder="Select languages"
                        label="Languages"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        text={data.languages.join(', ')}
                        setText={(text) => onMultiPicklistChange(text, 'languages')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.languages.length ? 'Select at least one language' : undefined}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="Height in cm"
                        label="Height (cm)"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.height}
                        setText={(text) => onValueChange(text.replace(/[^0-9]/g, ''), 'height')}
                        errorMessage={showErrors && !data.height ? 'Enter your height' : undefined}
                        numeric={true}
                    />

                    <HoverableInput
                        placeholder="Weight in kg"
                        label="Weight (kg)"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.weight}
                        setText={(text) => onValueChange(text.replace(/[^0-9]/g, ''), 'weight')}
                        errorMessage={showErrors && !data.weight ? 'Enter your weight' : undefined}
                        numeric={true}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <DropdownSelect
                        values={BODY_TYPES}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Select your body type"
                        label="Body type"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.bodyType}
                        setText={(text) => onValueChange(text, 'bodyType')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.bodyType ? 'Select your body type' : undefined}
                    />
                    <DropdownSelect
                        values={PUBIC_HAIR_VALUES}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Search your pubic hair"
                        label="Pubic hair"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.pubicHair}
                        setText={(text) => onValueChange(text, 'pubicHair')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.pubicHair ? 'Select your pubic hair' : undefined}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <DropdownSelect
                        values={BREAST_SIZES}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Select your breast size"
                        label="Breast size"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.breastSize}
                        setText={(text) => onValueChange(text, 'breastSize')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.breastSize ? 'Select your breast size' : undefined}
                    />
                    <DropdownSelect
                        values={BREAST_TYPES}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Search your breast type"
                        label="Breast type"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.breastType}
                        setText={(text) => onValueChange(text, 'breastType')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.breastType ? 'Select your breast type' : undefined}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.x_large }}>
                    <DropdownSelect
                        values={HAIR_COLORS}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Select your hair color"
                        label="Hair color"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.hairColor}
                        setText={(text) => onValueChange(text, 'hairColor')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.hairColor ? 'Select your hair color' : undefined}
                    />
                    <DropdownSelect
                        values={EYE_COLORS}
                        offsetX={offsetX + (contentWidth * i)}
                        placeholder="Search your eye color"
                        label="Eye color"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.eyeColor}
                        setText={(text) => onValueChange(text, 'eyeColor')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.eyeColor ? 'Select your eye color' : undefined}
                    />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', marginLeft: SPACING.x_large }}>
                    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}>
                        <HoverableInput
                            placeholder="+420 777 666 777"
                            label="Phone number"
                            borderColor={COLORS.placeholder}
                            hoveredBorderColor={COLORS.red}
                            textColor='#000'
                            containerStyle={{  }}
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

                    <DropdownSelect
                        values={SEXUAL_ORIENTATION}
                        offsetX={offsetX + (contentWidth * i)}
                        label="Sexual orientation"
                        borderColor={COLORS.placeholder}
                        hoveredBorderColor={COLORS.red}
                        textColor='#000'
                        containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.x_large * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.x_large }}
                        textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                        labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                        placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                        text={data.sexuality}
                        setText={(text) => onValueChange(text, 'sexuality')}
                        rightIconName='chevron-down'
                        errorMessage={showErrors && !data.sexuality ? 'Select your sexual orientation' : undefined}
                    />
                </View>

                <View style={{ marginHorizontal: SPACING.x_large }}>
                    <HoverableInput
                        placeholder="Desribe yourself"
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

export default memo(PersonalDetails)

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