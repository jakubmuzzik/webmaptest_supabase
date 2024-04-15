import React, { useEffect, useState, memo, useRef } from 'react'
import { View, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native'
import DropdownSelect from '../DropdownSelect'
import { IconButton } from 'react-native-paper'
import { COLORS, SPACING } from '../../constants'
import { normalize } from '../../utils'
import { Video, ResizeMode } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

const RenderVideoWithActions = ({ video, actions, offsetX = 0, showActions = true }) => {
    const actionsDropdownRef = useRef()

    const [showPoster, setShowPoster] = useState(true)

    const videoRef = useRef()

    useEffect(() => {
        if (!showPoster && videoRef.current) {
            videoRef.current.playAsync()
        }
    }, [showPoster, videoRef.current])

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
                onPress={() => actions[0].onPress(video.id)}
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
                        setText={(text) => actions.find(action => action.label === text).onPress(video.id)}
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
            source={{ uri: video.thumbnail_download_url }}
            style={{
                width: '100%',
                height: undefined,
                aspectRatio: 1 / 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}
            imageStyle={{ opacity: 0.7 }}
            resizeMode='cover'
        >
            <>
                {showPoster && <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPoster(false)} >
                    <Ionicons name="ios-play-circle-sharp" size={normalize(70)} color='rgba(0,0,0,.7)' />
                </TouchableOpacity>}

                {!showPoster && (
                    <BlurView intensity={50} style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 1 / 1,
                        borderRadius: 10
                    }}>
                        <Video
                            ref={videoRef}
                            style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 1 / 1
                            }}
                            videoStyle={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: 1 / 1,
                                borderRadius: 10
                            }}
                            source={{
                                uri: video.download_url,
                            }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                        />
                    </BlurView>
                )}
            </>

            {renderActions()}
        </ImageBackground>
    )
}

export default memo(RenderVideoWithActions)