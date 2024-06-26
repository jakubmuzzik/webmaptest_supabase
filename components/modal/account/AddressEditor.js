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
import { normalize, areValuesEqual } from '../../../utils'
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
} from '../../../constants'

import { TabView } from 'react-native-tab-view'

import Toast from '../../Toast'

import { Button, TouchableRipple, ActivityIndicator, Switch } from 'react-native-paper'
import BouncyCheckbox from "react-native-bouncy-checkbox"
import * as Location from 'expo-location'

const window = Dimensions.get('window')

import { supabase } from '../../../supabase/config'

const AddressEditor = ({ visible, setVisible, address, toastRef, userId, updateRedux, user_type }) => {
    const [routes] = useState([
        { key: '1' },
        { key: '2' }
    ])

    const [isSaving, setIsSaving] = useState(false)
    const [changedAddress, setChangedAddress] = useState(address)

    const [index, setIndex] = useState(0)

    const [searchBorderColor, setSearchBorderColor] = useState('grey')
    const [search, setSearch] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState([])

    const modalToastRef = useRef()

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                useNativeDriver: true
            })
            setChangedAddress(address)
        } else {
            translateY.value = withTiming(window.height, {
                useNativeDriver: true
            })
        }
    }, [visible])

    const searchTimeout = useRef()
    const searchInputRef = useRef()

    const scrollY1 = useSharedValue(0)
    const scrollY2 = useSharedValue(0)

    const scrollHandler1 = useAnimatedScrollHandler((event) => {
        scrollY1.value = event.contentOffset.y
    })
    const scrollHandler2 = useAnimatedScrollHandler((event) => {
        scrollY2.value = event.contentOffset.y
    })

    const translateY = useSharedValue(window.height)

    const modalHeaderTextStyles1 = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY1.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            backgroundColor: COLORS.grey,
            color: COLORS.white
        }
    })
    const modalHeaderTextStyles2 = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY2.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            backgroundColor: COLORS.grey,
            color: COLORS.white
        }
    })

    const closeModal = () => {
        clearTimeout(searchTimeout.current)
        setSearch('')
        setResults([])
        setIsSearching(false)

        translateY.value = withTiming(window.height, {
            useNativeDriver: true
        })
        setVisible(false)
        setIndex(0)
    }

    const onSavePress = async () => {
        if (isSaving) {
            return
        }

        setIsSaving(true)

        let addr = JSON.parse(JSON.stringify(changedAddress))
        const hidden = addr.hidden_address
        delete addr.hidden_address

        try {
            const { error: updateError } = await supabase
                .from(user_type === 'lady' ? 'ladies' : 'establishments')
                .update({address: addr, hidden_address: hidden, last_modified_date: new Date()})
                .eq('id', userId)

            if (updateError) {
                throw updateError
            }

            closeModal()

            toastRef.show({
                type: 'success',
                headerText: 'Success!',
                text: 'Address was changed successfully.'
            })

            updateRedux({address: addr, hidden_address: hidden, id: userId, last_modified_date: new Date()})
        } catch(e) {
            modalToastRef.current.show({
                type: 'error',
                text: "Failed to save the data. Please try again later."
            })
        } finally {
            setIsSaving(false)
        }
    }

    const onSearch = (query) => {
        setSearch(query)
        //setChangedAddress(address)

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
        } catch (e) {
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
                at: latitude + ',' + longitude
            }))
            const data = await response.json()
            const parsedData = JSON.parse(data)
            setResults(parsedData.items)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    const onAddressSelect = (a) => {
        if (a.id === changedAddress.id) {
            return
        }

        const { title, id, address, position } = a
        setChangedAddress(data => ({ title, id, ...address, ...position, hidden_address: data.hidden_address }))
    }

    const modalContainerStyles = useAnimatedStyle(() => {
        return {
            backgroundColor: COLORS.grey,
            borderRadius: 24,
            width: normalize(500),
            maxWidth: '90%',
            height: normalize(500),
            maxHeight: '80%',
            overflow: 'hidden',
            transform: [{ translateY: translateY.value }]
        }
    })

    const renderFirstPage = () => {
        return (
            <>
                <View style={styles.modal__header}>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}></View>
                    <View style={{ flexShrink: 1, flexGrow: 0 }}>
                        <Animated.Text style={modalHeaderTextStyles1}>Address</Animated.Text>
                    </View>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                        <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground} backgroundColor={'#372b2b'}>
                            <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="white" />
                        </HoverableView>
                    </View>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles1]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler1} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginHorizontal: SPACING.small, marginBottom: SPACING.small, color: COLORS.white }}>
                        Address
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: SPACING.small }}>
                        <View style={{ flex: 1, flexDirection: 'column', marginRight: SPACING.small }}>
                            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.white }}>
                                Show your specific location
                            </Text>
                            <Text style={{ color: COLORS.placeholder, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2 }}>
                                If not selected, only city will be visible on your profile
                            </Text>
                        </View>
                        <Switch
                            value={!changedAddress.hidden_address}
                            onValueChange={(value) => setChangedAddress({
                                ...changedAddress,
                                hidden_address: !value
                            })}
                            color={COLORS.red}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => setIndex(1)}
                        style={{ marginTop: SPACING.x_small, marginHorizontal: SPACING.small }}>
                        <HoverableInput
                            pointerEventsDisabled
                            placeholder="Search address"
                            label="Search address"
                            text={changedAddress.title}
                            leftIconName='map-marker-outline'
                        />
                    </TouchableOpacity>
                </Animated.ScrollView>
            </>
        )
    }

    const renderSecondPage = () => {
        return (
            <>
                <View style={styles.modal__header}>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0 }}>
                        <HoverableView style={{ marginLeft: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground} backgroundColor={'#372b2b'}>
                            <Ionicons onPress={() => setIndex(0)} name="arrow-back" size={normalize(25)} color="white" />
                        </HoverableView>
                    </View>
                    <View style={{ flexShrink: 1, flexGrow: 0 }}>
                        <Animated.Text style={modalHeaderTextStyles2}>Edit Address</Animated.Text>
                    </View>
                    <View style={{ flexBasis: 50, flexGrow: 1, flexShrink: 0, alignItems: 'flex-end' }}>
                        <HoverableView style={{ marginRight: SPACING.small, width: SPACING.x_large, height: SPACING.x_large, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5 }} hoveredBackgroundColor={COLORS.darkRedBackground2} backgroundColor={'#372b2b'}>
                            <Ionicons onPress={closeModal} name="close" size={normalize(25)} color="white" />
                        </HoverableView>
                    </View>
                </View>
                <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles2]} />

                <Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler2} style={{ flex: 1, zIndex: 1 }} contentContainerStyle={{ paddingBottom: SPACING.small }}>
                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginTop: SPACING.xxxxx_large, marginHorizontal: SPACING.small, color: COLORS.white }}>
                        Edit Address
                    </Text>

                    <HoverableView style={{ ...styles.searchWrapper, borderRadius: 10, marginVertical: SPACING.xx_small, marginHorizontal: SPACING.small }} hoveredBackgroundColor={COLORS.darkRedBackground2} backgroundColor='#372b2b' hoveredBorderColor={COLORS.red} borderColor={searchBorderColor} transitionDuration='0ms'>
                        <Ionicons name="search" size={normalize(20)} color="white" />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.citySearch}
                            onChangeText={onSearch}
                            value={search}
                            placeholder="Enter your address"
                            placeholderTextColor={COLORS.placeholder}
                            onBlur={() => setSearchBorderColor('grey')}
                            onFocus={() => setSearchBorderColor(COLORS.red)}
                        />
                        <Ionicons onPress={() => onSearch('')} style={{ opacity: search ? '1' : '0' }} name="close" size={normalize(20)} color="white" />
                    </HoverableView>

                    {!search && !isSearching && results.length === 0 && <TouchableRipple
                        onPress={onUseCurrentLocationPress}
                        style={{ paddingVertical: SPACING.xx_small, paddingHorizontal: SPACING.small, alignItems: 'center', flexDirection: 'row' }}
                        rippleColor="rgba(220, 46, 46, .10)"
                    >
                        <>
                            <Ionicons name="navigate-circle-outline" size={normalize(24)} color="white" />
                            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, marginLeft: SPACING.xxx_small, color: COLORS.white }}>
                                Use my current location
                            </Text>
                        </>
                    </TouchableRipple>}

                    {isSearching && <ActivityIndicator style={{ marginTop: SPACING.small }} animating color={COLORS.red} />}

                    {!isSearching && results.map(a => {
                        const selected = a.id === changedAddress.id
                        return (
                            <TouchableRipple
                                key={a.id}
                                onPress={() => onAddressSelect(a)}
                                style={{ paddingVertical: SPACING.xx_small, paddingHorizontal: SPACING.small, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', overflow: 'hidden' }}
                                rippleColor="rgba(220, 46, 46, .10)"
                            >
                                <BouncyCheckbox
                                    pointerEvents="none"
                                    style={{}}
                                    disableBuiltInState
                                    isChecked={selected}
                                    size={normalize(21)}
                                    fillColor={COLORS.red}
                                    unfillColor="#FFFFFF"
                                    text={a.title}
                                    //iconStyle={{ borderRadius: 3 }}
                                    //innerIconStyle={{ borderWidth: 2, borderRadius: 3 }}
                                    textStyle={{ color: COLORS.white, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textDecorationLine: "none" }}
                                    textContainerStyle={{ flexShrink: 1 }}
                                />
                            </TouchableRipple>
                        )
                    })}
                </Animated.ScrollView>
            </>
        )
    }

    const renderScene = ({ route }) => {
        switch (route.key) {
            case '1':
                return renderFirstPage()
            case '2':
                return renderSecondPage()
        }
    }

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
                        <TabView
                            renderTabBar={props => null}
                            swipeEnabled={false}
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                        //initialLayout={{ width: contentWidth }}
                        />

                        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.placeholder, paddingHorizontal: SPACING.small, paddingVertical: SPACING.x_small, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: COLORS.white }}
                                style={{ flexShrink: 1, borderRadius: 10, borderWidth: 0 }}
                                buttonColor={COLORS.grey}
                                mode="outlined"
                                rippleColor='rgba(0,0,0,.1)'
                                onPress={closeModal}
                            >
                                Cancel
                            </Button>

                            <Button
                                labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, color: '#FFF' }}
                                style={{ flexShrink: 1, borderRadius: 10 }}
                                buttonColor={COLORS.red}
                                mode="contained"
                                onPress={onSavePress}
                                loading={isSaving}
                                disabled={isSaving || (address.id === changedAddress.id && address.hidden_address === changedAddress.hidden_address)}
                                theme={{ colors: { surfaceDisabled: COLORS.hoveredLightGrey }}}
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

export default memo(AddressEditor)

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
        color: COLORS.white,
    },
    section: {
        paddingVertical: SPACING.xx_small,
        paddingHorizontal: SPACING.small,
        backgroundColor: COLORS.hoveredWhite
    },
})