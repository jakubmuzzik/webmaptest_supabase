import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES } from '../constants'
import HoverableView from '../components/HoverableView'
import { MaterialIcons } from '@expo/vector-icons'
import { normalize, getParam, stripEmptyParams } from '../utils'
import { Image } from 'expo-image'
import {
    ACTIVE,
    SELECT_CITY,
    translateLabels
} from '../labels'
import ContentLoader, { Rect } from "react-content-loader/native"

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay
} from 'react-native-reanimated'

import RenderLady from '../components/list/RenderLady'
import { LinearGradient } from 'expo-linear-gradient'
import { useSearchParams, Link } from 'react-router-dom'
import { resetLadiesPaginationData, updateCurrentLadiesCount } from '../redux/actions'
import { supabase } from '../supabase/config'

import Login from '../components/modal/Login'
import Signup from '../components/modal/Signup'
import { connect } from 'react-redux'

import HoverableCategoryCard from '../components/animated/HoverableCategoryCard'

const Home = ({ resetLadiesPaginationData, updateCurrentLadiesCount }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const labels = useMemo(() => translateLabels(params.language, [
        SELECT_CITY
    ]), [params.language])

    const [loginVisible, setLoginVisible] = useState(false)
    const [signUpVisible, setSignUpVisible] = useState(false)
    const [newLadies, setNewLadies] = useState()
    const [selectedCategory, setSelectedCategory] = useState('Ladies')

    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)

    const headerTitleTranslateY = useSharedValue(10)
    const headerTitleOpacity = useSharedValue(0)
    const headerSubTitleTranslateY = useSharedValue(20)
    const headerSubTitleOpacity = useSharedValue(0)
    const headerExploreButtonTranslateY = useSharedValue(30)
    const headerExploreButtonOpacity = useSharedValue(0)
    const headerSignUpButtonTranslateY = useSharedValue(30)
    const headerSignUpButtonOpacity = useSharedValue(0)

    const headerTitleAnimatedStyle = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.bold,
            fontSize: normalize(45),
            color: '#FFF',
            textAlign: 'center',
            opacity: headerTitleOpacity.value,
            transform: [{ translateY: headerTitleTranslateY.value }],
        }
    })

    const headerSubTitleAnimatedStyle = useAnimatedStyle(() => {
        return {
            maxWidth: 600,
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            color: COLORS.greyText,
            marginTop: 0,
            textAlign: 'center',
            opacity: headerSubTitleOpacity.value,
            transform: [{ translateY: headerSubTitleTranslateY.value }],
        }
    })

    const headerExploreButtonAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: headerExploreButtonOpacity.value,
            transform: [{ translateY: headerExploreButtonTranslateY.value }],
        }
    })

    const headerSignUpButtonAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: headerSignUpButtonOpacity.value,
            transform: [{ translateY: headerSignUpButtonTranslateY.value }],
        }
    })

    useEffect(() => {
        headerTitleTranslateY.value = withTiming(0, {
            duration: 300,
            useNativeDriver: true
        })
        headerTitleOpacity.value = withTiming(1, {
            duration: 500,
            useNativeDriver: true
        })
        headerSubTitleTranslateY.value = withDelay(50, withTiming(0, {
            duration: 300,
            useNativeDriver: true
        }))
        headerSubTitleOpacity.value = withDelay(50, withTiming(1, {
            duration: 500,
            useNativeDriver: true
        }))
        headerExploreButtonTranslateY.value = withDelay(100, withTiming(0, {
            duration: 300,
            useNativeDriver: true
        }))
        headerExploreButtonOpacity.value = withDelay(100, withTiming(1, {
            duration: 500,
            useNativeDriver: true
        }))
        headerSignUpButtonTranslateY.value = withDelay(150, withTiming(0, {
            duration: 300,
            useNativeDriver: true
        }))
        headerSignUpButtonOpacity.value = withDelay(150, withTiming(1, {
            duration: 500,
            useNativeDriver: true
        }))

        init()
    }, [])

    const init = async () => {
        try {
            const { data, error } = await supabase
                .from('ladies')
                .select('*, images(*), videos(*)')
                .match({ status: ACTIVE })
                .order('created_date', { descending: true })
                .limit(30)

            if (error) {
                throw error
            }

            setNewLadies(data)
        } catch (error) {
            console.error(error)
        }
    }

    const onLoginPress = () => {
        setSignUpVisible(false)
        setLoginVisible(true)
    }

    const onSignUpPress = () => {
        setLoginVisible(false)
        setSignUpVisible(true)
    }

    const renderNewLadiesSkeleton = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: SPACING.medium }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: SPACING.page_horizontal }}>
            <View style={{ width: 150, aspectRatio: 3 / 4, borderRadius: 10 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center', }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, aspectRatio: 3 / 4, marginLeft: SPACING.large }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
            <View style={{ width: 150, marginLeft: SPACING.large, aspectRatio: 3 / 4 }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width='100%'
                    style={{ borderRadius: 10, alignSelf: 'center' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>
        </ScrollView>
    )

    const onExploreClick = () => {
        //TODO - check user's city on background and update params with the city... 
        // put it conditionally to the link
        resetLadiesPaginationData()
        updateCurrentLadiesCount()
    }

    const onViewAllNewLadiesClick = () => {
        //TODO - check user's city on background and update params with the city... 
        //TODO - put sort param to the LINK
        resetLadiesPaginationData()
        updateCurrentLadiesCount()
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightBlack }} onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
            <View style={{ marginBottom: SPACING.medium }}>
                <ImageBackground
                    //source={require('../assets/th.png')}
                    style={{
                        width: '100%',
                        height: 500,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        borderBottomRightRadius: 10,
                        borderBottomLeftRadius: 10,
                        overflow: 'hidden',
                    }}
                    imageStyle={{ opacity: 0.6 }}
                    resizeMode='cover'
                >
                    <LinearGradient
                        colors={['rgba(22,22,22,0)', COLORS.lightBlack]}
                        style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center' }}
                    />

                    <View style={{ padding: SPACING.xx_large, paddingBottom: SPACING.xxxx_large }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.medium }}>
                            <Animated.Text style={headerTitleAnimatedStyle}>
                                Find and Book a Perfect Lady
                            </Animated.Text>
                            <Animated.Text style={headerSubTitleAnimatedStyle}>
                                A marvel of engineering and design, the DroneX was build to go wherever adventure takes you. This ultraportable and foldable drone features high-end flight.
                            </Animated.Text>
                        </View>
                        <View style={{ alignItems: 'center', flexDirection: "row", justifyContent: 'center', marginTop: SPACING.x_large, }}>
                            <Animated.View style={headerExploreButtonAnimatedStyle}>
                                <HoverableView style={{
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#360303',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    marginRight: SPACING.xx_small
                                }}
                                    backgroundColor='rgba(140, 7, 7, .85)'
                                    hoveredBackgroundColor='rgba(140, 7, 7, .95)'
                                >
                                    <LinearGradient
                                        colors={[COLORS.red, COLORS.darkRed]}
                                        style={{ ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' }}
                                    />
                                    <Link
                                        onClick={onExploreClick}
                                        style={{
                                            textDecoration: 'none',
                                        }}
                                        to={{
                                            pathname: '/esc',
                                            search: new URLSearchParams(stripEmptyParams({ language: params.language })).toString()
                                        }}
                                        state={{ clearRedux: true }}
                                    >
                                        <View style={{
                                            flexDirection: 'row',
                                            paddingHorizontal: SPACING.small,
                                            paddingVertical: SPACING.xx_small,
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Text style={{ fontFamily: FONTS.medium, fontSize: normalize(18), color: '#FFF', marginHorizontal: SPACING.xx_small }}>
                                                Explore
                                            </Text>
                                            <MaterialIcons name="keyboard-arrow-right" size={normalize(25)} color="white" />
                                        </View>
                                    </Link>
                                </HoverableView>
                            </Animated.View>

                            <Animated.View style={headerSignUpButtonAnimatedStyle}>
                                <HoverableView
                                    style={{
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: '#FFF',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        marginLeft: SPACING.xx_small
                                    }}
                                    backgroundColor='rgba(255,255,255,0.1)'
                                    hoveredBackgroundColor='rgba(255,255,255,0.2)'
                                >
                                    <TouchableOpacity
                                        onPress={() => setSignUpVisible(true)}
                                        style={{
                                            paddingHorizontal: SPACING.small,
                                            paddingVertical: SPACING.xx_small
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: normalize(18), color: '#FFF', marginHorizontal: SPACING.xx_small }}>
                                            Join us
                                        </Text>
                                    </TouchableOpacity>
                                </HoverableView>
                            </Animated.View>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            <View style={{ paddingVertical: SPACING.medium }}>
                <View style={{ paddingHorizontal: SPACING.page_horizontal, flexDirection: 'row', alignItems: 'center' }}>
                    <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h2, color: '#FFF', marginRight: SPACING.small }}>
                        New ladies
                    </Text>
                    <HoverableView
                        style={{
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: '#FFF',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}
                        backgroundColor='rgba(255,255,255,0.1)'
                        hoveredBackgroundColor='rgba(255,255,255,0.2)'
                    >
                        <Link
                            onClick={onViewAllNewLadiesClick}
                            style={{
                                textDecoration: 'none',

                            }}
                            to={{
                                pathname: '/esc',
                                search: new URLSearchParams(stripEmptyParams({ language: params.language })).toString()
                            }}
                            state={{ clearRedux: true }}
                        >
                            <View style={{ paddingHorizontal: SPACING.xxx_small, paddingVertical: 4, flexDirection: "row", alignItems: 'center' }}>
                                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.small, color: COLORS.white, marginHorizontal: SPACING.xxx_small }}>
                                    View all
                                </Text>
                                <MaterialIcons name="keyboard-arrow-right" size={normalize(20)} color={COLORS.white} />
                            </View>
                        </Link>
                    </HoverableView>
                </View>

                {newLadies != null && newLadies.length > 0 && <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={newLadies}
                    contentContainerStyle={{ paddingHorizontal: SPACING.page_horizontal, flexGrow: 1, marginTop: SPACING.medium }}
                    initialNumToRender={30}
                    renderItem={({ item, index }) => (
                        <View key={item.id} style={{ marginLeft: index === 0 ? 0 : SPACING.large, width: 150 }}>
                            <RenderLady lady={item} width={150} delay={index * 20} />
                        </View>
                    )}
                />}
                {newLadies == null && renderNewLadiesSkeleton()}
            </View>

            <View style={{ paddingVertical: SPACING.large, marginTop: SPACING.medium }}>
                <View style={{ paddingHorizontal: SPACING.page_horizontal }}>
                    <Text style={{ textAlign: 'center', fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: COLORS.white }}>
                        Random selection from our categories
                    </Text>
                    <View style={{ marginTop: SPACING.large, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <HoverableCategoryCard contentWidth={contentWidth} selected={selectedCategory === 'Ladies'} onCategoryPress={setSelectedCategory} categoryName="Ladies" imagePath={require('../assets/lady.jpg')} />
                        <HoverableCategoryCard contentWidth={contentWidth} selected={selectedCategory === 'Massages'} onCategoryPress={setSelectedCategory} categoryName="Massages" imagePath={require('../assets/lady.jpg')} />
                        <HoverableCategoryCard contentWidth={contentWidth} selected={selectedCategory === 'Establishments'} onCategoryPress={setSelectedCategory} categoryName="Establishments" imagePath={require('../assets/establishment.jpg')} />
                    </View>
                </View>
            </View>

            <Login visible={loginVisible} setVisible={setLoginVisible} onSignUpPress={onSignUpPress} />
            <Signup visible={signUpVisible} setVisible={setSignUpVisible} onLoginPress={onLoginPress} />
        </View>
    )
}

export default connect(null, { updateCurrentLadiesCount, resetLadiesPaginationData })(Home)