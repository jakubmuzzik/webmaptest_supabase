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
import DropdownSelect from '../../DropdownSelect'
import { normalize, areValuesEqual } from '../../../utils'
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

import {
    LANGUAGES,
    NATIONALITIES,
    BODY_TYPES,
    PUBIC_HAIR_VALUES,
    SEXUAL_ORIENTATION,
    HAIR_COLORS,
    BREAST_SIZES,
    BREAST_TYPES,
    EYE_COLORS
} from '../../../labels'

import {
    db,
    doc,
    updateDoc,
} from '../../../firebase/config'

const window = Dimensions.get('window')

const PersonalDetailsEditor = ({ visible, setVisible, personalDetails, toastRef, userId, updateRedux }) => {
    const [isSaving, setIsSaving] = useState(false)
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [contentWidth, setContentWidth] = useState(false)
    const [changedPersonalDetails, setChangedPersonalDetails] = useState(personalDetails)
    const [isChanged, setIsChanged] = useState(false)

    const containerRef = useRef()
    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setChangedPersonalDetails(personalDetails)
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

        if (
            !changedPersonalDetails.dateOfBirth
            || !changedPersonalDetails.sexuality
            || !changedPersonalDetails.nationality
            || changedPersonalDetails.languages.length === 0
            || !changedPersonalDetails.height
            || !changedPersonalDetails.weight
            || !changedPersonalDetails.bodyType
            || !changedPersonalDetails.pubicHair
            || !changedPersonalDetails.breastSize
            || !changedPersonalDetails.breastType
            || !changedPersonalDetails.hairColor
            || !changedPersonalDetails.eyeColor
        ) {
            setShowErrorMessage(true)
            return
        }

        setIsSaving(true)
        setShowErrorMessage(false)

        try {
            await updateDoc(doc(db, 'users', userId), {...changedPersonalDetails, lastModifiedDate: new Date()})

            closeModal()

            toastRef.current.show({
                type: 'success',
                headerText: 'Success!',
                text: 'Personal Details were changed successfully.'
            })

            updateRedux({...changedPersonalDetails, id: userId, lastModifiedDate: new Date()})
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

    const getDateOfBirth = useCallback(() => {
        switch (changedPersonalDetails.dateOfBirth.length) {
            case 0:
                return ''
            case 1:
                return changedPersonalDetails.dateOfBirth
            case 2:
                return changedPersonalDetails.dateOfBirth //+ '.'
            case 3:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2]
            case 4:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] //+ '.'
            case 5:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] + '.' + changedPersonalDetails.dateOfBirth[4]
            case 6:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] + '.' + changedPersonalDetails.dateOfBirth[4] + changedPersonalDetails.dateOfBirth[5]
            case 7:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] + '.' + changedPersonalDetails.dateOfBirth[4] + changedPersonalDetails.dateOfBirth[5] + changedPersonalDetails.dateOfBirth[6]
            case 8:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] + '.' + changedPersonalDetails.dateOfBirth[4] + changedPersonalDetails.dateOfBirth[5] + changedPersonalDetails.dateOfBirth[6] + changedPersonalDetails.dateOfBirth[7]
            default:
                return changedPersonalDetails.dateOfBirth[0] + changedPersonalDetails.dateOfBirth[1] + '.' + changedPersonalDetails.dateOfBirth[2] + changedPersonalDetails.dateOfBirth[3] + '.' + changedPersonalDetails.dateOfBirth[4] + changedPersonalDetails.dateOfBirth[5] + changedPersonalDetails.dateOfBirth[5] + changedPersonalDetails.dateOfBirth[7]
        }
    }, [changedPersonalDetails.dateOfBirth])

    const updateIsChanged = (value, attribute) => {
        setIsChanged(!areValuesEqual(value, personalDetails[attribute]))
    }

    const onBirthdateChange = (text) => {
        const strippedText = text.replaceAll('.', '').replaceAll(' ', '').replace(/[^0-9]/g, '')

        if (strippedText.length > 8) {
            return
        }

        onValueChange(strippedText, 'dateOfBirth')
        updateIsChanged(strippedText, 'dateOfBirth')
    }

    const onMultiPicklistChange = (value, attribute) => {
        setChangedPersonalDetails(data => ({
            ...data,
            [attribute]: data[attribute].includes(value)
                ? data[attribute].filter(s => s !== value)
                : data[attribute].concat(value)
        }))
        updateIsChanged(value, attribute)
    }

    const onValueChange = (value, attribute) => {
        setChangedPersonalDetails(data => ({
            ...data,
            [attribute]: value
        }))
        updateIsChanged(value, attribute)
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
        <Modal ref={containerRef} transparent={true}
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
                                <Animated.Text style={modalHeaderTextStyles}>Edit Personal Details</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }} onContentSizeChange={(contentWidth) => setContentWidth(contentWidth)}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginBottom: SPACING.small, marginHorizontal: SPACING.small }}>
                                Edit Personal Details
                            </Text>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <HoverableInput
                                    placeholder="DD.MM.YYYY"
                                    label="Date of birth"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    text={getDateOfBirth()}
                                    setText={(text) => onBirthdateChange(text)}
                                    errorMessage={showErrorMessage && !changedPersonalDetails.dateOfBirth ? 'Enter your date of birth' : showErrorMessage && changedPersonalDetails.dateOfBirth.length !== 8 ? 'Enter a date in DD.MM.YYYY format.' : undefined}
                                />
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={SEXUAL_ORIENTATION}
                                    placeholder="Select your sexuality"
                                    label="Sexuality"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    text={changedPersonalDetails.sexuality}
                                    setText={(text) => onValueChange(text, 'sexuality')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.sexuality ? 'Select your sexuality' : undefined}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={NATIONALITIES}
                                    searchable
                                    searchPlaceholder="Search nationality"
                                    placeholder="Select your nationality"
                                    label="Nationality"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    text={changedPersonalDetails.nationality}
                                    setText={(text) => onValueChange(text, 'nationality')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.nationality ? 'Select your nationality' : undefined}
                                />
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={LANGUAGES}
                                    multiselect
                                    searchable
                                    searchPlaceholder="Search language"
                                    placeholder="Select languages"
                                    label="Languages"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    text={changedPersonalDetails.languages.join(', ')}
                                    setText={(text) => onMultiPicklistChange(text, 'languages')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.languages.length ? 'Select at least one language' : undefined}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <HoverableInput
                                    placeholder="Height in cm"
                                    label="Height (cm)"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.height}
                                    setText={(text) => onValueChange(text.replace(/[^0-9]/g, ''), 'height')}
                                    numeric={true}
                                    errorMessage={showErrorMessage && !changedPersonalDetails.height ? 'Enter your height' : undefined}
                                />

                                <HoverableInput
                                    placeholder="Weight in kg"
                                    label="Weight (kg)"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.weight}
                                    setText={(text) => onValueChange(text.replace(/[^0-9]/g, ''), 'weight')}
                                    numeric={true}
                                    errorMessage={showErrorMessage && !changedPersonalDetails.weight ? 'Enter your weight' : undefined}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={BODY_TYPES}
                                    placeholder="Select your body type"
                                    label="Body type"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.bodyType}
                                    setText={(text) => onValueChange(text, 'bodyType')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.bodyType ? 'Select your body type' : undefined}
                                />
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={PUBIC_HAIR_VALUES}
                                    placeholder="Search your pubic hair"
                                    label="Pubic hair"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.pubicHair}
                                    setText={(text) => onValueChange(text, 'pubicHair')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.pubicHair ? 'Select your pubic hair' : undefined}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={BREAST_SIZES}
                                    placeholder="Select your breast size"
                                    label="Breast size"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.breastSize}
                                    setText={(text) => onValueChange(text, 'breastSize')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.breastSize ? 'Select your breast size' : undefined}
                                />
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={BREAST_TYPES}
                                    placeholder="Search your breast type"
                                    label="Breast type"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.breastType}
                                    setText={(text) => onValueChange(text, 'breastType')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.breastType ? 'Select your breast type' : undefined}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={HAIR_COLORS}
                                    placeholder="Select your hair color"
                                    label="Hair color"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.hairColor}
                                    setText={(text) => onValueChange(text, 'hairColor')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.hairColor ? 'Select your hair color' : undefined}
                                />
                                <DropdownSelect
                                    containerRef={containerRef}
                                    values={EYE_COLORS}
                                    placeholder="Search your eye color"
                                    label="Eye color"
                                    borderColor={COLORS.placeholder}
                                    hoveredBorderColor={COLORS.red}
                                    textColor='#000'
                                    containerStyle={{ flexGrow: 1, flexShrink: 1, flexBasis: (contentWidth / 2) - SPACING.small * 2, minWidth: 220, marginTop: SPACING.xxx_small, marginRight: SPACING.small }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder }}
                                    text={changedPersonalDetails.eyeColor}
                                    setText={(text) => onValueChange(text, 'eyeColor')}
                                    rightIconName='chevron-down'
                                    errorMessage={showErrorMessage && !changedPersonalDetails.eyeColor ? 'Select your eye color' : undefined}
                                />
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

export default memo(PersonalDetailsEditor)

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