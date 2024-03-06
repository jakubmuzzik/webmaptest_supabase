import React, { useMemo, useEffect, useState, useCallback, memo, forwardRef, useImperativeHandle } from 'react'
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text, Dimensions, StyleSheet, TextInput, ScrollView } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated'
import { Ionicons, Entypo } from '@expo/vector-icons'
import HoverableView from '../HoverableView'
import { normalize, getParam, stripEmptyParams, stripDefaultFilters, getFilterParams } from '../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
    MIN_AGE,
    MAX_AGE,
    MIN_HEIGHT,
    MAX_HEIGHT,
    MIN_WEIGHT,
    MAX_WEIGHT,
} from '../../constants'
import { 
    BODY_TYPES,
    PUBIC_HAIR_VALUES,
    SEXUAL_ORIENTATION,
    SERVICES,
    HAIR_COLORS,
    BREAST_SIZES,
    BREAST_TYPES,
    TATOO,
    EYE_COLORS,
    LANGUAGES,
    NATIONALITIES
} from '../../labels'
import { Switch, Chip, SegmentedButtons, Button } from 'react-native-paper'
import BouncyCheckbox from "react-native-bouncy-checkbox"
import Slider from '../Slider'

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

const window = Dimensions.get('window')

const DEFAULT_FILTERS = {
    ageRange: [MIN_AGE, MAX_AGE],
    heightRange: [MIN_HEIGHT, MAX_HEIGHT],
    weightRange: [MIN_WEIGHT, MAX_WEIGHT],
    //onlyVerified: false,
    onlyIndependent: false,
    //onlyPremium: false,
    outcall: false,
    incall: false,
    services: [],
    bodyType: [],
    hairColor: [],
    eyeColor: [],
    pubicHair: [],
    breastSize: [],
    breastType: [],
    speaks: [],
    nationality: [],
    sexualOrientation: []
}

