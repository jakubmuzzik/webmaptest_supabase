import React, { useEffect, useState, memo, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { MotiView } from 'moti'
import { Video, ResizeMode } from 'expo-av'
import { normalize } from '../../utils'
import { Ionicons } from '@expo/vector-icons'

const RenderVideo = ({ video }) => {
    const [showPoster, setShowPoster] = useState(true)

    const videoRef = useRef()

    useEffect(() => {
        if (!showPoster && videoRef.current) {
            videoRef.current.playAsync()
        }
    }, [showPoster, videoRef.current])
    
    const renderPoster = () => (
        <>
            <Image
                style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}
                source={video.thumbnail_download_url}
                placeholder={video.blurhash}
                transition={200}
                resizeMode='contain'
            />
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPoster(false)} style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="ios-play-circle-sharp" size={normalize(70)} color='rgba(0,0,0,.7)' />
            </TouchableOpacity>
        </>
    )

    const renderVideo = () => (
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }}>
            <Video
                ref={videoRef}
                style={{ height: '100%', width: '100%' }}
                videoStyle={{ height: '100%', margin: 'auto' }}
                source={{
                    uri: video.download_url
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
            />
        </View>
    )

    return (
        <>
            {!showPoster && renderVideo()}
            {showPoster && renderPoster()}
        </>
    )
}

export default memo(RenderVideo)