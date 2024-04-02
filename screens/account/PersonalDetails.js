import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { SPACING, FONTS, FONT_SIZES, COLORS, SMALL_SCREEN_THRESHOLD, CURRENCY_SYMBOLS } from '../../constants'
import { Button } from 'react-native-paper'
import { MaterialCommunityIcons, FontAwesome5, EvilIcons } from '@expo/vector-icons'
import { normalize, calculateAgeFromDate } from '../../utils'

import { connect } from 'react-redux'

import HoverableView from '../../components/HoverableView'
//import MapView, { Marker, ClusterProps, MarkerClusterer } from "@teovilla/react-native-web-maps"
import MapView, { Marker, Callout } from 'react-native-maps'
//import { Image } from 'expo-image'

import AboutEditor from '../../components/modal/account/AboutEditor'
import PersonalDetailsEditor from '../../components/modal/account/PersonalDetailsEditor'
import PricingEditor from '../../components/modal/account/PricingEditor'
import ServicesEditor from '../../components/modal/account/ServicesEditor'
import WorkingHoursEditor from '../../components/modal/account/WorkingHoursEditor'
import AddressEditor from '../../components/modal/account/AddressEditor'
import ContactInformationEditor from '../../components/modal/account/ContactInformationEditor'

import { updateCurrentUserInRedux, updateLadyInRedux } from '../../redux/actions'

const LOCATION_LATITUDE_DELTA = 0.9735111002971948 // default value just for map init -> later is used minLatitudeDelta.current
const LOCATION_LONGITUDE_DELTA = 0.6 // == 50 Km 
const INITIAL_LATITUDE = 50.0646126
const INITIAL_LONGITUDE = 14.3729754

