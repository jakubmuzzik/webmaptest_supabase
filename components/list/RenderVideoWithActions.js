import React, { useEffect, useState, memo, useRef } from 'react'
import { View, Image as RNImage, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import DropdownSelect from '../DropdownSelect'
import { IconButton, ActivityIndicator } from 'react-native-paper'
import { COLORS, SPACING } from '../../constants'
import { normalize, generateThumbnailFromLocalURI } from '../../utils'
import { Video, ResizeMode } from 'expo-av'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

const RenderVideoWithActions = ({ video, actions, offsetX = 0, showActions = true }) => {
    const actionsDropdownRef = useRef()

    const [aspectRatio, setAspectRatio] = useState()
    const [showPoster, setShowPoster] = useState(true)

    const videoRef = useRef()

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        if (!showPoster && videoRef.current) {
            videoRef.current.playAsync()
        }
    }, [showPoster, videoRef.current])

    const init = async () => {
        try {
            //setThumbnail(thumbnailUrl)
            RNImage.getSize(video.thumbnailDownloadUrl, (width, height) => { 
                setAspectRatio(width / height)
            })
        } catch(e) {
            console.error(e)
        }
    }

    if (!aspectRatio) {
        return (
            <ActivityIndicator style={{ margin: SPACING.large, alignSelf: 'center' }} animating color={COLORS.red} />
        )
    }

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

    const renderPoster = () => (
        <View style={{ 
            width: '100%',
            height: undefined,
            aspectRatio: aspectRatio,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Image 
                style={{...StyleSheet.absoluteFillObject, borderRadius: 10}}
                source={video.thumbnailDownloadUrl}
                placeholder={video.blurhash}
                transition={200}
                resizeMode='cover'
            />
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPoster(false)}>
                <Ionicons name="ios-play-circle-sharp" size={normalize(70)} color='rgba(0,0,0,.7)' />
            </TouchableOpacity>
        </View>
    )

    return (
        <>
            {!showPoster && <Video
                ref={videoRef}
                style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: aspectRatio
                }}
                videoStyle={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: aspectRatio,
                    borderRadius: 10
                }}
                source={{
                    uri: video.downloadUrl,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
            />}
            {showPoster && renderPoster()}

            {renderActions()}
        </>
    )
}

export default memo(RenderVideoWithActions)