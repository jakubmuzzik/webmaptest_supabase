import React, { useState } from 'react'
import { View } from 'react-native'
import { Button } from '@rneui/themed'
import { isBrowser } from 'react-device-detect'

/**
    <HoverableButton
        title="Select"
        onPress={onConfirmCityPicker}
        buttonStyle={{
            backgroundColor: '#E0191A',
            borderRadius: 12
        }}
        titleStyle={{
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large
        }}
    />
*/

const HoverableButton = ({ title, onPress, buttonStyle, titleStyle }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <View style={{ transitionDuration: '150ms', opacity: isHovered ? 0.8 : 1 }}
            onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
            onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}>
            <Button
                title={title}
                onPress={onPress}
                buttonStyle={{...buttonStyle}}
                titleStyle={{...titleStyle}}
            />
        </View>
    )
}

export default HoverableButton