import React, { useEffect, useState, memo, useRef } from 'react'
import { Image as RNImage, View, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { MotiView } from 'moti'
import { Video, ResizeMode } from 'expo-av'
import { normalize } from '../../utils'
import { isBrowser } from 'react-device-detect'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ActivityIndicator } from 'react-native-paper'
import { COLORS, SPACING } from '../../constants'

const RenderVideo = ({ video }) => {
    const [thumbnail, setThumbnail] = useState()
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
    
    const renderPoster = () => (
        <View style={{ 
            width: '100%',
            height: undefined,
            aspectRatio: aspectRatio,
            alignItems: 'center',
            justifyContent: 'center',
            ...StyleSheet.absoluteFillObject
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
            <Video
                ref={videoRef}
                style={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: aspectRatio
                }}
                videoStyle={{
                    width: '100%',
                    height: undefined,
                    aspectRatio: aspectRatio
                }}
                source={{
                    uri: video.downloadUrl
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
            />
            {!isBrowser && showPoster && renderPoster()}
        </>
    )
}

export default memo(RenderVideo)