import React, { memo } from 'react'
import { SPACING } from '../../../constants'
import { normalize } from '../../../utils'
import { ScrollView, View } from 'react-native'
import RenderVideo from '../../list/RenderVideo'

const VideosList = ({ videos }) => {

    return (
        <ScrollView contentContainerStyle={{ padding: SPACING.medium, paddingBottom: 0, width: normalize(600), maxWidth: '100%', alignSelf: 'center' }}>
            {videos.map((video) => (
                <View key={video.id} hoveredOpacity={0.8} style={{ width: '100%', marginBottom: SPACING.medium }}>
                    <RenderVideo video={video} />
                </View>
            ))}
        </ScrollView>
    )
}

export default memo(VideosList)