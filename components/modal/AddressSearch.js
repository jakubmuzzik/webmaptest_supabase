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
import { normalize, getParam } from '../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../constants'
import { TouchableRipple, ActivityIndicator } from 'react-native-paper'
import * as Location from 'expo-location'

import { useSearchParams } from 'react-router-dom'

const window = Dimensions.get('window')

const AddressSearch = ({ visible, setVisible, onSelect }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const searchTimeout = useRef()
    const searchInputRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            searchInputRef.current.focus()
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])

    const [searchBorderColor, setSearchBorderColor] = useState(COLORS.placeholder)
    const [search, setSearch] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState([])

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

    const onSearch = (query) => {
        setSearch(query)

        if (!query || query.length < 2) {
            clearTimeout(searchTimeout.current)
            setIsSearching(false)
            setResults([])
            return
        }

        setIsSearching(true)
        clearTimeout(searchTimeout.current)

        searchTimeout.current = setTimeout(() => {
            fetchAddresses(query)
        }, 1500)
    }

    const fetchAddresses = async (query) => {
        try {
            const response = await fetch('https://ladiesforfun-dev-ed.develop.my.salesforce-sites.com/services/apexrest/geocode?' + new URLSearchParams({
                q: query
            }))
            const data = await response.json()
            const parsedData = JSON.parse(data)
            setResults(parsedData.items)
        } catch(e) {
            console.error('Error during address search: ', JSON.stringify(e))
        } finally {
            setIsSearching(false)
        }
    }

    const onUseCurrentLocationPress = async () => {
        try {
            setIsSearching(true)
            const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            })

            const response = await fetch('https://ladiesforfun-dev-ed.develop.my.salesforce-sites.com/services/apexrest/revgeocode?' + new URLSearchParams({
                at: latitude+','+longitude
            }))
            const data = await response.json()
            const parsedData = JSON.parse(data)
            setResults(parsedData.items)
        } catch(error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    const onAddressSelect = (address) => {
        onSelect(address)
        closeModal()
    }

    const closeModal = () => {
        clearTimeout(searchTimeout.current)
        setSearch('')
        setResults([])
        setIsSearching(false)

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
                                <Animated.Text style={modalHeaderTextStyles}>Search address</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginHorizontal: SPACING.small }}>Search address</Text>

                            <HoverableView style={{ ...styles.searchWrapper, borderRadius: 10, marginVertical: SPACING.xx_small, marginHorizontal: SPACING.small }} hoveredBackgroundColor='#FFF' backgroundColor='#FFF' hoveredBorderColor={COLORS.red} borderColor={searchBorderColor} transitionDuration='0ms'>
                                <Ionicons name="search" size={normalize(20)} color="black" />
                                <TextInput
                                    ref={searchInputRef}
                                    style={styles.citySearch}
                                    onChangeText={onSearch}
                                    value={search}
                                    placeholder="Enter your address"
                                    placeholderTextColor="grey"
                                    onBlur={() => setSearchBorderColor(COLORS.placeholder)}
                                    onFocus={() => setSearchBorderColor(COLORS.red)}
                                />
                                <Ionicons onPress={() => onSearch('')} style={{ opacity: search ? '1' : '0' }} name="close" size={normalize(20)} color="black" />
                            </HoverableView>

                            {!search && !isSearching && results.length === 0 && <TouchableRipple
                                onPress={onUseCurrentLocationPress}
                                style={{ paddingVertical: SPACING.xx_small, paddingHorizontal: SPACING.medium, alignItems: 'center', flexDirection: 'row' }}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                <>
                                    <Ionicons name="navigate-circle-outline" size={normalize(24)} color="black" />
                                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, marginLeft: SPACING.xxx_small }}>
                                        Use my current location
                                    </Text>
                                </>
                            </TouchableRipple>}

                            {isSearching && <ActivityIndicator style={{ marginTop: SPACING.small }} animating color={COLORS.red} />}

                            {!isSearching && results.map(address => {
                                return (
                                    <TouchableRipple
                                        key={address.id}
                                        onPress={() => onAddressSelect(address)}
                                        style={{ paddingVertical: SPACING.xx_small, marginHorizontal: SPACING.medium, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', overflow: 'hidden' }}
                                        rippleColor="rgba(220, 46, 46, .10)"
                                    >
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium }}>
                                            {address.title}
                                        </Text>
                                    </TouchableRipple>
                                )
                            })}
                        </Animated.ScrollView>

                        {/* <View style={{ borderTopWidth: 1, borderColor: COLORS.placeholder, flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.lightBlack}
                                mode="contained"
                                onPress={closeModal}
                            >
                                Done
                            </Button>
                        </View> */}
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default memo(AddressSearch)

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
    service: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.medium
    },
    serviceContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.small,
        width: '100%', 
        paddingVertical: SPACING.xx_small, 
        paddingLeft: SPACING.xx_small, 
        alignItems: 'center'
    },
    section: {
        paddingVertical: SPACING.xx_small,
        paddingHorizontal: SPACING.small,
        backgroundColor: COLORS.hoveredWhite
    },
})