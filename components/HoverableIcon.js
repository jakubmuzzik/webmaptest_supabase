import React, { useState, memo } from 'react'
import { View } from 'react-native'
import {isBrowser } from 'react-device-detect'
import { COLORS } from '../constants'

const HoverableIcon = ({ renderIcon, hoveredColor, color, containerStyle={}, transitionDuration = '150ms' }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <View style={{
            ...containerStyle,
            transitionDuration: { transitionDuration }
        }}
            onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
            onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
        >
            {renderIcon(isHovered ? hoveredColor : color)}
        </View>
    )
}

export default memo(HoverableIcon)