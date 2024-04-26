import React, { useCallback, useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, Dimensions } from 'react-native'
import { AntDesign, Entypo, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons'
import { COLORS, FONT_SIZES, FONTS, SPACING, SMALL_SCREEN_THRESHOLD, LARGE_SCREEN_THRESHOLD } from '../../constants'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { normalize, stripEmptyParams, getParam } from '../../utils'
import { SUPPORTED_LANGUAGES } from '../../constants'
import { CITY, ANYWHERE, SELECT_CITY, SEARCH, CZECH, translateLabels } from '../../labels'

import HoverableView from '../../components/HoverableView'
import Filters from '../modal/Filters'
import CityPicker from '../modal/CityPicker'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { connect } from 'react-redux'
import { updateCurrentLadiesCount, updateCurrentEstablishmentsCount, updateCurrentMasseusesCount, resetLadiesPaginationData, resetMasseusesPaginationData, resetEstablishmentsPaginationData } from '../../redux/actions'

import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom'

const Categories = ({ cities = [], updateCurrentLadiesCount, updateCurrentEstablishmentsCount, updateCurrentMasseusesCount, resetLadiesPaginationData, resetMasseusesPaginationData, resetEstablishmentsPaginationData }) => {
    const [searchParams] = useSearchParams()

    const [index, setIndex] = useState(0)
    const [routes, setRoutes] = useState([
        {
            path: '/esc',
            title: 'Ladies',
            key: 'esc',
            icon: (focused) => <Image
                style={{
                    height: 30,
                    width: 30,
                    tintColor: focused ? COLORS.white : 'rgba(255,255,255,0.7)'
                }}
                source={require('../../assets/lady-icon.png')}
                resizeMode="contain"
            />
        },
        {
            path: '/mas',
            title: 'Massages',
            key: 'mas',
            icon: (focused) => <Image
                style={{
                    height: 30,
                    width: 30,
                    tintColor: focused ? COLORS.white : 'rgba(255,255,255,0.7)',
                    marginRight: 5
                }}
                source={require('../../assets/massage-icon2.png')}
                resizeMode="contain"
            />
        },
        {
            path: '/clu',
            title: 'Establishments',
            key: 'clu',
            icon: (focused) => <Image
                style={{
                    height: 30,
                    width: 30,
                    tintColor: focused ? COLORS.white : 'rgba(255,255,255,0.7)',
                    marginRight: 5
                }}
                source={require('../../assets/ladies.png')}
                resizeMode="contain"
            />
        }
    ].map((route, index) => ({ ...route, index })))

    let location = useLocation()
    const navigate = useNavigate()
    const routeName = location.pathname.substring(1)

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        city: searchParams.get('city'),
        page: searchParams.get('page') && !isNaN(searchParams.get('page')) ? searchParams.get('page') : 1
    }), [searchParams, cities])

    const labels = useMemo(() => translateLabels(params.language, [
        CZECH,
        CITY,
        SELECT_CITY,
        SEARCH,
        ANYWHERE
    ]), [params.language])

    const filtersRef = useRef()

    useLayoutEffect(() => {
        const newIndex = routes.find(route => route.path === location.pathname)?.index
        setIndex(newIndex ?? 0)
    }, [location])

    //close modals when changing language, city etc...
    useEffect(() => {
        setFiltersVisible(false)
        setLocationModalVisible(false)
        if (filtersRef.current) {
            setFiltersCount(Object.keys(filtersRef.current.filterParams).length)
        }
    }, [searchParams])

    const { width } = useWindowDimensions()
    const isSmallScreen = width <= SMALL_SCREEN_THRESHOLD
    const isLargeScreen = width >= LARGE_SCREEN_THRESHOLD

    const [filtersVisible, setFiltersVisible] = useState(false)
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [filtersCount, setFiltersCount] = useState(0)

    const leftCategoryScrollOpacity = useSharedValue(0)
    const rightCategoryScrollOpacity = useSharedValue(1)
    const leftCategoryScrollOpacityStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: 0,
            width: normalize(30),
            height: '100%',
            opacity: withTiming(leftCategoryScrollOpacity.value, {
                duration: 200,
            }),
        }
    })
    const rightCategoryScrollOpacityStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            right: 0,//SPACING.medium,
            width: normalize(30),
            height: '100%',
            opacity: withTiming(rightCategoryScrollOpacity.value, {
                duration: 200,
            }),
        }
    })

    const onCategoryScroll = useCallback((event) => {
        //reached left side
        if (event.nativeEvent.contentOffset.x === 0) {
            leftCategoryScrollOpacity.value = 0
        } else if (leftCategoryScrollOpacity.value !== 1) {
            //scrolled from left side
            leftCategoryScrollOpacity.value = 1
        }

        //reached right side
        if (event.nativeEvent.layoutMeasurement.width + event.nativeEvent.contentOffset.x === event.nativeEvent.contentSize.width) {
            rightCategoryScrollOpacity.value = 0
        } else if (rightCategoryScrollOpacity.value !== 1) {
            //scrolled from right side
            rightCategoryScrollOpacity.value = 1
        }
    }, [])

    const onFiltersPress = () => {
        setFiltersVisible(true)
    }

    const onTabPress = ({ route, preventDefault }) => {
        preventDefault()

        setIndex(routes.indexOf(route))

        //reset current profile data that's exposed to Explore component
        if (route.key === 'esc') {
            updateCurrentLadiesCount()
            resetLadiesPaginationData()
        } else if (route.key === 'mas') {
            updateCurrentMasseusesCount()
            resetMasseusesPaginationData()
        } else if (route.key === 'clu') {
            updateCurrentEstablishmentsCount()
            resetEstablishmentsPaginationData()
        }

        navigate({
            pathname: route.path,
            search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city })).toString()
        })
    }

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'red' }}
            style={{ backgroundColor: 'transparent' }}
            tabStyle={{ width: 'auto' }}
            scrollEnabled={true}
            renderLabel={({ route, focused, color }) => (
                // <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: focused ? '#FFF' : 'rgba(255,255,255,0.7)' }}>
                //     {route.title}
                // </Text>
                <Link style={{ textDecoration: 'none' }} to={{ pathname: route.path, search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city })).toString() }}>
                    <View style={styles.categoryContainer}>
                        {route.icon(focused)}
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: focused ? '#FFF' : 'rgba(255,255,255,0.7)' }}>
                            {route.title}
                        </Text>
                    </View>
                </Link>
            )}
            onTabPress={onTabPress}
        />
    )

    return (
        <View style={{
            flex: 1, 
            backgroundColor: '#1b0404a3',//'#1b0404bf',//'#1b0404a3', 
            borderTopWidth: 1, 
            borderColor: COLORS.lightGrey, 
            flexDirection: 'row'
        }}>

            <View style={{ flex: 1, flexDirection: 'row', marginHorizontal: SPACING.page_horizontal }}>
                <TabView
                    renderTabBar={renderTabBar}
                    swipeEnabled={false}
                    navigationState={{ index, routes }}
                    renderScene={() => undefined}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* <HoverableView style={{ marginHorizontal: SPACING.x_small }} hoveredOpacity={0.7}>
                    <TouchableOpacity style={styles.locationWrapper} activeOpacity={0.8}
                        onPress={() => setLocationModalVisible(true)}
                    >
                        <Ionicons style={{ paddingRight: isLargeScreen ? SPACING.xx_small : 0 }} name="md-location-sharp" size={normalize(30)} color={COLORS.red} />
                        {isLargeScreen && <View style={styles.locationWrapper__text}>
                            <Text style={styles.locationHeader}>{params.city ? labels.CITY : 'Select a city'}</Text>
                            <Text style={styles.locationValue} numberOfLines={1}>{params.city}</Text>
                        </View>}
                        <MaterialIcons style={{ paddingLeft: isLargeScreen ? SPACING.xx_small : 0 }} name="keyboard-arrow-down" size={normalize(24)} color={COLORS.red} />
                    </TouchableOpacity>
                </HoverableView> */}

                <HoverableView hoveredBackgroundColor={COLORS.lightGrey} style={{ justifyContent: 'center', alignItems: 'flex-end', borderWidth: 2, borderRadius: 12, borderColor: filtersCount > 0 ? COLORS.red : COLORS.hoveredLightGrey, marginRight: SPACING.page_horizontal }}>
                    <TouchableOpacity onPress={onFiltersPress} style={{ paddingHorizontal: SPACING.xx_small, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            resizeMode="contain"
                            source={require('../../assets/icons/filter.svg')}
                            tintColor='#FFF'
                            style={{
                                width: normalize(18),
                                height: normalize(18)
                            }}
                        />
                        {!isSmallScreen && <Text style={{ marginLeft: SPACING.xx_small, fontFamily: FONTS.medium, letterSpacing: 1, fontSize: FONT_SIZES.medium, color: '#FFF' }}>
                            Filters
                        </Text>}
                        {filtersCount > 0 && <View style={{ position: 'absolute', top: normalize(-9, true), right: normalize(-9, true), backgroundColor: COLORS.red, borderRadius: '50%', width: normalize(20), height: normalize(20), alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#FFF', fontFamily: FONTS.medium, fontSize: FONT_SIZES.small }}>{filtersCount}</Text>
                        </View>}
                    </TouchableOpacity>
                </HoverableView>
            </View>

            <Filters ref={filtersRef} visible={filtersVisible} setVisible={setFiltersVisible} />
            {/* <CityPicker visible={locationModalVisible} cities={cities} setVisible={setLocationModalVisible} params={params} routeName={routeName} /> */}
        </View>
    )
}

const mapStateToProps = (store) => ({
    cities: store.appState.cities
})

export default connect(mapStateToProps, { updateCurrentLadiesCount, updateCurrentEstablishmentsCount, updateCurrentMasseusesCount, resetLadiesPaginationData, resetMasseusesPaginationData, resetEstablishmentsPaginationData })(Categories)

const styles = StyleSheet.create({
    categoryContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingVertical: 5
    },
    selectedCategoryContainer: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.red
    },
    locationWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    locationWrapper__text: {
        flexDirection: 'column'
    },
    locationHeader: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.medium,
        color: '#FFF'
    },
    locationValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.medium,
        color: '#FFF'
    },
})