const Filters = forwardRef((props, ref) => {
    const { visible, setVisible } = props

    const [searchParams] = useSearchParams()
    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        city: searchParams.get('city'),
        //purposely ommitting page 
    }), [searchParams])

    const navigate = useNavigate()
    const location = useLocation()

    const filterParams = useMemo(() => {
        return getFilterParams(searchParams)
    }, [searchParams])

    useImperativeHandle(ref, () => ({
        filterParams
    }))

    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [showMoreLanguages, setShowMoreLanguages] = useState(false)
    const [showMoreNationalities, setShowMoreNationalities] = useState(false)

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])

    useEffect(() => {
        setFilters({
            ...DEFAULT_FILTERS,
            ...filterParams
        })

        //TODO - apply filters
    }, [filterParams])

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

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: '#FFF',
            borderRadius: 24,
            width: normalize(750),
            maxWidth: '90%',
            height: normalize(800),
            maxHeight: '80%',
            overflow: 'hidden',
            transform: [{ translateY: translateY.value }]
        }
    })

    const closeModal = () => {
        //reset filters when not saved
        setFilters(filters)
        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
    }

    const onFiltersChange = useCallback((filterName, value) => {
        setFilters(filters => ({
            ...filters,
            [filterName]: value
        }))
    }, [])

    const onClearFiltersPress = useCallback(() => {
        setFilters(DEFAULT_FILTERS)
    }, [])

    const onApplyFiltersPress = () => {
        navigate({
            pathname: location.pathname,
            search: new URLSearchParams({ 
                ...stripEmptyParams(params),
                ...stripDefaultFilters(DEFAULT_FILTERS, filters)
            }).toString() 
        })

        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
    }

    const onMultiPicklistPress = useCallback((value, filterName) => {
        setFilters(filters => ({
            ...filters,
            [filterName]: filters[filterName].includes(value) 
             ?  filters[filterName].filter(s => s !== value)
             : filters[filterName].concat(value)
        }))
    }, [])

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
                                <Animated.Text style={modalHeaderTextStyles}>Filters</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <View style={[styles.filterSection, { marginTop: SPACING.xxxxx_large - SPACING.small }]}>
                                <Text style={styles.filterHeader}>Age range</Text>

                                <Slider range={filters.ageRange} minValue={MIN_AGE} absoluteMinValue maxValue={MAX_AGE} absoluteMaxValue={false} filterName="ageRange" setFilters={setFilters} />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterHeader}>Available For</Text>

                                <SegmentedButtons
                                    style={{ paddingHorizontal: SPACING.small }}
                                    onValueChange={() => null}
                                    theme={{ roundness: 1.5 }}
                                    buttons={[
                                        {
                                            style: {borderColor: COLORS.placeholder, backgroundColor: !filters.incall && !filters.outcall ? COLORS.red: 'transparent', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
                                            value: !filters.incall && !filters.outcall,
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: !filters.incall && !filters.outcall ? '#FFF' : '#000'}}>Both</Text>,
                                            onPress: () => setFilters(filters => ({...filters, outcall: false, incall: false})),
                                            rippleColor: "rgba(220, 46, 46, .10)"
                                        },
                                        {
                                            style: {borderColor: COLORS.placeholder, backgroundColor: filters.outcall ? COLORS.red: 'transparent'},
                                            value: filters.outcall,
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: filters.outcall ? '#FFF' : '#000'}}>Outcall</Text>,
                                            checkedColor: '#FFF',
                                            onPress: () => setFilters(filters => ({...filters, outcall: true, incall: false})),
                                            rippleColor: "rgba(220, 46, 46, .10)",
                                        },
                                        { 
                                            style: {borderColor: COLORS.placeholder, backgroundColor: filters.incall ? COLORS.red: 'transparent', borderTopRightRadius: 10, borderBottomRightRadius: 10},
                                            value: filters.incall, 
                                            label: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: filters.incall ? '#FFF' : '#000'}}>Incall</Text>,
                                            checkedColor: '#FFF',
                                            onPress: () => setFilters(filters => ({...filters, incall: true, outcall: false})),
                                            rippleColor: "rgba(220, 46, 46, .10)",
                                        }
                                    ]}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterHeader}>Services</Text>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {SERVICES.map((service) => {
                                        const selected = filters.services.includes(service)
                                        return (
                                            <Chip key={service}
                                                style={{ marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small, backgroundColor: selected ? COLORS.red : 'transparent' }}
                                                mode="outlined"
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                                selectedColor={selected ? 'green' : '#000'}
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(service, 'services')}
                                            >
                                                {service}
                                            </Chip>
                                        )
                                    })}
                                </View>
                            </View>

                            <View style={[styles.filterSection, { marginHorizontal: 0, paddingBottom: 0, borderWidth: 0 }]}>
                                <Text style={[styles.filterHeader, { marginHorizontal: SPACING.small }]}>Physical attributes</Text>

                                <View style={{ marginHorizontal: SPACING.small, flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.x_small }}>
                                    <View style={{ flex: 1, flexDirection: 'column', minWidth: 300, marginBottom: SPACING.small }}>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                            Height (cm)
                                        </Text>
                                        <Slider range={filters.heightRange} minValue={MIN_HEIGHT} absoluteMinValue={false} maxValue={MAX_HEIGHT} absoluteMaxValue={false} filterName="heightRange" setFilters={setFilters} />
                                    </View>

                                    <View style={{ flex: 1, flexDirection: 'column', minWidth: 300, marginBottom: SPACING.small }}>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                            Weight (kg)
                                        </Text>
                                        <Slider range={filters.weightRange} minValue={MIN_WEIGHT} absoluteMinValue={false} maxValue={MAX_WEIGHT} absoluteMaxValue={false} filterName="weightRange" setFilters={setFilters} />
                                    </View>
                                </View>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Body Type
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                                    {BODY_TYPES.map((bodyType) => {
                                        const selected = filters.bodyType.includes(bodyType)
                                        return (
                                            <Chip key={bodyType}
                                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(bodyType, 'bodyType')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {bodyType}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Hair Color
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                                    {HAIR_COLORS.map((hairColor) => {
                                        const selected = filters.hairColor.includes(hairColor)
                                        return (
                                            <Chip key={hairColor}
                                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(hairColor, 'hairColor')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {hairColor}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Eye Color
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                                    {EYE_COLORS.map((eyeColor) => {
                                        const selected = filters.eyeColor.includes(eyeColor)
                                        return (
                                            <Chip key={eyeColor}
                                                style={{ marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small, backgroundColor: selected ? COLORS.red : 'transparent' }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(eyeColor, 'eyeColor')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {eyeColor}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Pubic Hair
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                                    {PUBIC_HAIR_VALUES.map((pubicHair) => {
                                        const selected = filters.pubicHair.includes(pubicHair)
                                        return (
                                            <Chip key={pubicHair}
                                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(pubicHair, 'pubicHair')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {pubicHair}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Breast Size
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                                    {BREAST_SIZES.map((breastSize) => {
                                        const selected = filters.breastSize.includes(breastSize)
                                        return (
                                            <Chip key={breastSize}
                                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(breastSize, 'breastSize')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {breastSize}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>

                                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                                    Breast Type
                                </Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false}>
                                    {BREAST_TYPES.map((breastType) => {
                                        const selected = filters.breastType.includes(breastType)
                                        return (
                                            <Chip key={breastType}
                                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                                mode="outlined"
                                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                onPress={() => onMultiPicklistPress(breastType, 'breastType')}
                                                rippleColor= "rgba(220, 46, 46, .10)"
                                            >
                                                {breastType}
                                            </Chip>
                                        )
                                    })}
                                </ScrollView>
                                <View style={{ borderBottomWidth: 1, borderColor: COLORS.placeholder, marginTop: SPACING.small, marginHorizontal: SPACING.small }}></View>
                            </View>

                            {/* <View style={[styles.filterSection, { marginHorizontal: 0, paddingBottom: 0, borderWidth: 0 }]}>
                                <Text style={[styles.filterHeader, { marginHorizontal: SPACING.small }]}>Sexual Orientation</Text>

                                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false}>
                                    {SEXUAL_ORIENTATION.map((orientation) => {
                                        const selected = filters.sexualOrientation.includes(orientation)
                                        return (
                                            <HoverableView hoveredOpacity={0.9} style={{ marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}>
                                                <Chip key={orientation}
                                                    style={{ backgroundColor: selected ? COLORS.red : 'transparent' }}
                                                    mode="outlined"
                                                    textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                                    onPress={() => onMultiPicklistPress(orientation, 'sexualOrientation')}
                                                >
                                                    {orientation}
                                                </Chip>
                                            </HoverableView>
                                        )
                                    })}
                                </ScrollView>
                                <View style={{ borderBottomWidth: 1, borderColor: COLORS.placeholder, marginTop: SPACING.small, marginHorizontal: SPACING.small }}></View>
                            </View> */}

                            <View style={styles.filterSection}>
                                <Text style={styles.filterHeader}>Profile</Text> 
                                
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xx_small }}>
                                    <View style={{ flex: 1, flexDirection: 'column', marginRight: SPACING.small }}>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>
                                            Verified
                                        </Text>
                                        <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2 }}>
                                            Profiles that underwent identity verification process
                                        </Text>
                                    </View>
                                    <Switch value={filters.onlyVerified}
                                        onValueChange={(value) => onFiltersChange('onlyVerified', value)} color={COLORS.red}
                                    />
                                </View> */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flex: 1, flexDirection: 'column', marginRight: SPACING.small }}>
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>
                                            Independent
                                        </Text>
                                        <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2 }}>
                                            Not affiliated with agencies
                                        </Text>
                                    </View>
                                    <Switch value={filters.onlyIndependent}
                                        onValueChange={(value) => onFiltersChange('onlyIndependent', value)} color={COLORS.red}
                                    />
                                </View>
                                {//indepent, verified, premium, with reviews ?
                                }
                            </View>

                            <View style={[styles.filterSection, { marginHorizontal: 0 }]}>
                                <Text style={[styles.filterHeader, { marginHorizontal: SPACING.small }]}>Nationality</Text> 
                                
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {NATIONALITIES.slice(0, showMoreNationalities ? NATIONALITIES.length: 4).map(nationality => {
                                        const selected = filters.nationality.includes(nationality)
                                        return (
                                            <View key={nationality} style={{ width: '50%' }}>
                                                <BouncyCheckbox
                                                    style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.xxx_small }}
                                                    disableBuiltInState
                                                    isChecked={selected}
                                                    size={normalize(21)}
                                                    fillColor={COLORS.red}
                                                    unfillColor="#FFFFFF"
                                                    text={nationality}
                                                    iconStyle={{ borderRadius: 3 }}
                                                    innerIconStyle={{ borderWidth: 2,  borderRadius: 3 }}
                                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                                    textContainerStyle={{ flexShrink: 1 }}
                                                    onPress={() => onMultiPicklistPress(nationality, 'nationality')}
                                                />
                                            </View>
                                        )})}
                                </View>
                                <Text
                                    onPress={() => setShowMoreNationalities(v => !v)}
                                    style={{ width: 'fit-content', textDecorationLine: 'underline', fontFamily: FONTS.medium, marginTop: SPACING.xx_small, marginHorizontal: SPACING.small, fontSize: FONT_SIZES.large }}>
                                    {showMoreNationalities ? 'Show less' : 'Show more'}
                                </Text>
                            </View>

                            <View style={[styles.filterSection, { borderWidth: 0, paddingBottom: 0, marginHorizontal: 0 }]}>
                                <Text style={[styles.filterHeader, { marginHorizontal: SPACING.small }]}>Language</Text> 
                                
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {LANGUAGES.slice(0, showMoreLanguages ? LANGUAGES.length: 4).map(speaks => (
                                        <View key={speaks} style={{ width: '50%' }}>
                                            <BouncyCheckbox
                                                style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.xxx_small }}
                                                disableBuiltInState
                                                isChecked={filters.speaks.includes(speaks)}
                                                size={normalize(21)}
                                                fillColor={COLORS.red}
                                                unfillColor="#FFFFFF"
                                                text={speaks}
                                                iconStyle={{ borderColor: COLORS.red, borderRadius: 3 }}
                                                innerIconStyle={{ borderWidth: 2,  borderRadius: 3 }}
                                                textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                                textContainerStyle={{ flexShrink: 1 }}
                                                onPress={() => onMultiPicklistPress(speaks, 'speaks')}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <Text
                                    onPress={() => setShowMoreLanguages(v => !v)}
                                    style={{ width: 'fit-content', textDecorationLine: 'underline', fontFamily: FONTS.medium, marginTop: SPACING.xx_small, marginHorizontal: SPACING.small, fontSize: FONT_SIZES.large }}>
                                    {showMoreLanguages ? 'Show less' : 'Show more'}
                                </Text>
                            </View>
                        </Animated.ScrollView>

                        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.placeholder, paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.lightBlack }}
                                style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                                buttonColor="#FFF"
                                mode="outlined"
                                rippleColor='rgba(0,0,0,.1)'
                                onPress={onClearFiltersPress}
                            >
                                Clear all
                            </Button>

                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.lightBlack}
                                mode="contained"
                                onPress={onApplyFiltersPress}
                            >
                                Apply filters
                            </Button>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
})

export default memo(Filters)

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
    filterHeader: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.x_large,
        marginBottom: SPACING.x_small
    },
    filterSection: {
        marginHorizontal: SPACING.small,
        paddingVertical: SPACING.small,
        borderBottomWidth: 0.5,
        borderColor: COLORS.placeholder
    }
})