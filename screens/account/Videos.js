import React, { useState, memo, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, useWindowDimensions, Modal } from 'react-native'
import { Image } from 'expo-image'
import { COLORS, FONTS, FONT_SIZES, SPACING, SMALL_SCREEN_THRESHOLD, MAX_VIDEO_SIZE_MB, MAX_VIDEOS } from '../../constants'
import { ACTIVE, REJECTED, IN_REVIEW } from '../../labels'
import { normalize, generateThumbnailFromLocalURI, encodeImageToBlurhash, getFileSizeInMb, getDataType } from '../../utils'
import { IconButton, Button } from 'react-native-paper'
import { Octicons } from '@expo/vector-icons'
import DropdownSelect from '../../components/DropdownSelect'
import RenderVideoWithActions from '../../components/list/RenderVideoWithActions'
import * as ImagePicker from 'expo-image-picker'
import { connect } from 'react-redux'
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import { BlurView } from 'expo-blur'
import { MotiView } from 'moti'
import LottieView from 'lottie-react-native'
import { updateLadyInRedux, updateCurrentUserInRedux } from '../../redux/actions'
import uuid from 'react-native-uuid'

import { updateDoc, doc, db, ref, uploadBytes, storage, getDownloadURL, deleteObject } from '../../firebase/config'

