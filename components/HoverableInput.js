import React, { useState, memo } from "react"
import { View, Text } from 'react-native'
import { TextInput, HelperText, Icon} from 'react-native-paper'
import { COLORS, FONTS, FONT_SIZES } from "../constants"
import {isBrowser } from 'react-device-detect'
import { normalize } from "../utils"
import { MaterialIcons } from '@expo/vector-icons'; 


const HoverableInput = ({ 
    borderColor=COLORS.darkRedBackground2,
    hoveredBorderColor=COLORS.red, 
    backgroundColor='#372b2b',//COLORS.darkRedBackground, 
    hoveredBackgroundColor=COLORS.darkRedBackground2,
    errorMessage, 
    mode="outlined", 
    placeholder,
    label, 
    labelStyle={ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.placeholder },
    text, 
    textStyle={ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.white },
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
                label={<Text style={labelStyle}>{label}</Text>}
                //placeholder color
                theme={{ colors: { onSurfaceVariant: 'grey' }}}
                placeholder={placeholder}
                //unfocused border color
                outlineColor={(isHovered || text) ? hoveredBorderColor : borderColor}
                //active border color
                activeOutlineColor={errorMessage ? COLORS.error : isHovered || isFocused ? hoveredBorderColor: borderColor}
                error={errorMessage}
                mode={mode}
                value={text}
                onChangeText={text => setText(text)}
                left={leftIconName && <TextInput.Icon color={COLORS.placeholder} pointerEvents={pointerEventsDisabled ? 'none' : undefined} style={{ alignSelf: 'center', height: height }} size={normalize(height ? height / 2 :  20)} icon={leftIconName} onPress={onLeftIconPress ?? undefined} />}
                right={rightIconName && <TextInput.Icon color={COLORS.placeholder} pointerEvents={pointerEventsDisabled ? 'none' : undefined} size={normalize(20)} icon={rightIconName} onPress={onRightIconPress ?? undefined} />}
                //style of the text value
                contentStyle={textStyle}
                //background color of the input
                outlineStyle={{ backgroundColor: (isHovered || isFocused || text) ? hoveredBackgroundColor: backgroundColor }}
                //background color of label when focused
                style={height ? { height: height, paddingTop: 0, backgroundColor: COLORS.grey} : { backgroundColor: COLORS.grey }}
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