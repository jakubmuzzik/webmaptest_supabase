import React, { useMemo, useState, useEffect, useRef, memo, useLayoutEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native'
import { COLORS, SPACING, SUPPORTED_LANGUAGES } from '../../../constants'
import { stripEmptyParams } from '../../../utils'
import Gallery from 'react-native-awesome-gallery'
import { Image } from 'expo-image'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const MAX_IMAGE_SIZE = 130

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const renderItem = ({
    item,
    setImageDimensions,
}) => {
    return (
        <Image
            source={item.downloadUrl}
            style={StyleSheet.absoluteFillObject}
            resizeMode="contain"
            placeholder={item.blurhash}
            transition={200}
            onLoad={(e) => {
                const { width, height } = e.source
                setImageDimensions({ width, height })
            }}
        />
    )
}

const AssetsGallery = ({ assets, pressedAssetIndex=0 }) => {
    // const params = useMemo(() => ({
    //     language: SUPPORTED_LANGUAGES.includes(decodeURIComponent(route.params.language)) ? decodeURIComponent(route.params.language) : '',
    //     id: route.params.id
    // }), [route.params])

    const { width, height } = useWindowDimensions()

    const gallery = useRef()
    const bottomScrollViewRef = useRef()

    const [index, setIndex] = useState(pressedAssetIndex)
    const [galleryHeight, setGalleryHeight] = useState()

    const baseImageWidth = width < 800 ? width : 800
    const dynamicImageSize = Math.floor(baseImageWidth / 4)

    useLayoutEffect(() => {
        const x = index * dynamicImageSize + index * SPACING.small
        bottomScrollViewRef.current.scrollTo({ x, animated: true })
    }, [index])

    const onNextPress = () => {
        gallery.current?.setIndex(
            index === assets.length - 1
                ? 0
                : index + 1,
            true
        )
    }

    const onPrevPress = () => {
        gallery.current?.setIndex(
            index === 0
                ? assets.length - 1
                : index - 1,
            true
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightBlack }}>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={(event) => setGalleryHeight(event.nativeEvent.layout.height)}>
                <Gallery
                    style={{ backgroundColor: COLORS.lightBlack, marginTop: 10, marginHorizontal: SPACING.medium }}
                    containerDimensions={{ width: width - SPACING.medium - SPACING.medium, height: '100%' }}
                    ref={gallery}
                    data={assets}
                    keyExtractor={(item, index) => item + index}
                    renderItem={renderItem}
                    initialIndex={index}
                    numToRender={3}
                    doubleTapInterval={150}
                    onIndexChange={(index) => setIndex(index)}
                    loop
                />
            </GestureHandlerRootView>
            

            <View style={{ width: 800, maxWidth: '100%', alignSelf: 'center' }}>
                <ScrollView ref={bottomScrollViewRef} horizontal contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: SPACING.small, }}>
                    {assets.map((asset, assetIndex) => (
                        <TouchableOpacity key={asset.id} onPress={() => gallery.current?.setIndex(assetIndex, true)} activeOpacity={1}>
                            <Image
                                style={{
                                    width: dynamicImageSize,
                                    height: dynamicImageSize,
                                    maxHeight: MAX_IMAGE_SIZE,
                                    maxWidth: MAX_IMAGE_SIZE,
                                    marginRight: assetIndex + 1 === assets.length ? 0 : SPACING.small,
                                    opacity: assetIndex === index ? 1 : 0.6,
                                    borderRadius: 5
                                }}
                                source={asset.downloadUrl}
                                resizeMode='cover'
                                placeholder={asset.blurhash}
                                transition={200}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {galleryHeight &&
                <><View style={{
                    position: 'absolute',
                    opacity: 0.7,
                    left: SPACING.xx_large,
                    top: galleryHeight / 2 - 17.5,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <MaterialIcons onPress={onPrevPress}
                        style={{
                            borderRadius: 35,
                            backgroundColor: '#FFF',
                            padding: 3,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.32,
                            shadowRadius: 5.46,
                            elevation: 9,
                        }}
                        name="keyboard-arrow-left"
                        size={35}
                        color={COLORS.lightBlack}
                    />
                </View>

                    <View style={{
                        position: 'absolute',
                        opacity: 0.7,
                        right: SPACING.xx_large,
                        top: galleryHeight / 2 - 17.5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MaterialIcons onPress={onNextPress}
                            style={{
                                borderRadius: 35,
                                backgroundColor: '#FFF',
                                padding: 3,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.32,
                                shadowRadius: 5.46,
                                elevation: 9,
                            }}
                            name="keyboard-arrow-right"
                            size={35}
                            color={COLORS.lightBlack}
                        />
                    </View>
                </>}
        </View>
    )
}

export default memo(AssetsGallery)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden'
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    toolbar: {
        position: 'absolute',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    bottomToolBar: {
        bottom: 0,
    },
    headerText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '600',
    },
})