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
import HoverableView from '../HoverableView'
import { normalize, getParam, getFilterParams } from '../../utils'
import {
    CZECH,
    CITY,
    SELECT_CITY,
    SEARCH,
    translateLabels
} from '../../labels'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../constants'
import { useSearchParams } from 'react-router-dom'

import RenderCity from '../list/RenderCity'

import { Skeleton } from 'moti/skeleton'

const window = Dimensions.get('window')

const CityPicker = ({ visible, setVisible, routeName, cities }) => {
    const [searchParams] = useSearchParams()
    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        city: searchParams.get('city'),
        //purposely ommitting page 
    }), [searchParams])

    const filterParams = useMemo(() => {
        return getFilterParams(searchParams)
    }, [searchParams])

    const labels = useMemo(() => translateLabels(params.language, [
        CZECH,
        CITY,
        SELECT_CITY,
        SEARCH
    ]), [params.language])

    const [searchCityBorderColor, setSearchCityBorderColor] = useState(COLORS.placeholder)
    const [citySearch, setCitySearch] = useState('')

    const filteredCitiesRef = useRef([])

    useEffect(() => {
        filteredCitiesRef.current = cities
    }, [cities])

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

    const onCitySearch = useCallback((search) => {
        filteredCitiesRef.current = search ? [...cities].filter(city => city.toLowerCase().includes(citySearch.toLowerCase())) : [...cities]
        setCitySearch(search)
    }, [filteredCitiesRef.current])

    const closeModal = () => {
        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
    }

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: '#FFF',
            borderRadius: 24,
            width: normalize(500),
            maxWidth: '90%',
            height: normalize(500),
            maxHeight: '80%',
            overflow: 'hidden',
            transform: [{ translateY: translateY.value }]
        }
    })

    const Spacer = ({ height = 16 }) => <View style={{ height }} />

    const renderMotiSkeleton = () => (
        <View
            style={{ flex: 1, paddingHorizontal: SPACING.small, paddingVertical: SPACING.small }}
        >
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
            <Spacer height={SPACING.xx_small} />
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
            <Spacer height={SPACING.xx_small} />
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
            <Spacer height={SPACING.xx_small} />
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
            <Spacer height={SPACING.xx_small} />
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
            <Spacer height={SPACING.xx_small} />
            <Skeleton colorMode={'light'} width={'100%'} height={35} />
        </View>
    )

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
                                <Animated.Text style={modalHeaderTextStyles}>{labels.SELECT_CITY}</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginHorizontal: SPACING.small }}>{labels.SELECT_CITY}</Text>

                            {!cities && renderMotiSkeleton()}
                            {cities && <>
                                <HoverableView style={{ ...styles.searchWrapper, borderRadius: 10, marginVertical: SPACING.xx_small, marginHorizontal: SPACING.small }} hoveredBackgroundColor='#FFF' backgroundColor='#FFF' hoveredBorderColor={COLORS.red} borderColor={searchCityBorderColor} transitionDuration='0ms'>
                                    <Ionicons name="search" size={normalize(20)} color="black" />
                                    <TextInput
                                        style={styles.citySearch}
                                        onChangeText={onCitySearch}
                                        value={citySearch}
                                        placeholder={labels.SEARCH}
                                        placeholderTextColor="grey"
                                        onBlur={() => setSearchCityBorderColor(COLORS.placeholder)}
                                        onFocus={() => setSearchCityBorderColor(COLORS.red)}
                                    />
                                    <Ionicons onPress={() => onCitySearch('')} style={{ opacity: citySearch ? '1' : '0' }} name="close" size={normalize(20)} color="black" />
                                </HoverableView>

                                <RenderCity routeName={routeName} params={params} filterParams={filterParams} iconName={params.city ? 'radio-button-unchecked' : 'radio-button-checked'} iconColor={params.city ? 'grey' : COLORS.red} />
                                {filteredCitiesRef.current.map(city => <RenderCity key={city} city={city} routeName={routeName} params={params} filterParams={filterParams} iconName={city === params.city ? 'radio-button-checked' : 'radio-button-unchecked'} iconColor={city === params.city ? COLORS.red : 'grey'} />)}
                            </>
                            }
                        </Animated.ScrollView>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default memo(CityPicker)

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
    searchWrapper: {
        flexDirection: 'row',
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        paddingHorizontal: SPACING.x_small,
        overflow: 'hidden'
    },
    citySearch: {
        flex: 1,
        padding: SPACING.xx_small,
        borderRadius: 20,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.medium,
        outlineStyle: 'none',
        color: '#000'
    },
    countrySection: {
        marginVertical: SPACING.xx_small,
        flexDirection: 'row',
        alignItems: 'center'
    },
    countrySection__text: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.large
    },
    countrySection__image: {
        width: SPACING.small,
        height: SPACING.x_small,
        marginRight: SPACING.xx_small,
        marginLeft: SPACING.small
    },
})