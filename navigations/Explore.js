import React, { useEffect, useRef, useMemo } from 'react'
import { View, Text } from 'react-native'
import Header from '../components/navigation/Header'
import Categories from '../components/navigation/Categories'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { COLORS, FONTS, FONT_SIZES, SUPPORTED_LANGUAGES, SPACING } from '../constants'
import { normalize, getParam } from '../utils'
import Animated, { withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated'
import SwappableText from '../components/animated/SwappableText'
import { connect } from 'react-redux'
import ContentLoader, { Rect } from "react-content-loader/native"
import { BlurView } from 'expo-blur'

const Explore = ({ currentLadiesCount, currentMasseusesCount, currentEstablishmentsCount }) => {
    const [searchParams] = useSearchParams()

    const location = useLocation()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        city: searchParams.get('city')
    }), [searchParams, location.pathname])

    const previousScrollY = useRef(window.scrollY)
    const positiveScrollYDelta = useRef(0)

    const translateY = useSharedValue(0)
    const opacity = useSharedValue(1)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > previousScrollY.current) {
                positiveScrollYDelta.current += window.scrollY - previousScrollY.current
            } else {
                positiveScrollYDelta.current = 0

                if (translateY.value < 0) {
                    translateY.value = withTiming(0, {
                        useNativeDriver: true
                    })
                    opacity.value = withTiming(1, {
                        useNativeDriver: true
                    })
                }
            }

            previousScrollY.current = window.scrollY

            if (positiveScrollYDelta.current >= normalize(70) && window.scrollY > 200 && translateY.value === 0) {
                translateY.value = withTiming(-normalize(70), {
                    useNativeDriver: true
                })
                opacity.value = withTiming(0, {
                    useNativeDriver: true
                })
            }
        }

        document.addEventListener("scroll", handleScroll)

        return () => {
            document.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const containersStyle = useAnimatedStyle(() => {
        return {
            position: 'fixed', 
            zIndex: 1, 
            transform: [{ translateY: translateY.value }], 
            width: '100%', 
            flexDirection: 'column', 
            backgroundColor: 'transparent',
            top: normalize(70),
            opacity: opacity.value
        }
    })

    const currentDataCount = location.pathname === '/esc' ? currentLadiesCount : location.pathname === '/mas' ? currentMasseusesCount : currentEstablishmentsCount

    const getDataCountText = () => {
        if (currentDataCount === 1) {
            return location.pathname === '/esc' ? currentDataCount + ' lady' : location.pathname === '/mas' ? currentDataCount + ' masseuse' : currentDataCount + ' establishment'
        } else {
            return location.pathname === '/esc' ? currentDataCount + ' ladies' : location.pathname === '/mas' ? currentDataCount + ' masseuses' : currentDataCount + ' establishments'
        }
    }

    const animatedHeaderText = () => {
        return (
            <View style={{ marginTop: SPACING.large }}>
                <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                    <SwappableText 
                        value={params.city ? params.city : 'Anywhere'} 
                        style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium, textAlign: 'center' }} 
                    />

                    <Text
                        style={{ color: COLORS.red, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium, textAlign: 'center' }}
                    >
                        &nbsp;•&nbsp;
                    </Text>

                    {isNaN(currentDataCount) && <ContentLoader
                        speed={2}
                        height={FONT_SIZES.large}
                        width={80}
                        style={{ borderRadius: 5 }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={FONT_SIZES.large} />
                    </ContentLoader>}

                    {!isNaN(currentDataCount) && (
                        <SwappableText
                            value={getDataCountText()}
                            style={{ color: COLORS.greyText, fontSize: FONT_SIZES.large, fontFamily: FONTS.medium, textAlign: 'center' }}
                        />
                    )}
                </View>

                <SwappableText 
                    value={location.pathname === '/esc' ? 'Ladies' : location.pathname === '/mas' ? 'Massages' : 'Establishments'} 
                    style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, color: '#FFF', textAlign: 'center' }}
                    duration={200}
                />
            </View>
        )
    }

    return (
        <>
            <Animated.View style={containersStyle}>
                <BlurView>
                    <Categories />
                </BlurView>
            </Animated.View>

            <View style={{ marginTop: normalize(62.5), flexGrow: 1 }}>
                {animatedHeaderText()}

                <Outlet />
            </View>
        </>
    )
}

const mapStateToProps = (store) => ({
    currentLadiesCount: store.appState.currentLadiesCount, 
    currentMasseusesCount: store.appState.currentMasseusesCount, 
    currentEstablishmentsCount: store.appState.currentEstablishmentsCount
})

export default connect(mapStateToProps)(Explore)