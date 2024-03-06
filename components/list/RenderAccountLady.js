import React, { memo, useState, useRef, useMemo, useCallback } from "react"
import { StyleSheet, Text, View, FlatList } from "react-native"
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES } from "../../constants"
import { normalize, stripEmptyParams, getParam } from "../../utils"
import { Image } from 'expo-image'
import { isBrowser } from 'react-device-detect'
import { IconButton } from "react-native-paper"
import { useSearchParams } from 'react-router-dom'
import DropdownSelect from "../DropdownSelect"

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const RenderAccountLady = ({ lady, width, showPrice = true, actions=[], offsetX = 0}) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const [index, setIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const actionsDropdownRef = useRef()

    return (
        <>
            <View style={{  }}
                onMouseEnter={isBrowser ? () => setIsHovered(true) : undefined}
                onMouseLeave={isBrowser ? () => setIsHovered(false) : undefined}
            >
                <Image
                    style={{
                        borderRadius: 10, 
                        overflow: 'hidden', 
                        height: (width / 3) * 4, 
                        width
                    }}
                    source={lady.images[0].downloadUrl}
                    placeholder={lady.images[0].blurhash}
                    resizeMode="cover"
                    transition={200}
                    alt={lady.name}
                />

                {actions.length === 1 ? <IconButton
                    style={{ position: 'absolute', top: 2, right: 2, }}
                    containerColor={COLORS.grey + 'B3'}
                    icon={actions[0].iconName}
                    iconColor='white'
                    size={normalize(20)}
                    onPress={() => actions[0].onPress(lady.id)}
                /> : <View style={{
                    position: 'absolute',
                    right: 2,
                    top: 2,
                }}>
                    <DropdownSelect
                        ref={actionsDropdownRef}
                        offsetX={offsetX}
                        values={actions.map(action => action.label)}
                        setText={(text) => actions.find(action => action.label === text).onPress(lady.id)}
                    >
                        <IconButton
                            icon="dots-horizontal"
                            iconColor="#FFF"
                            containerColor={COLORS.grey + 'B3'}
                            size={18}
                            onPress={() => actionsDropdownRef.current?.onDropdownPress()}
                        />
                    </DropdownSelect>
                </View>}
            </View>

            <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF', marginTop: SPACING.x_small }}>
                {lady.name}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText }}>
                Added: 21.05.2023
            </Text>
        </>
    )
}

export default memo(RenderAccountLady)

const styles = StyleSheet.create({
    container: {
        //padding: SPACING.xx_small, 
        flexDirection: 'column',
        flexGrow: 1,
        //backgroundColor: COLORS.grey,
        borderRadius: 10,
        //marginRight: SPACING.large
    },
})