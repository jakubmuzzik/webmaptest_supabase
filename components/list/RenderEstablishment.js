import React, { memo, useState, useRef, useMemo, useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES } from "../../constants"
import { normalize, stripEmptyParams, getParam } from "../../utils"
import { Image } from 'expo-image'
import { isBrowser } from 'react-device-detect'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { useSearchParams, Link } from 'react-router-dom'

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay
} from 'react-native-reanimated'

const RenderEstablishment = ({ establishment, width, delay = 0, animate=true }) => {
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
            opacity.value = withDelay(delay,withTiming(1, {
                useNativeDriver: true
            }))
        }
    }, [])

    return (
        <Animated.View style={containerAnimatedStyle}>
            <Link to={{ pathname: '/establishment/' + establishment.id, search: new URLSearchParams(stripEmptyParams(params)).toString() }} state={{ establishment }}>
                <View style={{ flex: 1 }}
                    onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
                    onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
                >
                    <Image
                        style={{
                            borderRadius: 10,
                            overflow: 'hidden',
                            aspectRatio: 16 / 9,
                            width
                        }}
                        source={establishment.images[0].download_url}
                        placeholder={establishment.images[0].blurhash}
                        resizeMode="cover"
                        transition={200}
                        alt={establishment.name}
                    />
                </View>
            </Link>

            <Text numberOfLines={1} style={{ textAlign: 'center', fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.white, marginTop: SPACING.x_small }}>
                {establishment.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="map-marker" size={FONT_SIZES.medium} color={COLORS.greyText} style={{ marginRight: 3 }} />
                <Text numberOfLines={1} style={{ textAlign: 'center', fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, color: COLORS.greyText }}>
                    {establishment.address.city}
                </Text>
            </View>    
        </Animated.View>
    )
}

export default memo(RenderEstablishment)

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