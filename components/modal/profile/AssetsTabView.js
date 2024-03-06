import React, { useEffect, useState } from 'react'
import { View, Modal, ScrollView, Text, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { connect } from 'react-redux'
import { updateScrollDisabled } from "../../../redux/actions"
import { normalize } from '../../../utils'
import { COLORS, SPACING, FONTS, FONT_SIZES } from '../../../constants'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import VideosList from './VideosList'
import { ActivityIndicator } from 'react-native-paper'
import AssetsGallery from './AssetsGallery'

const { width, height } = Dimensions.get('window')

const AssetsTabView = ({ images = [], videos = [], visible, updateScrollDisabled, closeModal, pressedAssetIndex=0 }) => {
    const [pagesIndex, setPagesIndex] = useState(0)
    const [tabsIndex, setTabsIndex] = useState(0)
    const [pressedImageIndex, setPressedImageIndex] = useState()
    const [pagesRoutes] = useState([
        { key: 'Assets', title: 'Assets' },
        { key: 'Gallery', title: 'Gallery' },
    ])
    const [assetRoutes] = useState([
        { key: 'Photos', title: 'Photos', length: images.length },
        { key: 'Videos', title: 'Videos', length: videos.length },
    ].filter(r => r.length))

    const onClosePress = () => {
        updateScrollDisabled()
        closeModal()
        setPagesIndex(0)
        setTabsIndex(0)
        setPressedImageIndex(undefined)
    }

    const goBackPress = () => {
        setPagesIndex(0)
        setPressedImageIndex(undefined)
    }

    const onImagePress = (index) => {
        setPressedImageIndex(index)
        setPagesIndex(1)
    }

    const renderLazyPlaceholder = () => (
        <View style={{ alignSelf: 'center', marginTop: SPACING.xx_large }}>
            <ActivityIndicator animating color={COLORS.red} size={30}/>
        </View>
    )

    const renderTabBar = (props) => (
        <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
            <View style={{ flexBasis: 30, flexGrow: 1, flexShrink: 0 }}></View>
            <View style={{ flexShrink: 1, flexGrow: 0 }}>
                <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: 'red' }}
                    style={{ backgroundColor: 'transparent', maxWidth: '100%', alignSelf: 'center', alignItems: 'center', width: 'auto' }}
                    tabStyle={{ width: 'auto' }}
                    scrollEnabled={true}
                    renderLabel={({ route, focused, color }) => (
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: focused ? '#FFF' : 'rgba(255,255,255,0.7)' }}>
                            {route.title} <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: focused ? '#FFF' : 'rgba(255,255,255,0.7)' }}>({route.length})</Text>
                        </Text>
                    )}
                    gap={SPACING.medium}
                />
            </View>
            <View style={{ flexBasis: 30, flexGrow: 1, flexShrink: 0, justifyContent: 'center' }}>
                <Ionicons onPress={onClosePress} name="close" size={25} color="white" style={{ marginRight: SPACING.medium, alignSelf: 'flex-end' }} />
            </View>
        </View>
    )

    const renderAssetsScene = ({ route }) => {
        switch (route.key) {
            case 'Photos':
                return <AssetsGallery pressedAssetIndex={pressedAssetIndex} assets={images} />
            case 'Videos':
                return <VideosList videos={videos} />
            default:
                return null
        }
    }

    return (
        <Modal visible={visible} animationType="slide" onShow={() => updateScrollDisabled(true)}>
            <View style={{ flex: 1, backgroundColor: COLORS.lightBlack }}>
                <TabView
                    renderTabBar={renderTabBar}
                    swipeEnabled={false}
                    navigationState={{ index: tabsIndex, routes: assetRoutes }}
                    renderScene={renderAssetsScene}
                    onIndexChange={setTabsIndex}
                    lazy
                    renderLazyPlaceholder={renderLazyPlaceholder}
                />
            </View>
        </Modal>
    )
}

export default connect(null, { updateScrollDisabled })(AssetsTabView)