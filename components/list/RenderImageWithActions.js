import React, { useEffect, useState, memo, useRef } from 'react'
import { View, ImageBackground } from 'react-native'
import { Image } from 'expo-image'
import DropdownSelect from '../DropdownSelect'
import { IconButton } from 'react-native-paper'
import { COLORS } from '../../constants'
import { normalize } from '../../utils'
import { BlurView } from 'expo-blur'

const RenderImageWithActions = ({ image, transition = 200, resizeMode = 'contain', actions, offsetX = 0, showActions=true }) => {
    const actionsDropdownRef = useRef()

    const renderActions = () => {
        if (!showActions) {
            return null
        }

        if (actions.length === 1) {
            return <IconButton
                style={{ position: 'absolute', top: 2, right: 2, }}
                containerColor={COLORS.grey + 'B3'}
                icon={actions[0].iconName}
                iconColor='white'
                size={normalize(20)}
                onPress={() => actions[0].onPress(image.id)}
            />
        } else {
            return (
                <View style={{
                    position: 'absolute',
                    right: 2,
                    top: 2,
                }}>
                    <DropdownSelect
                        ref={actionsDropdownRef}
                        offsetX={offsetX}
                        values={actions.map(action => action.label)}
                        setText={(text) => actions.find(action => action.label === text).onPress(image.id)}
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
            )
        }
    }

    return (
        <ImageBackground
            source={{ uri: image.downloadUrl }}
            style={StyleSheet.absoluteFillObject}
            imageStyle={{ opacity: 0.7 }}
            resizeMode='cover'
        >
            <BlurView intensity={50}>
                <Image
                    style={{
                        flex: 1,
                        aspectRatio: 1 / 1,
                    }}
                    source={{ uri: image.downloadUrl }}
                    placeholder={image.blurhash}
                    resizeMode={resizeMode}
                    transition={transition}
                />

                {renderActions()}
            </BlurView>
        </ImageBackground>
    )
}

export default memo(RenderImageWithActions)