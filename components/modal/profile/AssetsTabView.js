import React, { useEffect, useState } from 'react'
import { View, Modal, ScrollView, Text, Dimensions, useWindowDimensions } from 'react-native'
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
import ContentLoader, { Rect } from "react-content-loader/native"

const MAX_IMAGE_SIZE = 130

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

    const { width } = useWindowDimensions()

    const baseImageWidth = width < 800 ? width : 800
    const dynamicImageSize = Math.floor(baseImageWidth / 4)

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
        <>
            <View style={{ flex: 1, marginTop: 10, marginHorizontal: SPACING.medium }}>
                <ContentLoader
                    speed={2}
                    height={'100%'}
                    width={500}
                    style={{ borderRadius: 5, ...StyleSheet.absoluteFillObject, maxWidth: '100%', margin: 'auto' }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                </ContentLoader>
            </View>

            <View style={{ width: 800, maxWidth: '100%', alignSelf: 'center' }}>
                <ScrollView horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: SPACING.small, }}>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, marginRight: SPACING.small, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, marginRight: SPACING.small, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, marginRight: SPACING.small, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, marginRight: SPACING.small, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, marginRight: SPACING.small, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                    <ContentLoader
                        speed={2}
                        height={dynamicImageSize}
                        width={dynamicImageSize}
                        style={{
                            borderRadius: 5, maxHeight: MAX_IMAGE_SIZE,
                            maxWidth: MAX_IMAGE_SIZE,
                        }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={'100%'} />
                    </ContentLoader>
                </ScrollView>
            </View>
        </>
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