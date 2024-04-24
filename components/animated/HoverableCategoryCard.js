import React, { useState, memo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { isBrowser } from 'react-device-detect'
import { COLORS, SPACING, FONT_SIZES, FONTS } from '../../constants'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

const HoverableCategoryCard = ({ selected, imagePath, categoryName, contentWidth, onCategoryPress, categoryCardNameFontSize }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <TouchableOpacity
            style={{
                width: 150,
                flexShrink:1,
                transitionDuration: '150ms',
                borderRadius: 15,
                overflow: 'hidden',
                marginHorizontal: SPACING.small
            }}
            activeOpacity={1}
            onPress={() => onCategoryPress(categoryName)}
            onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
            onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
        >
            <View
                style={{
                    aspectRatio: 3 / 4,
                    maxWidth: contentWidth / 4,
                    borderWidth: 2,
                    borderColor: (isHovered || selected) ? COLORS.darkRed : COLORS.darkGrey,
                    borderRadius: 15
                }}
            >
                <Image
                    style={{
                        borderRadius: 15,
                        overflow: 'hidden',
                        flex: 1,
                        ...StyleSheet.absoluteFill,
                        opacity: (isHovered || selected) ? 1 : 0.6
                    }}
                    source={imagePath}
                    resizeMode="cover"
                //alt={lady.name}
                />
            </View>
            <LinearGradient
                colors={['rgba(22,22,22,0)', COLORS.lightBlack]}
                style={{ position: 'absolute', bottom: 0, width: '100%', height: '50%' }}
                locations={[0, 0.75]}
            />
            <View style={{ flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', flex: 1, marginTop: -SPACING.medium }}>
                <Text style={{ transitionDuration: '250ms', opacity: (isHovered || selected) ? '1' : '0', color: COLORS.white, fontFamily: FONTS.bold, fontSize: categoryCardNameFontSize > FONT_SIZES.large ? FONTS.large : categoryCardNameFontSize , textAlign: 'center' }}>
                    {categoryName}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default memo(HoverableCategoryCard)