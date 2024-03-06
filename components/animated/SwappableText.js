import React, { useEffect, memo, useRef, useState } from 'react'

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated'

const SwappableText = ({value, style={}, duration=300}) => {
    const opacity = useSharedValue(0)
    const rotateX = useSharedValue('90deg')

    const [currentValue, setCurrentValue] = useState() 

    useEffect(() => {
        if (!currentValue) {
            //init
            setCurrentValue(value)
            return
        }

        //value changed
        animateOut()
    }, [value])

    useEffect(() => {
        if (!currentValue) {
            return
        }

        animateIn()
    }, [currentValue])
    
    const animateIn = () => {
        opacity.value = withTiming(1, {
            useNativeDriver: true,
            duration
        })
        rotateX.value = withTiming('0deg', {
            useNativeDriver: true,
            duration
        })
    }

    const animateOut = () => {
        opacity.value = withTiming(0, {
            useNativeDriver: true,
            duration
        })
        rotateX.value = withTiming('90deg', {
            useNativeDriver: true,
            duration
        }, () => setCurrentValue(value))
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            ...style,
            opacity: opacity.value,
            transform: [{ rotateX:rotateX.value  }],
        }
    })

    return (
        <Animated.Text style={animatedStyle}>
            {currentValue}
        </Animated.Text>
    )
}

export default memo(SwappableText)