import React, { memo, useState, useRef, useMemo, useEffect } from "react"
import { StyleSheet, Text, View, FlatList } from "react-native"
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES } from "../../constants"
import { normalize, stripEmptyParams, getParam, calculateAgeFromDate } from "../../utils"
import { Image } from 'expo-image'
import { isBrowser } from 'react-device-detect'

import { useSearchParams, Link } from 'react-router-dom'

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring
} from 'react-native-reanimated'

const RenderLady = ({ lady, width, delay = 0, animate=true }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [isHovered, setIsHovered] = useState(false)

    const translateY = useSharedValue(animate ? 20 : 0)
    const opacity = useSharedValue(animate ? 0 : 1)

    const containerAnimatedStyle = useAnimatedStyle(() => {
        return {
            flexDirection: 'column',
            flexGrow: 1,
            borderRadius: 10,
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        }
    })

    useEffect(() => {
        if (animate) {
            translateY.value = withDelay(delay, withTiming(0, {
                useNativeDriver: true
            }))
            opacity.value = withDelay(delay, withTiming(1, {
                useNativeDriver: true
            }))
        }
    }, [])



    return (
        <Animated.View style={containerAnimatedStyle}>
            <Link to={{ pathname: '/lady/' + lady.id, search: new URLSearchParams(stripEmptyParams(params)).toString() }} state={{ lady }}>
                <View style={{ flex: 1 }}
                    onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
                    onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
                >
                    <Image
                        style={{
                            borderRadius: 10,
                            overflow: 'hidden',
                            aspectRatio: 3 / 4,
                            width
                        }}
                        source={lady.images[0]?.download_url}
                        placeholder={lady.images[0]?.blurhash}
                        resizeMode="cover"
                        transition={200}
                        alt={lady.name}
                    />
                </View>
            </Link>

            <Text numberOfLines={1} style={{ textAlign: 'center', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.white, marginTop: SPACING.x_small }}>
                {lady.name}
            </Text>
            <Text numberOfLines={1} style={{ textAlign: 'center', fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, color: COLORS.greyText }}>
                {calculateAgeFromDate(lady.date_of_birth) + ' years'} <Text style={{ color: COLORS.red }}>•</Text> {lady.address.city}
            </Text>
        </Animated.View>
    )
}

export default memo(RenderLady)

const styles = StyleSheet.create({
    container: {
        //padding: SPACING.xx_small, 
        flexDirection: 'column',
        flexGrow: 1,
        //backgroundColor: COLORS.grey,
        borderRadius: 10,
        //marginRight: SPACING.large
    },
})