const PersonalDetails = ({ setTabHeight, toastRef, userData, updateCurrentUserInRedux, updateLadyInRedux, user_type }) => {
    const { width } = useWindowDimensions()
    const isSmallScreen = width <= SMALL_SCREEN_THRESHOLD

    const personalDetails = useMemo(() => ({
        nationality: userData.nationality,
        languages: userData.languages,
        hair_color: userData.hair_color,
        eye_color: userData.eye_color,
        breast_size: userData.breast_size,
        breast_type: userData.breast_type,
        body_type: userData.body_type,
        pubic_hair: userData.pubic_hair,
        weight: userData.weight,
        height: userData.height,
        date_of_birth: userData.date_of_birth,
        sexuality: userData.sexuality
    }), [userData.nationality, userData.languages, userData.hair_color, userData.eye_color, userData.breast_size, userData.breast_type, userData.body_type, userData.pubic_hair, userData.weight, userData.height, userData.date_of_birth, userData.sexuality])

    const pricing = useMemo(() => ({
        prices: userData.prices,
        currency: userData.currency,
        outcall: userData.outcall,
        incall: userData.incall
    }), [userData.prices, userData.currency, userData.outcall, userData.incall])

    const address = useMemo(() => ({
        ...userData.address,
        hidden_address: userData.hidden_address
    }), [userData.address, userData.hidden_address])

    const contactInformation = useMemo(() => ({
        phone: userData.phone,
        name: userData.name,
        viber: userData.viber,
        whatsapp: userData.whatsapp,
        telegram: userData.telegram,
        website: userData.website
    }), [userData.phone, userData.name, userData.viber, userData.whatsapp, userData.telegram, userData.website])

    const [showTextTriggeringButton, setShowTextTriggeringButton] = useState(false)
    const [moreTextShown, setMoreTextShown] = useState(false)

    const [aboutEditorVisible, setAboutEditorVisible] = useState(false)
    const [personalDetailsEditorVisible, setPersonalDetailsEditorVisible] = useState(false)
    const [pricingEditorVisible, setPricingEditorVisible] = useState(false)
    const [servicesEditorVisible, setServicesEditorVisible] = useState(false)
    const [workingHoursEditorVisible, setWorkingHoursEditorVisible] = useState(false)
    const [addressEditorVisible, setAddressEditorVisible] = useState(false)
    const [contactInformationEditorVisible, setContactInformationEditorVisible] = useState(false)

    const mapRef = useRef()

    useEffect(() => {
        if (!userData.hidden_address && mapRef.current) {
            mapRef.current.animateCamera({
                center: {
                    latitude: userData.address.lat,
                    longitude: userData.address.lng,
                },
                zoom: 13,
            }, 500)
        }
    }, [userData.address, userData.hidden_address, mapRef.current])

    const onTextLayout = (e) => {
        const element = e.nativeEvent.target
        const count = Math.floor(e.nativeEvent.layout.height / getComputedStyle(element).lineHeight.replace('px', ''))

        if (count >= 5 || isNaN(count)) {
            setShowTextTriggeringButton(true)
        }
    }

    const onContactInformationEditPress = () => {
        setContactInformationEditorVisible(true)
    }

    const onAboutEditPress = () => {
        setAboutEditorVisible(true)
    }

    const onPersonalDetailsEditPress = () => {
        setPersonalDetailsEditorVisible(true)
    }

    const onPricesEditPress = () => {
        setPricingEditorVisible(true)
    }

    const onServicesEditPress = () => {
        setServicesEditorVisible(true)
    }

    const onWorkingHoursEditPress = () => {
        setWorkingHoursEditorVisible(true)
    }

    const onAddressEditPress = () => {
        setAddressEditorVisible(true)
    }

    const loadingMapFallback = useMemo(() => {
        return (
            <View style={{ ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading</Text>
            </View>
        )
    }, [])

    const renderContactInformation = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    Contact information
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onContactInformationEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>

            <View style={[styles.row, { borderTopWidth: 1, borderColor: COLORS.lightGrey }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="badge-account-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                        Name
                    </Text>
                </View>
                <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: userData.name ? COLORS.white : COLORS.error }}>
                    {userData.name ? userData.name : 'Enter your name'}
                </Text>
            </View>
            <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="phone-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                        Phone
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: userData.phone ? COLORS.white : COLORS.error }}>
                        {userData.phone ? userData.phone : 'Enter your phone'}
                    </Text>
                    {userData.phone && userData.whatsapp && <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#108a0c', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="whatsapp" size={18} color="white" />
                    </View>}
                    {userData.phone && userData.viber && <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#7d3daf', borderRadius: '50%', marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesome5 name="viber" size={18} color="white" />
                    </View>}
                    {userData.phone && userData.telegram && <View style={{ padding: 5, width: 28, height: 28, backgroundColor: '#38a5e4', borderRadius: 30, marginLeft: SPACING.xxx_small, alignItems: 'center', justifyContent: 'center' }}>
                        <EvilIcons name="sc-telegram" size={22} color="white" />
                    </View>}
                </View>
            </View>
            {user_type === 'establishment' && <View style={styles.row}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="web" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                        Website
                    </Text>
                </View>
                <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: userData.name ? COLORS.white : COLORS.error }}>
                    {userData.website}
                </Text>
            </View>}
        </View>
    )

    const renderAbout = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    About
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onAboutEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>
            <Text style={{ color: userData.description ? COLORS.white : COLORS.error, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, lineHeight: 22 }}
                onLayout={onTextLayout}
                numberOfLines={moreTextShown ? undefined : 5}
            >
                {userData.description ? userData.description : 'Enter your description'}
            </Text>
            {
                showTextTriggeringButton && (
                    <Text
                        onPress={() => setMoreTextShown(v => !v)}
                        style={{ color: '#FFF', fontFamily: FONTS.medium, marginTop: SPACING.small, fontSize: FONT_SIZES.medium }}>
                        {moreTextShown ? 'Read less...' : 'Read more...'}
                    </Text>
                )
            }
        </View>
    )

    const renderPersonalDetails = () => (
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
            <View style={[styles.sectionHeader, { marginHorizontal: SPACING.small }]}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    Personal Details
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onPersonalDetailsEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>
            <View style={{ flex: 1, flexDirection: isSmallScreen ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'column', flex: 1, marginHorizontal: SPACING.small }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Age</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{calculateAgeFromDate(userData.date_of_birth)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Sexual orientation</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.sexuality}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Nationality</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.nationality}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Languages</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.languages.join(', ')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Height</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.height} cm</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Weight</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.weight} kg</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'column', flex: 1, marginHorizontal: SPACING.small }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Body type</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.body_type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Pubic hair</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.pubic_hair}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Breast size</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.breast_size}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Breast type</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.breast_type}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Hair color</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.hair_color}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.attributeName} numberOfLines={1}>Eye color</Text>
                        <View style={styles.attributeDivider}></View>
                        <Text style={styles.attributeValue}>{userData.eye_color}</Text>
                    </View>
                </View>
            </View>
        </View>
    )

    const renderPricing = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Pricing
                    </Text>
                    {userData.prices.length !== 0 && <Text numberOfLines={1} style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium }}>
                        • {userData.currency}
                    </Text>}
                </View>

                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onPricesEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>

            {userData.prices.length === 0 ? (
                <Text style={{ color: COLORS.greyText, fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, textAlign: 'center' }}>No pricing defined</Text>
            ) : (
                <View style={styles.table}>
                    <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]} backgroundColor={COLORS.lightGrey} hoveredBackgroundColor={COLORS.grey}>
                            <Text style={styles.tableHeaderText}>Length</Text>
                        </View>
                        {userData.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.length} {price.length > 1 ? 'hours' : 'hour'}</Text>
                            </HoverableView>
                        ))}
                    </View>
                    {userData.incall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                            <Text style={styles.tableHeaderText}>Incall</Text>
                        </View>
                        {userData.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.incall} {CURRENCY_SYMBOLS[userData.currency]}</Text>
                            </HoverableView>
                        ))}
                    </View>}
                    {userData.outcall && <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                        <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                            <Text style={styles.tableHeaderText}>Outcall</Text>
                        </View>
                        {userData.prices.map(price => (
                            <HoverableView key={price.length} style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                                <Text style={styles.tableHeaderValue}>{price.outcall} {CURRENCY_SYMBOLS[userData.currency]}</Text>
                            </HoverableView>
                        ))}
                    </View>}
                </View>
            )}
        </View>
    )

    const renderServices = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    Services
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onServicesEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {userData.services.map(service => (
                    <View key={service} style={styles.chip}>
                        <Text style={styles.chipText}>{service}</Text>
                    </View>
                ))}
            </View>
        </View>
    )

    const renderWorkingHours = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    Working Hours
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onWorkingHoursEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>
            <View style={styles.table}>
                <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                    <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]} backgroundColor={COLORS.lightGrey} hoveredBackgroundColor={COLORS.grey}>
                        <Text style={styles.tableHeaderText}>Day</Text>
                    </View>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Monday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Tuesday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Wednesday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Thursday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Friday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Saturday</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={styles.tableHeaderValue}>Sunday</Text>
                    </HoverableView>
                </View>
                <View style={{ flexBasis: 200, flexShrink: 1, flexGrow: 1 }}>
                    <View style={[styles.column, { backgroundColor: COLORS.darkRed2 }]}>
                        <Text style={styles.tableHeaderText}>Availability</Text>
                    </View>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[0].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[0].enabled ? (userData.working_hours[0].from + ' - ' + userData.working_hours[0].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[1].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[1].enabled ? (userData.working_hours[1].from + ' - ' + userData.working_hours[1].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[2].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[2].enabled ? (userData.working_hours[2].from + ' - ' + userData.working_hours[2].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[3].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[3].enabled ? (userData.working_hours[3].from + ' - ' + userData.working_hours[3].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[4].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[4].enabled ? (userData.working_hours[4].from + ' - ' + userData.working_hours[4].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[5].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[5].enabled ? (userData.working_hours[5].from + ' - ' + userData.working_hours[5].until) : 'Not available'}</Text>
                    </HoverableView>
                    <HoverableView style={styles.column} backgroundColor={COLORS.grey} hoveredBackgroundColor={COLORS.lightGrey}>
                        <Text style={[styles.tableHeaderValue, { color: userData.working_hours[6].enabled ? COLORS.white : COLORS.greyText }]}>{userData.working_hours[6].enabled ? (userData.working_hours[6].from + ' - ' + userData.working_hours[6].until) : 'Not available'}</Text>
                    </HoverableView>
                </View>
            </View>
        </View>
    )

    const renderAddress = useCallback(() => (
        <View style={[styles.section, { marginBottom: SPACING.medium }]}>
            <View style={styles.sectionHeader}>
                <Text numberOfLines={1} style={styles.sectionHeaderText}>
                    Address
                </Text>
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="pencil-outline"
                    onPress={onAddressEditPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Edit
                </Button>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginBottom: SPACING.x_small }}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.white} style={{ marginRight: 3 }} />
                <Text numberOfLines={1} style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: userData.address ? COLORS.white : COLORS.error }}>
                    {userData.address ? (userData.hidden_address ? userData.address.city : userData.address.title) : 'Enter your address'}
                </Text>
            </View>

            {!userData.hidden_address && <View style={{ width: '100%', height: 300, borderRadius: 5, overflow: 'hidden' }}>
                <MapView
                    ref={mapRef}
                    googleMapsApiKey="AIzaSyCA1Gw6tQbTOm9ME6Ru0nulUNFAOotVY3s"
                    provider="google"
                    style={{ flex: 1 }}
                    animationEnabled
                    zoomTapEnabled
                    loadingFallback={loadingMapFallback}
                    initialCamera={{
                        center: {
                            latitude: userData.address.lat,
                            longitude: userData.address.lng,
                        },
                        zoom: 13,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: userData.address.lat,
                            longitude: userData.address.lng
                        }}
                        title={userData.name}
                    >
                        <Image
                            source={require('../../assets/sport_marker.png')}
                            style={{
                                width: 30,
                                height: 30,
                                position: 'absolute',
                                top: -30,
                                left: -15
                            }}
                            resizeMode="contain"
                        />
                    </Marker>
                </MapView>
            </View>}
        </View>
    ), [userData.name, userData.address, userData.hidden_address])

    return (
        <View onLayout={(event) => setTabHeight(event.nativeEvent.layout.height)}>
            {renderContactInformation()}

            {renderAbout()}

            {user_type === 'lady' && renderPersonalDetails()}

            {user_type === 'lady' && renderPricing()}

            {user_type === 'lady' && renderServices()}

            {renderWorkingHours()}

            {renderAddress()}

            <AboutEditor visible={aboutEditorVisible} setVisible={setAboutEditorVisible} about={userData.description} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} user_type={user_type} />
            {user_type === 'lady' && <PersonalDetailsEditor visible={personalDetailsEditorVisible} setVisible={setPersonalDetailsEditorVisible} personalDetails={personalDetails} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} />}
            {user_type === 'lady' && <PricingEditor visible={pricingEditorVisible} setVisible={setPricingEditorVisible} pricing={pricing} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} />}
            {user_type === 'lady' && <ServicesEditor visible={servicesEditorVisible} setVisible={setServicesEditorVisible} services={userData.services} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} />}
            <WorkingHoursEditor visible={workingHoursEditorVisible} setVisible={setWorkingHoursEditorVisible} working_hours={userData.working_hours} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} user_type={user_type}/>
            <AddressEditor visible={addressEditorVisible} setVisible={setAddressEditorVisible} address={address} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} user_type={user_type} />
            <ContactInformationEditor visible={contactInformationEditorVisible} setVisible={setContactInformationEditorVisible} contactInformation={contactInformation} toastRef={toastRef} userId={userData.id} updateRedux={userData.establishment_id ? updateLadyInRedux : updateCurrentUserInRedux} user_type={user_type} />
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { updateCurrentUserInRedux, updateLadyInRedux })(memo(PersonalDetails))

