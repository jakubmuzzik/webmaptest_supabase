import React, { useState, memo } from "react"
import { View, Text } from 'react-native'
import { TextInput, HelperText, Icon} from 'react-native-paper'
import { COLORS, FONTS, FONT_SIZES } from "../constants"
import {isBrowser } from 'react-device-detect'
import { normalize } from "../utils"
import { MaterialIcons } from '@expo/vector-icons'; 


const HoverableInput = ({ 
    borderColor,
    hoveredBorderColor, 
    textColor="#FFF",
    backgroundColor="transparent", 
    hoveredBackgroundColor="transparent",
    errorMessage, 
    mode="outlined", 
    placeholder,
    label, 
    labelStyle={},
    text, 
    textStyle={},
    placeholderStyle={},
    containerStyle={},
    setText,
    leftIconName,
    onLeftIconPress,
    onRightIconPress,
    rightIconName,
    secureTextEntry=false,
    height,
    pointerEventsDisabled = false,
    multiline=false,
    numberOfLines=1,
    maxLength,
    numeric=false,
    onSubmitEditing
}) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    return (
        <View  
            style={containerStyle}
            onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
            onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
        >
            <TextInput
                pointerEvents={pointerEventsDisabled ? 'none' : undefined}
                label={<View style={{ marginHorizontal: 2, zIndex: 2 }}><Text style={labelStyle}>{label}</Text></View>}
                placeholder={placeholder}
                textColor={textColor}
                outlineColor={isHovered ? hoveredBorderColor : borderColor}
                activeOutlineColor={errorMessage ? COLORS.error : isHovered || isFocused ? hoveredBorderColor: borderColor}
                underlineColor="red"
                activeUnderlineColor="red"
                error={errorMessage}
                mode={mode}
                value={text}
                onChangeText={text => setText(text)}
                left={leftIconName && <TextInput.Icon pointerEvents={pointerEventsDisabled ? 'none' : undefined} style={{ alignSelf: 'center', height: height }} size={normalize(height ? height / 2 :  20)} icon={leftIconName} onPress={onLeftIconPress ?? undefined} />}
                right={rightIconName && <TextInput.Icon pointerEvents={pointerEventsDisabled ? 'none' : undefined} size={normalize(20)} icon={rightIconName} onPress={onRightIconPress ?? undefined} />}
                contentStyle={[
                    text ? {...textStyle} : {...placeholderStyle}
                ]}
                outlineStyle={{ 
                    backgroundColor: isHovered ? hoveredBackgroundColor: backgroundColor
                }}
                style={height ? {height: height, paddingTop: 0} : undefined}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={numberOfLines}
                maxLength={maxLength}
                keyboardType= {numeric ? 'numeric' : undefined}
                onSubmitEditing={onSubmitEditing ?? undefined}
            />
            {errorMessage && <HelperText type="error" visible>
                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error }}>
                    {errorMessage}
                </Text>
            </HelperText>}
        </View>
    )
}

export default memo(HoverableInput)