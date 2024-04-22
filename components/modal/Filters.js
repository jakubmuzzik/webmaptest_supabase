import React, { useMemo, useEffect, useState, useRef, memo, forwardRef, useImperativeHandle } from 'react'
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
    DEFAULT_FILTERS
} from '../../constants'
import { 
    BODY_TYPES,
    PUBIC_HAIR_VALUES,
    SEXUAL_ORIENTATION,
    SERVICES,
    MASSAGE_SERVICES,
    HAIR_COLORS,
    BREAST_SIZES,
    BREAST_TYPES,
    TATOO,
    EYE_COLORS,
    LANGUAGES,
    NATIONALITIES,
    ESTABLISHMENT_TYPES
} from '../../labels'
import { Switch, Chip, SegmentedButtons, Button } from 'react-native-paper'
import BouncyCheckbox from "react-native-bouncy-checkbox"
import Slider from '../Slider'
import DropdownSelect from '../DropdownSelect'
import { connect } from 'react-redux'

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

const window = Dimensions.get('window')

const Filters = forwardRef((props, ref) => {
    const { visible, setVisible, cities = [] } = props

    const [searchParams] = useSearchParams()
    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        //purposely ommitting page
        //city is in filterParams
    }), [searchParams])

    const navigate = useNavigate()
    const location = useLocation()

    const containerRef = useRef()

    const isEstablishmentPage = location.pathname === '/clu'

    const filterParams = useMemo(() => ({
        ...getFilterParams(searchParams)
    }), [searchParams])

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
            width: isEstablishmentPage ? normalize(450) : normalize(750),
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

    const onFiltersChange = (filterName, value) => {
        setFilters(filters => ({
            ...filters,
            [filterName]: value
        }))
    }

    const onClearFiltersPress = () => {
        setFilters(DEFAULT_FILTERS)
    }

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

    const onMultiPicklistPress = (value, filterName) => {
        setFilters(filters => ({
            ...filters,
            [filterName]: filters[filterName].includes(value) 
             ?  filters[filterName].filter(s => s !== value)
             : filters[filterName].concat(value)
        }))
    }

    const renderLadiesFilters = () => (
        <>
            <View style={[styles.filterSection, { marginTop: 0, marginHorizontal: 0 }]}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 220, marginHorizontal: SPACING.small, marginTop: SPACING.small }}>
                        <Text style={[styles.filterHeader, { marginBottom: SPACING.xxx_small }]}>City</Text>

                        <DropdownSelect
                            containerRef={containerRef}
                            values={['Anywhere', ...cities]}
                            borderColor={COLORS.placeholder}
                            hoveredBorderColor={COLORS.red}
                            textColor='#000'
                            textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                            labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            text={filters.city ?? 'Anywhere'}
                            setText={(text) => setFilters(filters => ({ ...filters, city: text === 'Anywhere' ? undefined : text}))}
                            rightIconName='chevron-down'
                            leftIconName='map-marker'
                            leftIconColor={COLORS.red}
                        />
                    </View>

                    <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 220, marginHorizontal: SPACING.small, marginTop: SPACING.small }}>
                        <Text style={[styles.filterHeader, { marginBottom: SPACING.xxx_small }]}>Outcall / Incall</Text>

                        <DropdownSelect
                            containerRef={containerRef}
                            values={['Anything', 'Outcall', 'Incall']}
                            borderColor={COLORS.placeholder}
                            hoveredBorderColor={COLORS.red}
                            textColor='#000'
                            textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                            labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                            text={!filters.incall && !filters.outcall ? 'Anything' : filters.incall ? 'Incall' : 'Outcall'}
                            setText={(text) => setFilters(filters => ({ ...filters, outcall: text === 'Outcall', incall: text === 'Incall' }))}
                            rightIconName='chevron-down'
                            leftIconName='arrow-collapse'
                            leftIconColor={COLORS.red}
                        />
                    </View>
                   
                </View>
            </View>

            <View style={styles.filterSection}>
                <Text style={styles.filterHeader}>Age range</Text>

                <Slider range={filters.ageRange} minValue={MIN_AGE} absoluteMinValue maxValue={MAX_AGE} absoluteMaxValue={false} filterName="ageRange" setFilters={setFilters} />
            </View>

            <View style={styles.filterSection}>
                <Text style={styles.filterHeader}>Services</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {(location.pathname === '/esc' ? SERVICES : MASSAGE_SERVICES).map((service) => {
                        const selected = filters.services.includes(service)
                        return (
                            <Chip key={service}
                                style={{ marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small, backgroundColor: selected ? COLORS.red : 'transparent' }}
                                mode="outlined"
                                rippleColor="rgba(220, 46, 46, .10)"
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
                    {BODY_TYPES.map((body_type) => {
                        const selected = filters.body_type.includes(body_type)
                        return (
                            <Chip key={body_type}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(body_type, 'body_type')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {body_type}
                            </Chip>
                        )
                    })}
                </ScrollView>

                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                    Hair Color
                </Text>

                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                    {HAIR_COLORS.map((hair_color) => {
                        const selected = filters.hair_color.includes(hair_color)
                        return (
                            <Chip key={hair_color}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(hair_color, 'hair_color')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {hair_color}
                            </Chip>
                        )
                    })}
                </ScrollView>

                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                    Eye Color
                </Text>

                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                    {EYE_COLORS.map((eye_color) => {
                        const selected = filters.eye_color.includes(eye_color)
                        return (
                            <Chip key={eye_color}
                                style={{ marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small, backgroundColor: selected ? COLORS.red : 'transparent' }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(eye_color, 'eye_color')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {eye_color}
                            </Chip>
                        )
                    })}
                </ScrollView>

                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                    Pubic Hair
                </Text>

                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                    {PUBIC_HAIR_VALUES.map((pubic_hair) => {
                        const selected = filters.pubic_hair.includes(pubic_hair)
                        return (
                            <Chip key={pubic_hair}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(pubic_hair, 'pubic_hair')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {pubic_hair}
                            </Chip>
                        )
                    })}
                </ScrollView>

                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                    Breast Size
                </Text>

                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                    {BREAST_SIZES.map((breast_size) => {
                        const selected = filters.breast_size.includes(breast_size)
                        return (
                            <Chip key={breast_size}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(breast_size, 'breast_size')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {breast_size}
                            </Chip>
                        )
                    })}
                </ScrollView>

                <Text style={{ marginHorizontal: SPACING.small, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginBottom: SPACING.x_small }}>
                    Breast Type
                </Text>

                <ScrollView horizontal contentContainerStyle={{ marginHorizontal: SPACING.small }} showsHorizontalScrollIndicator={false}>
                    {BREAST_TYPES.map((breast_type) => {
                        const selected = filters.breast_type.includes(breast_type)
                        return (
                            <Chip key={breast_type}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(breast_type, 'breast_type')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {breast_type}
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
                    {NATIONALITIES.slice(0, showMoreNationalities ? NATIONALITIES.length : 4).map(nationality => {
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
                                    innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                    textContainerStyle={{ flexShrink: 1 }}
                                    onPress={() => onMultiPicklistPress(nationality, 'nationality')}
                                />
                            </View>
                        )
                    })}
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
                    {LANGUAGES.slice(0, showMoreLanguages ? LANGUAGES.length : 4).map(speaks => (
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
                                innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
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
        </>
    )

    const renderEstablishmentsFilters = () => (
        <>
            <View style={styles.filterSection}>
                <Text style={[styles.filterHeader, { marginTop: SPACING.small }]}>City</Text>

                <DropdownSelect
                    containerRef={containerRef}
                    values={['Anywhere', ...cities]}
                    borderColor={COLORS.placeholder}
                    hoveredBorderColor={COLORS.red}
                    textColor='#000'
                    textStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#000' }}
                    labelStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                    placeholderStyle={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}
                    text={filters.city ?? 'Anywhere'}
                    setText={(text) => setFilters(filters => ({ ...filters, city: text === 'Anywhere' ? undefined : text }))}
                    rightIconName='chevron-down'
                    leftIconName='map-marker'
                    leftIconColor={COLORS.red}
                />
            </View>

            <View style={[styles.filterSection, { borderWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.filterHeader}>Establishment Type</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.x_small }}>
                    {ESTABLISHMENT_TYPES.map((establishment_type) => {
                        const selected = filters.establishment_type.includes(establishment_type)
                        return (
                            <Chip key={establishment_type}
                                style={{ backgroundColor: selected ? COLORS.red : 'transparent', marginRight: SPACING.xx_small, marginBottom: SPACING.xx_small }}
                                mode="outlined"
                                textStyle={{ fontFamily: selected ? FONTS.bold : FONTS.medium, fontSize: FONT_SIZES.medium, color: selected ? '#FFF' : '#000' }}
                                onPress={() => onMultiPicklistPress(establishment_type, 'establishment_type')}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                {establishment_type}
                            </Chip>
                        )
                    })}
                </ScrollView>
            </View>
        </>
    )

    return (
        <Modal 
            ref={containerRef} 
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
                                <Animated.Text style={modalHeaderTextStyles}>Filters</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small, marginTop: SPACING.xxxxx_large - SPACING.small - SPACING.small }}>
                            {!isEstablishmentPage && renderLadiesFilters()}
                            {isEstablishmentPage && renderEstablishmentsFilters()}
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

const mapStateToProps = (store) => ({
    cities: store.appState.cities
})

export default connect(mapStateToProps)(memo(Filters))

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