import React, { useState, memo } from 'react'
import { Text } from 'react-native'
import { isBrowser } from 'react-device-detect'

const HoverableText = ({ textStyle, hoveredColor, text, onPress }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <Text 
            style={[textStyle, { transitionDuration: '100ms', color: isHovered ? hoveredColor : textStyle.color }]}
            onPress={onPress}
            onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
            onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
        >
            {text}
        </Text>
    )
}

export default memo(HoverableText)