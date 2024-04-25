import React, { useState, memo } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { isBrowser } from 'react-device-detect'
import { COLORS, SPACING, FONT_SIZES, FONTS } from '../../constants'

import { LinearGradient } from 'expo-linear-gradient'

const HoverableCategoryCard = ({ selected, imagePath, categoryName, contentWidth, onCategoryPress, categoryCardNameFontSize }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <View style={{
            flexDirection: 'column', width: 150,
            flexShrink: 1, marginHorizontal: SPACING.small,
        }}>
            <TouchableOpacity
                style={{

                    transitionDuration: '150ms',
                    borderRadius: 15,
                    overflow: 'hidden',

                    cursor: 'default'
                }}
                activeOpacity={1}
                onPress={() => onCategoryPress(categoryName)}
                onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
                onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
            >
                <View
                    style={{
                        aspectRatio: 1 / 1,
                        maxWidth: contentWidth / 4,
                        borderWidth: 1,
                        borderColor: (isHovered || selected) ? COLORS.darkRed : COLORS.darkGrey,
                        backgroundColor: selected ? COLORS.darkRedBackground : 'transparent',
                        borderRadius: 15,
                        alignItems: 'center',
                        padding: SPACING.xx_small
                    }}
                >
                    <Image
                        style={{
                            width: '55%',
                            aspectRatio: 1 / 1,
                            tintColor: selected ? undefined : COLORS.greyText
                        }}
                        source={imagePath}
                        resizeMode="contain"
                    //alt={lady.name}
                    />
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: categoryCardNameFontSize > FONT_SIZES.large ? FONTS.large : categoryCardNameFontSize, textAlign: 'center' }}>
                        {categoryName}
                    </Text>
                </View>
                <LinearGradient
                    colors={['rgba(22,22,22,0)', COLORS.lightBlack]}
                    style={{ position: 'absolute', bottom: -1, width: '100%', height: '50%' }}
                    locations={[0, 0.75]}
                />
            </TouchableOpacity>
        </View>
    )
}

export default memo(HoverableCategoryCard)