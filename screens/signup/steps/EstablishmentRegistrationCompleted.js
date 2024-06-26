import React, { memo, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES, SUPPORTED_LANGUAGES } from '../../../constants'
import { normalize, getParam, stripEmptyParams } from '../../../utils'
import { Image } from 'expo-image'
import { MotiView } from 'moti'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from 'react-native-paper'
import LottieView from 'lottie-react-native'

import { LinearGradient } from 'expo-linear-gradient'

const EstablishmentRegistrationCompleted = ({ visible, email }) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const scrollY = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
            color: COLORS.white,
            backgroundColor: COLORS.grey//'#261718'
        }
    })

    const onContinuePress = () => {
        navigate({
            pathname: '/account',
            search: new URLSearchParams(stripEmptyParams({ language: params.language })).toString()
        })
    }

    return (
        <>
            <View style={styles.modal__header}>
                <Animated.Text style={modalHeaderTextStyles}>Registration completed</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView
                scrollEventThrottle={1}
                onScroll={scrollHandler}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: SPACING.small }}
            >
                {/* <LinearGradient colors={[
                    '#221718',//'#4b010140',//COLORS.darkRedBackground,
                   '#261718',
                ]}
                    style={{ position: 'absolute', width: '100%', height: 300 }}
                /> */}

                <View style={{ paddingTop: SPACING.xxxxx_large }}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: SPACING.x_large, }}>
                        <Text style={styles.pageHeaderText}>
                            Registration completed
                        </Text>
                        <Image
                            resizeMode='contain'
                            source={require('../../../assets/completed.svg')}
                            style={{ width: FONT_SIZES.h3, height: FONT_SIZES.h3, marginLeft: SPACING.xx_small }}
                        />
                    </View>

                    {visible && <MotiView
                        style={{ flex: 1 }}
                        from={{
                            transform: [{ scale: 0 }]
                        }}
                        animate={{
                            transform: [{ scale: 1 }],
                        }}
                        transition={{
                            delay: 50,
                        }}
                    >
                        <LottieView
                            style={{ width: 150, alignSelf: 'center' }}
                            autoPlay
                            loop
                            source={require('../../../assets/verifying.json')}
                        />
                    </MotiView>}

                    <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.x_large, textAlign: 'center', marginBottom: SPACING.xx_small, color: COLORS.white }}>
                        Your establishment has been submitted for review!
                    </Text>

                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.x_large, textAlign: 'center', color: COLORS.placeholder }}>
                        All profiles go through a review before they become visible. As soon as we will review it, you will receive a confirmation email.
                    </Text>

                    <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ marginTop: SPACING.large, borderRadius: 10, width: 200, alignSelf: 'center' }}
                        buttonColor={COLORS.red}
                        rippleColor="rgba(220, 46, 46, .16)"
                        mode="contained"
                        onPress={onContinuePress}
                    >
                        Continue
                    </Button>
                </View>
            </Animated.ScrollView>
        </>
    )
}

export default memo(EstablishmentRegistrationCompleted)

const styles = StyleSheet.create({
    pageHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        textAlign: 'center'
    },
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal__shadowHeader: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        backgroundColor: COLORS.white,
        zIndex: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5
    },
})