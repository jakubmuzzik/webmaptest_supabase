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
import { normalize, stripEmptyParams, getParam } from '../../../utils'
import { Image } from 'expo-image'
import { MotiView } from 'moti'
import LottieView from 'lottie-react-native'
import { Button } from 'react-native-paper'
import { useSearchParams, useNavigate } from 'react-router-dom'

const LadyRegistrationCompleted = ({ independent, visible, toastRef }) => {
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
        }
    })

    const onContinuePress = () => {
        navigate({
            pathname: independent ? '/account' : '/account/ladies',
            search: new URLSearchParams(stripEmptyParams({ language: params.language })).toString()
        })

        if (!independent) {
            toastRef.current.show({
                type: 'success',
                text: 'Lady was successfully submitted for review.'
            })
        }
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
                contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}
            >
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

                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.x_large, textAlign: 'center', marginBottom: SPACING.xx_small }}>
                    Profile has been submitted for review!
                </Text>

                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.x_large, textAlign: 'center' }}>
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
            </Animated.ScrollView>
        </>
    )
}

export default memo(LadyRegistrationCompleted)

const styles = StyleSheet.create({
    pageHeaderText: {
        //color: '#FFF', 
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        //marginBottom: SPACING.small,
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
        backgroundColor: '#FFF',
        zIndex: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5
    },
})