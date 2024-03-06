import React, { memo, useState, forwardRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated'
import { COLORS, SPACING, FONTS, FONT_SIZES, MAX_PHOTO_SIZE_MB, MAX_VIDEO_SIZE_MB, MAX_VIDEOS, MAX_PHOTOS } from '../../../constants'
import { TouchableRipple, IconButton, HelperText } from 'react-native-paper'
import { normalize, generateThumbnailFromLocalURI, encodeImageToBlurhash, getFileSizeInMb, getDataType } from '../../../utils'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import * as ImagePicker from 'expo-image-picker'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import uuid from 'react-native-uuid'
import { IN_REVIEW } from '../../../labels'

const EstablishmentPhotos = forwardRef((props, ref) => {
    const { i, offsetX = 0, toastRef } = props

    const [data, setData] = useState({
        images: [null, null],
        videos: [null],
    })
    const [showErrors, setShowErrors] = useState(false)
    const [contentWidth, setContentWidth] = useState(document.body.clientWidth)

    const validate = async () => {
        if (
            !data.images[0]
        ) {
            setShowErrors(true)
            return false
        }

        setShowErrors(false)

        return true
    }

    useImperativeHandle(ref, () => ({
        validate,
        data: JSON.parse(JSON.stringify({
            images: data.images.filter(image => image).map((image, index) => ({...image, index})),
            videos: data.videos.filter(video => video).map((video, index) => ({...video, index})),
        }))
    }))

    const scrollY = useSharedValue(0)

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y
    })

    const onSelectImagePress = async (index) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            //aspect: [4, 3],
            quality: 0.8,
        })

        if (!result.canceled) {
            try {
                const fileSizeMb = getFileSizeInMb(result.assets[0].uri)
                if (fileSizeMb > MAX_PHOTO_SIZE_MB) {
                    toastRef.current.show({
                        type: 'error',
                        headerText: 'File Size Error',
                        text: `Maximum file size allowed is ${MAX_PHOTO_SIZE_MB}MB.`
                    })
                    return
                }

                const dataType = getDataType(result.assets[0].uri)
                if (dataType !== 'image') {
                    toastRef.current.show({
                        type: 'error',
                        headerText: 'Invalid File Type',
                        text: `Please upload a supported file type.`
                    })
                    return
                }

                const blurhash = await encodeImageToBlurhash(result.assets[0].uri)

                setData(d => {
                    d.images[index] = {image: result.assets[0].uri, id: uuid.v4(), status: IN_REVIEW, blurhash}
                    if (index > 0 && d.images.length < MAX_PHOTOS) {
                        d.images.push(null)
                    }
                    return { ...d }
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    const onSelectVideoPress = async (index) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            base64: true,
            quality: 0.8,
        })

        if (!result.canceled) {
            try {
                const fileSizeMb = getFileSizeInMb(result.assets[0].uri)
                if (fileSizeMb > MAX_VIDEO_SIZE_MB) {
                    toastRef.current.show({
                        type: 'error',
                        headerText: 'File Size Error',
                        text: `Maximum file size allowed is ${MAX_VIDEO_SIZE_MB}MB.`
                    })
                    return
                }

                const dataType = getDataType(result.assets[0].uri)
                if (dataType !== 'video') {
                    toastRef.current.show({
                        type: 'error',
                        headerText: 'Invalid File Type',
                        text: `Please upload a supported file type.`
                    })
                    return
                }

                const thumbnail = await generateThumbnailFromLocalURI(result.assets[0].uri, 0)
                const blurhash = await encodeImageToBlurhash(thumbnail)

                setData(d => {
                    d.videos[index] = {thumbnail, video: result.assets[0].uri, id: uuid.v4(), blurhash, status: IN_REVIEW}
                    if (d.videos.length < MAX_VIDEOS) {
                        d.videos.push(null)
                    }
                    return { ...d }
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    const onDeleteImagePress = async (index) => {
        setData(d => {
            if (index > 0) {
                d.images.splice(index, 1)

                if (d.images[d.images.length - 1]) {
                    d.images.push(null)
                }
            } else {
                d.images[index] = null
            }

            return { ...d }
        })
    }

    const onDeleteVideoPress = async (index) => {
        setData(d => {
            d.videos.splice(index, 1)

            if (d.videos[d.videos.length - 1]) {
                d.videos.push(null)
            }

            return { ...d }
        })
    }

    const modalHeaderTextStyles = useAnimatedStyle(() => {
        return {
            fontFamily: FONTS.medium,
            fontSize: FONT_SIZES.large,
            opacity: interpolate(scrollY.value, [0, 30, 50], [0, 0.8, 1], Extrapolation.CLAMP),
        }
    })

    return (
        <>
            <View style={styles.modal__header}>
                <Animated.Text style={modalHeaderTextStyles}>{`${i + 1}. Photos & Videos`}</Animated.Text>
            </View>
            <Animated.View style={[styles.modal__shadowHeader, modalHeaderTextStyles]} />
            <Animated.ScrollView 
                scrollEventThrottle={1} 
                onScroll={scrollHandler} 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: SPACING.small, paddingTop: SPACING.xxxxx_large }}
                onContentSizeChange={(contentWidth) => setContentWidth(contentWidth)}
            >
                <Text style={styles.pageHeaderText}>
                    {`${i + 1}. Photos & Videos`}
                </Text>

                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginHorizontal: SPACING.x_large }}>
                    Add cover photo
                </Text>

                <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2, marginHorizontal: SPACING.x_large }}>
                    This photos will be prominently displayed on your profile page
                </Text>

                <View style={{ marginTop: SPACING.x_small, flexDirection: 'row', marginHorizontal: SPACING.x_large }}>
                    {data.images[0] ?
                        <React.Fragment>
                            <Image
                                style={{
                                    flex: 1,
                                    borderRadius: 10,
                                    aspectRatio: 16 / 9,
                                    borderWidth: 1,
                                    borderColor: 'rgba(28,27,31,0.16)'
                                }}
                                source={{ uri: data.images[0].image }}
                                resizeMode="cover"
                            />
                            <IconButton
                                style={{ position: 'absolute', top: normalize(10) - SPACING.xxx_small, right: normalize(10) - SPACING.xxx_small, backgroundColor: COLORS.grey + 'B3' }}
                                icon="delete-outline"
                                iconColor='white'
                                size={normalize(20)}
                                onPress={() => onDeleteImagePress(0)}
                            />
                        </React.Fragment> :
                        <TouchableRipple
                            onPress={() => onSelectImagePress(0)}
                            style={{ backgroundColor: 'rgba(28,27,31,0.16)', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 10, aspectRatio: 16 / 9 }}
                        >
                            <Ionicons name="image-outline" size={normalize(30)} color={showErrors ? COLORS.error : "black"} />
                        </TouchableRipple>
                    }
                </View>
                {showErrors && <HelperText type="error" visible>
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small, color: COLORS.error, paddingHorizontal: SPACING.x_large }}>
                        Add your cover photo.
                    </Text>
                </HelperText>}

                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginHorizontal: SPACING.x_large, marginTop: SPACING.medium }}>
                    Add additional photos
                </Text>
                <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2, marginHorizontal: SPACING.x_large, marginBottom: SPACING.x_small }}>
                    Visitors can explore these photos by clicking the 'View All' button on your profile
                </Text>

                <View style={{ flexDirection: 'row', marginLeft: SPACING.x_large, marginRight: SPACING.x_large - SPACING.xxx_small, flexWrap: 'wrap' }}>
                    {data.images.slice(1).map((image, index) =>
                        <View key={image ? image.id : Math.random()} style={{ width: ((contentWidth - (SPACING.x_large * 2) - (SPACING.xxx_small * 2)) / 3), marginRight: SPACING.xxx_small, marginBottom: SPACING.xxx_small }}>
                            {image ?
                                <ImageBackground
                                    source={{ uri: image.image }}
                                    style={{ flex: 1 }}
                                    imageStyle={{ opacity: 0.7, borderRadius: 10, borderColor: 'rgba(28,27,31,0.16)', borderWidth: 1, overflow: 'hidden' }}
                                    resizeMode='cover'
                                >
                                    <BlurView intensity={50} style={{ borderRadius: 10, borderColor: 'rgba(28,27,31,0.16)', borderWidth: 1, overflow: 'hidden' }}>
                                        <Image
                                            style={{
                                                flex: 1,
                                                aspectRatio: 1 / 1,
                                            }}
                                            source={{ uri: image.image }}
                                            resizeMode="contain"
                                        />
                                        <IconButton
                                            style={{ position: 'absolute', top: normalize(10) - SPACING.xxx_small, right: normalize(10) - SPACING.xxx_small, backgroundColor: COLORS.grey + 'B3' }}
                                            icon="delete-outline"
                                            iconColor='white'
                                            size={normalize(20)}
                                            onPress={() => onDeleteImagePress(index + 1)}
                                        />
                                    </BlurView>
                                </ImageBackground> :
                                <TouchableRipple
                                    onPress={() => onSelectImagePress(index + 1)}
                                    style={{ backgroundColor: 'rgba(28,27,31,0.16)', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 10, aspectRatio: 1 / 1 }}
                                >
                                    <>
                                        <AntDesign name="plus" size={normalize(30)} color="black" />
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small }}>
                                            Add more
                                        </Text>
                                        {/* <Text style={{ fontFamily: FONTS.light, fontSize: FONT_SIZES.small }}>
                                                Max file size: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small }}>{MAX_PHOTO_SIZE_MB}MB</Text>
                                            </Text> */}
                                    </>
                                </TouchableRipple>
                            }
                        </View>)}
                </View>

                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, marginHorizontal: SPACING.x_large, marginTop: SPACING.medium - SPACING.xxx_small, }}>
                    Add videos
                </Text>
                <Text style={{ color: COLORS.grey, fontFamily: FONTS.regular, fontSize: FONT_SIZES.medium, marginTop: 2, marginHorizontal: SPACING.x_large, marginBottom: SPACING.x_small }}>
                    Visitors can explore these videos by clicking the 'View All' button on your profile
                </Text>

                <View style={{ flexDirection: 'row', marginLeft: SPACING.x_large, marginRight: SPACING.x_large - SPACING.xxx_small, flexWrap: 'wrap' }}>
                    {data.videos.map((video, index) =>
                        <View key={video ? video.id : Math.random()} style={{ width: ((contentWidth - (SPACING.x_large * 2) - (SPACING.xxx_small * 2)) / 3), marginRight: SPACING.xxx_small, marginBottom: SPACING.xxx_small }}>
                            {video ?
                                <React.Fragment>
                                    <Image
                                        style={{
                                            flex: 1,
                                            borderRadius: 10,
                                            aspectRatio: 1 / 1,
                                            borderWidth: 1,
                                            borderColor: 'rgba(28,27,31,0.16)'
                                        }}
                                        source={{ uri: video.thumbnail }}
                                        resizeMode="cover"
                                    />
                                    <IconButton
                                        style={{ position: 'absolute', top: normalize(10) - SPACING.xxx_small, right: normalize(10) - SPACING.xxx_small, backgroundColor: COLORS.grey + 'B3' }}
                                        icon="delete-outline"
                                        iconColor='white'
                                        size={normalize(20)}
                                        onPress={() => onDeleteVideoPress(index)}
                                    />
                                </React.Fragment> :
                                <TouchableRipple
                                    onPress={() => onSelectVideoPress(index)}
                                    style={{ backgroundColor: 'rgba(28,27,31,0.16)', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 10, aspectRatio: 1 / 1 }}
                                >
                                    <>
                                        <AntDesign name="videocamera" size={normalize(30)} color="black" />
                                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small }}>
                                            Add video
                                        </Text>
                                        {/* <Text style={{ fontFamily: FONTS.light, fontSize: FONT_SIZES.small }}>
                                                Max file size: <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.small }}>{MAX_VIDEO_SIZE_MB}MB</Text>
                                            </Text> */}
                                    </>
                                </TouchableRipple>
                            }
                        </View>)}
                </View>
            </Animated.ScrollView>
        </>
    )
})

export default memo(EstablishmentPhotos)

const styles = StyleSheet.create({
    pageHeaderText: {
        //color: '#FFF', 
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3,
        marginHorizontal: SPACING.x_large,
        marginBottom: SPACING.small
    },
    modal__header: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        //backgroundColor: '#FFF',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal__shadowHeader: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: normalize(55),
        backgroundColor: '#FFF',
        zIndex: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5
    },
})