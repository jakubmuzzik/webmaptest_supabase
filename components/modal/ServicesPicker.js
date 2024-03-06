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
    SERVICES,
    MASSAGE_SERVICES
} from '../../labels'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../constants'
import { TouchableRipple, Button } from 'react-native-paper'
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { useSearchParams } from 'react-router-dom'

const window = Dimensions.get('window')

const ServicesPicker = ({ visible, setVisible, services, onSelect }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

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

    const [searchBorderColor, setSearchBorderColor] = useState(COLORS.placeholder)
    const [search, setSearch] = useState('')

    const filteredServicesRef = useRef([...SERVICES])
    const filteredMassageServicesRef = useRef([...MASSAGE_SERVICES])

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

    const onSearch = useCallback((search) => {
        filteredServicesRef.current = search ? [...SERVICES].filter(service => service.toLowerCase().includes(search.toLowerCase())) : [...SERVICES]
        filteredMassageServicesRef.current = search ? [...MASSAGE_SERVICES].filter(service => service.toLowerCase().includes(search.toLowerCase())) : [...MASSAGE_SERVICES]
        setSearch(search)
    }, [filteredServicesRef.current, filteredMassageServicesRef.current])

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
                                <Animated.Text style={modalHeaderTextStyles}>Select Services</Animated.Text>
                            </View>
                            <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                                <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.hoveredHoveredWhite} backgroundColor={COLORS.hoveredWhite}>
                                    <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="black" />
                                </HoverableView>
                            </View>
                        </View>
                        <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />

                        <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginHorizontal: SPACING.small }}>Select Services</Text>

                            <HoverableView style={{ ...styles.searchWrapper, borderRadius: 10, marginVertical: SPACING.xx_small, marginHorizontal: SPACING.small }} hoveredBackgroundColor='#FFF' backgroundColor='#FFF' hoveredBorderColor={COLORS.red} borderColor={searchBorderColor} transitionDuration='0ms'>
                                <Ionicons name="search" size={normalize(20)} color="black" />
                                <TextInput
                                    style={styles.citySearch}
                                    onChangeText={onSearch}
                                    value={search}
                                    placeholder="Search services"
                                    placeholderTextColor="grey"
                                    onBlur={() => setSearchBorderColor(COLORS.placeholder)}
                                    onFocus={() => setSearchBorderColor(COLORS.red)}
                                />
                                <Ionicons onPress={() => onSearch('')} style={{ opacity: search ? '1' : '0' }} name="close" size={normalize(20)} color="black" />
                            </HoverableView>

                            {(filteredServicesRef.current.some(filteredService => SERVICES.includes(filteredService)) || !search) && <View style={styles.section}>
                                <Text style={{ textAlign: 'left', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>Sexual services</Text>
                            </View>}

                            {filteredServicesRef.current.map(service => {
                                const selected = services.includes(service)
                                return (
                                    <TouchableRipple
                                        key={service}
                                        onPress={() => onSelect(service)}
                                        style={{ paddingVertical: SPACING.xx_small, paddingHorizontal: SPACING.medium, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}
                                        rippleColor="rgba(220, 46, 46, .10)"
                                    >
                                        <BouncyCheckbox
                                            pointerEvents="none"
                                            //style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.xxx_small }}
                                            disableBuiltInState
                                            isChecked={selected}
                                            size={normalize(21)}
                                            fillColor={COLORS.red}
                                            unfillColor="#FFFFFF"
                                            text={service}
                                            iconStyle={{ borderRadius: 3 }}
                                            innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                            textStyle={{ color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                            textContainerStyle={{ flexShrink: 1 }}
                                        />
                                    </TouchableRipple>
                                )
                            })}

                            {(filteredMassageServicesRef.current.some(filteredService => MASSAGE_SERVICES.includes(filteredService)) || !search) && <View style={styles.section}>
                                <Text style={{ textAlign: 'left', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>Massage services</Text>
                            </View>}

                            {filteredMassageServicesRef.current.map(service => {
                                const selected = services.includes(service)
                                return (
                                    <TouchableRipple
                                        key={service}
                                        onPress={() => onSelect(service)}
                                        style={{ paddingVertical: SPACING.xx_small, paddingHorizontal: SPACING.medium, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}
                                        rippleColor="rgba(220, 46, 46, .10)"
                                    >
                                        <BouncyCheckbox
                                            pointerEvents="none"
                                            //style={{ paddingHorizontal: SPACING.small, paddingVertical: SPACING.xxx_small }}
                                            disableBuiltInState
                                            isChecked={selected}
                                            size={normalize(21)}
                                            fillColor={COLORS.red}
                                            unfillColor="#FFFFFF"
                                            text={service}
                                            iconStyle={{ borderRadius: 3 }}
                                            innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                            textStyle={{ color: '#000', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                            textContainerStyle={{ flexShrink: 1 }}
                                        />
                                    </TouchableRipple>
                                )
                            })}
                        </Animated.ScrollView>

                        <View style={{ borderTopWidth: 1, borderColor: COLORS.placeholder, flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.lightBlack}
                                mode="contained"
                                onPress={closeModal}
                            >
                                Done
                            </Button>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    )
}

export default memo(ServicesPicker)

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
    section: {
        paddingVertical: SPACING.xx_small,
        paddingHorizontal: SPACING.small,
        backgroundColor: COLORS.hoveredWhite
    },
})