const styles = StyleSheet.create({
    containerLarge: {
        flex: 1,
        paddingHorizontal: SPACING.large,
        flexDirection: 'row',
        backgroundColor: COLORS.lightBlack,
        justifyContent: 'center',
        overflowY: 'scroll'
    },
    containerSmall: {
        flex: 1,
        paddingHorizontal: SPACING.large,
        flexDirection: 'column'
    },
    contentLarge: {
        flexShrink: 1,
        flexGrow: 1,
        alignItems: 'flex-end',
        marginRight: SPACING.x_large,
        paddingVertical: SPACING.large
    },
    contentSmall: {
        paddingVertical: SPACING.large,
    },
    cardContainerLarge: {
        flexGrow: 1,
        flexBasis: 400,
        marginTop: SPACING.large
    },
    cardContainerSmall: {
        marginTop: SPACING.large
    },
    cardLarge: {
        width: 400,
        backgroundColor: COLORS.grey,
        borderRadius: 20,
        padding: SPACING.small,
        shadowColor: COLORS.red,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 40,
        position: 'fixed'
    },
    cardSmall: {
        backgroundColor: COLORS.grey,
        borderRadius: 20,
        padding: SPACING.small,
        shadowColor: COLORS.red,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 40,
        elevation: 40,
    },
    section: {
        marginTop: SPACING.large,
        padding: SPACING.small,
        borderRadius: 20,
        backgroundColor: COLORS.grey,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.small
    },
    sectionHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3
    },
    attributeName: {
        color: COLORS.greyText,
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    attributeValue: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium
    },
    attributeDivider: {
        flexGrow: 1,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        marginBottom: 4
    },
    serviceText: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.regular
    },
    chip: {
        marginRight: SPACING.xx_small,
        backgroundColor: COLORS.darkRed2,
        paddingHorizontal: SPACING.xx_small,
        paddingVertical: 5,
        borderRadius: 10,
        borderColor: COLORS.lightGrey,
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xx_small
    },
    chipText: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    table: {
        borderWidth: 1,
        borderColor: COLORS.lightGrey,
        flexDirection: 'row',
        borderRadius: 5,
        overflow: 'hidden'
    },
    tableHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium
    },
    tableHeaderValue: {
        color: '#FFF',
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium
    },
    column: {
        padding: SPACING.xx_small
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.small,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey
    }
})