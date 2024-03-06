import React, { memo, useState, useCallback, useEffect } from "react"
import { View, Text, TextInput } from "react-native"
import { FONTS, COLORS, FONT_SIZES, SPACING } from "../constants"
import { normalize } from "../utils"
import { RangeSlider } from '@react-native-assets/slider'
import HoverableView from "./HoverableView"

const Slider = ({ range, minValue, absoluteMinValue = true, absoluteMaxValue = true, maxValue, filterName, setFilters }) => {
    useEffect(() => {
        setMinInputValue(range[0])
        setMaxInputValue(range[1])
    }, [range])

    const [minBorderColor, setMinBorderColor] = useState(COLORS.placeholder)
    const [maxBorderColor, setMaxBorderColor] = useState(COLORS.placeholder)

    const [minInputValue, setMinInputValue] = useState(minValue)
    const [maxInputValue, setMaxInputValue] = useState(maxValue)

    const onMinSliderBlur = useCallback(() => {
        const parsedNumber = Number.parseInt(minInputValue)
        if (Number.isNaN(parsedNumber) || parsedNumber < minValue) {
            setFilters(filters => ({
                ...filters,
                [filterName]: [minValue, maxInputValue]
            }))
        } else if (parsedNumber >= maxInputValue) {
            setFilters(filters => ({
                ...filters,
                [filterName]: [maxInputValue - 1, maxInputValue]
            }))
        } else {
            setFilters(filters => ({
                ...filters,
                [filterName]: [parsedNumber, maxInputValue]
            }))
        }

        setMinBorderColor(COLORS.placeholder)
    }, [minInputValue])

    const onMaxSliderBlur = useCallback(() => {
        const parsedNumber = Number.parseInt(maxInputValue)
        if (Number.isNaN(parsedNumber) || parsedNumber > maxValue) {
            setFilters(filters => ({
                ...filters,
                [filterName]: [minInputValue, maxValue]
            }))
        } else if (parsedNumber <= minInputValue) {
            setFilters(filters => ({
                ...filters,
                [filterName]: [minInputValue, minInputValue + 1]
            }))
        } else {
            setFilters(filters => ({
                ...filters,
                [filterName]: [minInputValue, parsedNumber]
            }))
        }

        setMaxBorderColor(COLORS.placeholder)
    }, [maxInputValue])

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.small }}>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginRight: SPACING.small }}>
                    {minValue + (absoluteMinValue ? '' : '-')}
                </Text>
                <RangeSlider
                    style={{ flexGrow: 1 }}
                    range={range}
                    onValueChange={(value) => setFilters((filters) => ({...filters, [filterName]: value}))}
                    inboundColor={COLORS.red}
                    outboundColor="#d3d3d3"
                    thumbTintColor={COLORS.red}
                    thumbSize={normalize(20)}
                    thumbStyle={{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.36,
                        shadowRadius: 4.68,

                        elevation: 8,
                    }}
                    maximumValue={maxValue}
                    minimumValue={minValue}
                    step={1}
                    animateTransitions
                />
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, marginLeft: SPACING.small }}>
                    {maxValue + (absoluteMaxValue ? '' : '+')}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.small, marginTop: SPACING.small }}>
                <HoverableView hoveredBorderColor={COLORS.red} borderColor={minBorderColor} style={{ flex: 1, flexDirection: 'column', borderWidth: 1, borderRadius: 10, paddingHorizontal: SPACING.xx_small, paddingVertical: SPACING.xxx_small }}>
                    <Text style={{ fontFamily: FONTS.light, fontSize: FONT_SIZES.small }}>Minimum</Text>
                    <TextInput
                        style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, outlineStyle: 'none' }}
                        onChangeText={(value) => setMinInputValue(value.replace(/[^0-9]/g, ''))}
                        value={minInputValue === minValue && !absoluteMinValue ? minValue + '-' : minInputValue}
                        onBlur={onMinSliderBlur}
                        onFocus={() => setMinBorderColor(COLORS.red)}
                        keyboardType='numeric'
                        maxLength={3}
                    />
                </HoverableView>
                <Text style={{ marginHorizontal: SPACING.medium, fontFamily: FONTS.medium, fontSize: FONTS.h1 }}>
                    -
                </Text>
                <HoverableView hoveredBorderColor={COLORS.red} borderColor={maxBorderColor} style={{ flex: 1, flexDirection: 'column', borderWidth: 1, borderRadius: 10, paddingHorizontal: SPACING.xx_small, paddingVertical: SPACING.xxx_small }}>
                    <Text style={{ fontFamily: FONTS.light, fontSize: FONT_SIZES.small }}>Maximum</Text>
                    <TextInput
                        style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, outlineStyle: 'none' }}
                        onChangeText={(value) => setMaxInputValue(value.replace(/[^0-9]/g, ''))}
                        value={maxInputValue === maxValue && !absoluteMaxValue ? maxValue + '+' : maxInputValue}
                        onBlur={onMaxSliderBlur}
                        onFocus={() => setMaxBorderColor(COLORS.red)}
                        keyboardType='numeric'
                        maxLength={3}
                    />
                </HoverableView>
            </View>
        </View>
    )
}

export default memo(Slider)