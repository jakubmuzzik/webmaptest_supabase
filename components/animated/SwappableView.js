import React, { useEffect, memo, useRef, useState } from 'react'

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated'

const SwappableView = ({children, style={}}) => {
    const opacity = useSharedValue(0)
    const rotateX = useSharedValue('90deg')

    const [currentChildren, setCurrentChildren] = useState() 

    const previousChildren = useRef()

    useEffect(() => {
        if (!currentChildren) {
            //init
            setCurrentChildren(children)
            return
        }

        //children changed
        animateOut()
    }, [children])

    useEffect(() => {
        if (!currentChildren) {
            return
        }

        animateIn()
    }, [currentChildren])
    
    const animateIn = () => {
        opacity.value = withTiming(1, {
            useNativeDriver: true
        })
        rotateX.value = withTiming('0deg', {
            useNativeDriver: true
        })
    }

    const animateOut = () => {
        opacity.value = withTiming(0, {
            useNativeDriver: true
        })
        rotateX.value = withTiming('90deg', {
            useNativeDriver: true
        }, () => setCurrentChildren(children))
    }

    const animatedStyle = useAnimatedStyle(() => {
        return {
            ...style,
            opacity: opacity.value,
            transform: [{ rotateX:rotateX.value  }],
        }
    })

    return (
        <Animated.View style={animatedStyle}>
            {currentChildren}
        </Animated.View>
    )
}

export default memo(SwappableView)