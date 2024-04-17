import React, { memo, useRef } from "react"
import { Text, View } from "react-native"
import { COLORS, FONTS, FONT_SIZES, SPACING } from "../../constants"
import {convertDateToString } from "../../utils"
import { Image } from 'expo-image'
import { IconButton } from "react-native-paper"
import DropdownSelect from "../../components/DropdownSelect"

const NewPhoto = ({ photo, width, actions=[], offsetX = 0}) => {
    const actionsDropdownRef = useRef()

    return (
        <>
            <Image
                style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    height: (width / 3) * 4,
                    width
                }}
                source={photo.download_url}
                placeholder={photo.blurhash}
                resizeMode="cover"
                transition={200}
            />

            <View style={{
                position: 'absolute',
                right: 2,
                top: 2,
            }}>
                <DropdownSelect
                    ref={actionsDropdownRef}
                    offsetX={offsetX}
                    values={actions.map(action => action.label)}
                    setText={(text) => actions.find(action => action.label === text).onPress(photo.id)}
                >
                    <IconButton
                        icon="dots-horizontal"
                        iconColor="#FFF"
                        containerColor={COLORS.grey + 'B3'}
                        size={18}
                        onPress={() => actionsDropdownRef.current?.onDropdownPress()}
                    />
                </DropdownSelect>
            </View>

            <Text numberOfLines={1} style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, marginTop: SPACING.x_small }}>
                Added: {convertDateToString(photo.created_date)}
            </Text>
        </>
    )
}

export default memo(NewPhoto)