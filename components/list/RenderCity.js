import React, { memo, useMemo } from "react"
import { StyleSheet, TouchableOpacity, Text, View } from "react-native"
import HoverableView from "../HoverableView"
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, FONTS, FONT_SIZES, SPACING } from "../../constants"
import { normalize, stripEmptyParams } from "../../utils"
import { Link } from 'react-router-dom'

const RenderCity = ({ city, iconName, iconColor, routeName, params, filterParams }) => {
    
    //whenever city is changed - reset page param (pull data again with new city)
    return (
        <HoverableView key={city} style={styles.cityContainer} hoveredBackgroundColor={COLORS.hoveredWhite} backgroundColor='#FFF' transitionDuration='0ms'>
            <Link style={{ textDecoration: 'none', width: '100%' }} to={{ pathname: routeName, search: new URLSearchParams(stripEmptyParams({ language: params.language, city, ...filterParams })).toString() }} >
                <View style={{ flexDirection: 'row', flex: 1, paddingVertical: SPACING.xx_small, paddingLeft: SPACING.xx_small, alignItems: 'center' }}>
                    <MaterialIcons style={{ paddingRight: SPACING.xx_small }} name={iconName} size={normalize(24)} color={iconColor} />
                    <Text style={styles.city}>{city ? city: 'Anywhere'}</Text>
                </View>
            </Link>
        </HoverableView>
    )
}

export default memo(RenderCity)

const styles = StyleSheet.create({
    city: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.medium
    },
    cityContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.small
    },
})