const Videos = ({ index, setTabHeight, offsetX = 0, userData, toastRef, updateLadyInRedux, updateCurrentUserInRedux }) => {
    const [data, setData] = useState({
        active: [],
        inReview: [],
        rejected: []
    })
    const [sectionWidth, setSectionWidth] = useState(0)

    const [uploading, setUploading] = useState(false)

    const [videoToDelete, setVideoToDelete] = useState()

    useEffect(() => {
        const active = userData.videos.filter(video => video.status === ACTIVE)
        const inReview = userData.videos.filter(video => video.status === IN_REVIEW)
        const rejected = userData.videos.filter(video => video.status === REJECTED)

        setData({
            active, inReview, rejected
        })
    }, [userData.videos])

    
    const { width: windowWidth } = useWindowDimensions()
    const isSmallScreen = windowWidth < SMALL_SCREEN_THRESHOLD

    const onLayout = (event) => {
        setTabHeight(event.nativeEvent.layout.height)
        setSectionWidth(event.nativeEvent.layout.width - 2)
    }

    const openImagePicker = async (index) => {
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
                        text:`Maximum file size allowed is ${MAX_VIDEO_SIZE_MB}MB.`
                    })
                    return
                }

                const dataType = getDataType(result.assets[0].uri)
                if (dataType !== 'video') {
                    toastRef.current.show({
                        type: 'error',
                        headerText: 'Invalid File Type',
                        text:`Please upload a supported file type.`
                    })
                    return
                }

                uploadVideo(result.assets[0].uri)
            } catch (e) {
                console.error(e)
                toastRef.current.show({
                    type: 'error',
                    text: `Video could not be uploaded.`
                })
            }
        }
    }

    const uploadVideo = async (videoUri) => {
        setUploading(true)
        try {
            await uploadUserAsset(videoUri)

            toastRef.current.show({
                type: 'success',
                headerText: 'Video uploaded',
                text: 'Video was successfully uploaded and submitted for review.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Upload error',
                text: 'Video could not be uploaded.'
            })
        } finally {
            setUploading(false)
        }
    }

    const uploadUserAsset = async (videoUri) => {
        const thumbnail = await generateThumbnailFromLocalURI(videoUri, 0)
        const blurhash = await encodeImageToBlurhash(thumbnail)

        let videoData = { video: videoUri, id: uuid.v4(), status: IN_REVIEW, blurhash, thumbnail }        

        //if there's an existing file in storage, it will be replaced 
        const urls = await Promise.all([
            uploadAssetToFirestore(videoData.video, 'videos/' + userData.id + '/' + videoData.id + '/video'),
            uploadAssetToFirestore(videoData.thumbnail, 'videos/' + userData.id + '/' + videoData.id + '/thumbnail')
        ])

        delete videoData.video
        delete videoData.thumbnail
        videoData.downloadUrl = urls[0]
        videoData.thumbnailDownloadUrl = urls[1]

        const videos = userData.videos.concat([videoData])
        
        await updateDoc(doc(db, 'users', userData.id), { videos, lastModifiedDate: new Date() })

        if (userData.establishmentId) {
            updateLadyInRedux({ videos, id: userData.id, lastModifiedDate: new Date() })
        } else {
            updateCurrentUserInRedux({ videos, id: userData.id, lastModifiedDate: new Date() })
        }
    }

    const uploadAssetToFirestore = async (assetUri, assetPath) => {
        const imageRef = ref(storage, assetPath)
    
        const response = await fetch(assetUri)
        const blob = await response.blob()

        const result = await uploadBytes(imageRef, blob)

        const downloadURL = await getDownloadURL(result.ref)

        return downloadURL
    }

    const onDeleteVideoPress = async (videoId) => {
        const toDelete = userData.videos.find(video => video.id === videoId)
        //deleting video in review when profile is in review
        if (toDelete.status === IN_REVIEW && userData.status === IN_REVIEW) {
            toastRef.current.show({
                type: 'warning',
                headerText: 'Profile is in review',
                text: 'You can not delete this video, your profile is currently in review.'
            })

            return
        }

        setVideoToDelete(videoId)
    }

    const deleteVideo = async (videoId) => {
        const videoRef = ref(storage, 'videos/' + userData.id + '/' + videoId + '/video')
        const thumbnailRef = ref(storage, 'videos/' + userData.id + '/' + videoId + '/thumbnail')

        await Promise.all([
            deleteObject(videoRef),
            deleteObject(thumbnailRef),
        ])

        const newVideos = userData.videos.filter(video => video.id !== videoId)
        await updateDoc(doc(db, 'users', userData.id), { videos: newVideos })

        if (userData.establishmentId) {
            updateLadyInRedux({ videos: newVideos, id: userData.id })
        } else {
            updateCurrentUserInRedux({ videos: newVideos, id: userData.id })
        }

        toastRef.current.show({
            type: 'success',
            headerText: 'Success!',
            text: 'Video was deleted.'
        })
    }

    const onAddNewVideoPress = () => {
        openImagePicker()
    }

    const activeActions = [
        {
            label: 'Delete',
            onPress: onDeleteVideoPress,
            iconName: 'delete-outline'
        }
    ]

    const inReviewActions = [
        {
            label: 'Delete',
            onPress: onDeleteVideoPress,
            iconName: 'delete-outline'
        }
    ]

    const rejectedActions = [
        {
            label: 'Delete',
            onPress: onDeleteVideoPress,
            iconName: 'delete-outline'
        }
    ]

    const renderVideos = (videos, actions, showActions=true) => {
        const largeContainerStyles = {
            flexDirection: 'row', 
            marginLeft: SPACING.small, 
            marginRight: SPACING.small - SPACING.small, 
            flexWrap: 'wrap'
        }
        const smallContainerStyles = {
            flexDirection: 'row', marginHorizontal: SPACING.small,  marginBottom: SPACING.small, flexWrap: 'wrap'
        }
        const largeImageContainerStyles = {
            borderRadius: 10, overflow: 'hidden', width: ((sectionWidth - (SPACING.small * 2) - (SPACING.small )) / 2), marginRight: SPACING.small, marginBottom: SPACING.small
        }
        const smallImageContainerStyles = {
            borderRadius: 10, overflow: 'hidden', width: '100%', marginBottom: SPACING.small
        }

        return (
            <View style={isSmallScreen ? smallContainerStyles : largeContainerStyles}>
                {videos.map((video) =>
                    <View key={video.id} style={isSmallScreen ? smallImageContainerStyles : largeImageContainerStyles}>
                        <RenderVideoWithActions video={video} actions={actions} offsetX={(windowWidth * index) + offsetX} showActions={showActions} />
                    </View>)}
            </View>
        )

    }

    const renderActive = () => (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flexShrink: 1 }}>
                    <Octicons name="dot-fill" size={20} color="green" style={{ marginRight: SPACING.xx_small }} />
                    <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Active
                    </Text>
                    <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                        • {data.active.length}
                    </Text>
                </View>

                {((data.active.length + data.inReview.length) < MAX_VIDEOS) && <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    style={{ height: 'auto' }}
                    mode="outlined"
                    icon="plus"
                    onPress={onAddNewVideoPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Add video
                </Button>}
            </View>

            {
                data.active.length === 0 ?
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, textAlign: 'center', margin: SPACING.small }}>
                        No active videos
                    </Text>
                    : renderVideos(data.active, activeActions)
            }
        </View>
    )

    const renderInReview = () => {
        if (data.inReview.length === 0) {
            return null
        }
        
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Octicons name="dot-fill" size={20} color="yellow" style={{ marginRight: SPACING.xx_small }} />
                    <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        In review
                    </Text>
                    <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                        • {data.inReview.length}
                    </Text>
                </View>

                {
                    data.inReview.length === 0 ?
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, textAlign: 'center', margin: SPACING.small }}>
                            No videos in review
                        </Text>
                        : renderVideos(data.inReview, inReviewActions, userData.status !== IN_REVIEW)
                }
            </View>
        )
    }

    const renderRejected = () => {
        if (data.rejected.length === 0) {
            return null
        }

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Octicons name="dot-fill" size={20} color="red" style={{ marginRight: SPACING.xx_small }} />
                    <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Rejected
                    </Text>
                    <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                        • {data.rejected.length}
                    </Text>
                </View>

                {renderVideos(data.rejected, rejectedActions)}
            </View>
        )
    }

    return (
        <View style={{ paddingBottom: SPACING.large }} onLayout={onLayout}>
            {userData.status !== IN_REVIEW && renderActive()}
            {renderInReview()}
            {renderRejected()}

            {uploading && (
                <Modal transparent>
                    <MotiView
                        style={{ ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}
                        from={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1
                        }}
                    >
                        <BlurView intensity={20} style={{ height: '100%', width: '100%' }}>
                            <View style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,.6)', alignItems: "center", justifyContent: 'center' }}>
                                <LottieView
                                    style={{ width: '20%', minWidth: 200, maxWidth: '90%' }}
                                    autoPlay
                                    loop
                                    source={require('../../assets/file-upload.json')}
                                />
                            </View>
                        </BlurView>
                    </MotiView>
                </Modal>
            )}

            <ConfirmationModal 
                visible={!!videoToDelete}
                headerText='Confirm delete'
                text='Are you sure you want to delete this Video?'
                onCancel={() => setVideoToDelete(undefined)}
                onConfirm={() => deleteVideo(videoToDelete)}
                icon='delete-outline'
                headerErrorText='Delete error'
                errorText='Video could not be deleted.'
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { updateLadyInRedux, updateCurrentUserInRedux })(memo(Videos))

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.large,
        borderRadius: 20,
        backgroundColor: COLORS.grey,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
    },
    sectionHeader: {
        flexDirection: 'row',
        margin: SPACING.small,
        alignItems: 'center'
    },
    sectionHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3
    },
    largeContainerStyles: {
        flexDirection: 'row', 
        marginLeft: SPACING.small, 
        marginRight: SPACING.small - SPACING.xxx_small, 
        marginBottom: SPACING.small, 
        flexWrap: 'wrap'
    }, 
    smallContainerStyles: {
        flexDirection: 'row', marginHorizontal: SPACING.small,  marginBottom: SPACING.small, flexWrap: 'wrap'
    },
})