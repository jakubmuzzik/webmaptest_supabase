import React, { useState, memo, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, useWindowDimensions, Modal } from 'react-native'
import { Image } from 'expo-image'
import { COLORS, FONTS, FONT_SIZES, SPACING, MAX_PHOTO_SIZE_MB, MAX_PHOTOS } from '../../constants'
import { ACTIVE, REJECTED, IN_REVIEW, INACTIVE } from '../../labels'
import { normalize, getFileSizeInMb, getDataType, encodeImageToBlurhash, getMimeType } from '../../utils'
import { IconButton, Button, TouchableRipple } from 'react-native-paper'
import { Octicons, Ionicons, AntDesign } from '@expo/vector-icons'
import DropdownSelect from '../../components/DropdownSelect'
import RenderImageWithActions from '../../components/list/RenderImageWithActions'
import * as ImagePicker from 'expo-image-picker'
import uuid from 'react-native-uuid'
import { connect } from 'react-redux'
import { updateCurrentUserInRedux, updateLadyInRedux, updateNewLadyInRedux, updateNewEstablishmentInRedux } from '../../redux/actions'
import { BlurView } from 'expo-blur'
import { MotiView } from 'moti'
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import OverlaySpinner from '../../components/modal/OverlaySpinner'

import LottieView from 'lottie-react-native'

import { supabase } from '../../supabase/config'

const Photos = ({ index, setTabHeight, offsetX = 0, userData, user_type, toastRef, updateCurrentUserInRedux, updateLadyInRedux, currentAuthUser, updateNewLadyInRedux, updateNewEstablishmentInRedux }) => {
    const [data, setData] = useState({
        active: [],
        inReview: [],
        rejected: []
    })

    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [imageToDelete, setImageToDelete] = useState()
    const [coverImageToEdit, setCoverImageToEdit] = useState()

    useEffect(() => {
        const active = userData.images.filter(image => image.status === ACTIVE).sort((a,b) => a.index - b.index)
        const inReview = userData.images.filter(image => image.status === IN_REVIEW).sort((a,b) => a.index - b.index)//.map(image => ({...image, download_url: image.download_url + '?bust=' + Date.now()})) //bust the cache when replacing in review images
        const rejected = userData.images.filter(image => image.status === REJECTED).sort((a,b) => a.index - b.index)

        setData({
            active, inReview, rejected
        })
    }, [userData.images])

    const [sectionWidth, setSectionWidth] = useState(0)

    const { width: windowWidth } = useWindowDimensions()

    const onLayout = (event) => {
        setTabHeight(event.nativeEvent.layout.height)
        setSectionWidth(event.nativeEvent.layout.width - 2)
    }

    const openImagePicker = async (index, replaceImageId) => {
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
                    toastRef.show({
                        type: 'error',
                        headerText: 'File Size Error',
                        text: `Maximum file size allowed is ${MAX_PHOTO_SIZE_MB}MB.`
                    })
                    return
                }

                const dataType = getDataType(result.assets[0].uri)
                if (dataType !== 'image') {
                    toastRef.show({
                        type: 'error',
                        headerText: 'Invalid File Type',
                        text: `Please upload a supported file type.`
                    })
                    return
                }

                uploadImage(result.assets[0].uri, index, replaceImageId)
            } catch (e) {
                console.error(e)
                toastRef.show({
                    type: 'error',
                    text: `Image could not be uploaded.`
                })
            }
        }
    }

    const uploadImage = async (imageUri, index, replaceImageId) => {
        //if index = undefined -> it's additional image -> do not assign index
        //if index = number -> assign the image selected index (when photo will be approved, it will replace the current cover image)
        //if there's already existing in review image for selected cover photo -> display a confirmation window saying it will replace the current in review image

        setUploading(true)
        try {
            await uploadUserAsset(imageUri, index, replaceImageId)

            toastRef.show({
                type: 'success',
                headerText: 'Photo uploaded',
                text: 'Photo was successfully uploaded and submitted for review.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Upload error',
                text: 'Photo could not be uploaded.'
            })
        } finally {
            setUploading(false)
        }
    }

    const uploadUserAsset = async (imageUri, index, replaceImageId) => {
        const blurhash = await encodeImageToBlurhash(imageUri)

        let imageData = { image: imageUri, id: replaceImageId ?? uuid.v4(), status: IN_REVIEW, blurhash }

        if (!isNaN(index)) {
            imageData.index = index
            imageData.image_id_to_replace = data.active.find(image => image.index === index)?.id
        }

        let currentImages = [...userData.images]

        //if there's an existing file in storage, it will be replaced 
        const url = await uploadAssetToSupabase(imageData.image, userData.id + '/' + imageData.id)

        delete imageData.image
        imageData.download_url = url

        if (user_type === 'establishment') {
            imageData.establishment_id = userData.id
        } else {
            //user_tyoe === lady or editing lady under establishemnt (user_type === undefined)
            imageData.lady_id = userData.id
        }
        
        //overwriting another in review image
        if (replaceImageId) {
            currentImages = currentImages.filter(img => img.id !== replaceImageId)
        }
        
        currentImages.push(imageData)
        
        const { error } = await supabase
            .from('images')
            .upsert({ ...imageData })
            .select()

        if (error) {
            throw error
        }

        //bust the cache 
        if (replaceImageId) {
            imageData.download_url += '?bust=' + Date.now()
        }

        if (currentAuthUser.app_metadata.userrole === 'ADMIN' && userData.id !== currentAuthUser.id && user_type === 'lady') {
            updateNewLadyInRedux({ images: currentImages, id: userData.id })
        } else if(currentAuthUser.app_metadata.userrole === 'ADMIN' && userData.id !== currentAuthUser.id && user_type === 'establishment') {
            updateNewEstablishmentInRedux({ images: currentImages, id: userData.id })
        } else if (userData.establishment_id) {
            updateLadyInRedux({ images: currentImages, id: userData.id })
        } else {
            updateCurrentUserInRedux({ images: currentImages, id: userData.id })
        }
    }

    const uploadAssetToSupabase = async (assetUri, assetPath) => {
        const arraybuffer = await fetch(assetUri).then((res) => res.arrayBuffer())

        const { error: uploadError } = await supabase
            .storage
            .from('photos')
            .upload(assetPath, arraybuffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: getMimeType(assetUri)
            })

        if (uploadError) {
            throw uploadError
        }

        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(assetPath)

        return publicUrlData.publicUrl
    }

    //only cover photos can be edited
    const onEditImagePress = (index) => {
        const inReviewCoverImage = data.inReview.find(img => img.index === index)

        if (inReviewCoverImage) {
            //show confirmation modal that current in review will be overwritten
            setCoverImageToEdit(inReviewCoverImage)
        } else {
            openImagePicker(index)
        }
    }

    const onDeleteImagePress = async (imageId) => {
        const toDelete = userData.images.find(image => image.id === imageId)
        //deleting image in review when profile is in review
        if (toDelete.status === IN_REVIEW && userData.status === IN_REVIEW) {
            toastRef.show({
                type: 'warning',
                headerText: 'Profile is in review',
                text: 'You can not delete this photo, your profile is currently in review.'
            })

            return
        }

        setImageToDelete(imageId)
    }

    const deleteImage = async (imageId) => {
        try {
            const newImages = userData.images.filter(image => image.id !== imageId)

            const { error, data: data2 } = await supabase
                .from('images')
                .delete()
                .eq('id', imageId)
            if (error) {
                throw error
            }

            if (currentAuthUser.app_metadata.userrole === 'ADMIN' && userData.id !== currentAuthUser.id && user_type === 'lady') {
                updateNewLadyInRedux({ images: newImages, id: userData.id })
            } else if(currentAuthUser.app_metadata.userrole === 'ADMIN' && userData.id !== currentAuthUser.id && user_type === 'establishment') {
                updateNewEstablishmentInRedux({ images: newImages, id: userData.id })
            } else if (userData.establishment_id) {
                updateLadyInRedux({ images: newImages, id: userData.id })
            } else {
                updateCurrentUserInRedux({ images: newImages, id: userData.id })
            }
    
            toastRef.show({
                type: 'success',
                text: 'Photo was deleted.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                text: 'Photo could not be deleted.'
            })
        }
    }

    const onAddNewImagePress = () => {
        openImagePicker()
    }

    const onApproveImagePress = async (imageId) => {
        setSaving(true)
        try {
            let images = JSON.parse(JSON.stringify(userData.images))
            let toUpdate = images.find(image => image.id === imageId)
            
            toUpdate.status = ACTIVE
            toUpdate.approved_date = new Date()
            
            const { error } = await supabase
                .from('images')
                .update({ status: ACTIVE, approved_date: new Date() })
                .eq('id', imageId)

            if (error) {
                throw error
            }

            if (toUpdate.image_id_to_replace) {
                images = images.filter(image => image.id !== toUpdate.image_id_to_replace)
            }

            if (user_type === 'lady') {
                updateNewLadyInRedux({ images, id: userData.id })
            } else {
                updateNewEstablishmentInRedux({ images, id: userData.id })
            }

            toastRef.show({
                type: 'success',
                headerText: 'Image approved',
                text: 'Image has been approved'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                text: error.message
            })
        } finally {
            setSaving(false)
        }
    }

    const onRejectImagePress = async (imageId) => {
        try {
            let images = [...userData.images]
            let toUpdate = images.find(image => image.id === imageId)
            
            toUpdate.status = REJECTED
            toUpdate.approved_date = new Date()
            
            const { error } = await supabase
                .from('images')
                .update({ status: REJECTED, approved_date: new Date() })
                .eq('id', imageId)

            if (error) {
                throw error
            }

            if (user_type === 'lady') {
                updateNewLadyInRedux({ images, id: userData.id })
            } else {
                updateNewEstablishmentInRedux({ images, id: userData.id })
            }

            toastRef.show({
                type: 'success',
                headerText: 'Image rejected',
                text: 'Image has been rejected'
            })
        } catch(error) {
            toastRef.show({
                type: 'error',
                text: error.message
            })
        }
    }

    //ALL ACTIVE PHOTOS
    const hasAllCoverActivePhotos = () => {
        const coverActiveImages = data.active.filter(image => image.index != null && image.index < (user_type === 'establishment' ? 1 : 5))
        
        if (user_type === 'establishment') {
            return coverActiveImages.length === 1
        } else {
            return coverActiveImages.length === 5
        }
    }

    //ALL ACTIVE + IN REVIEW PHOTOS
    const hasAllCoverPhotos = () => {
        if (user_type === 'establishment') {
            const coverImage = userData.images.find(image => image.index === 0 && image.status === ACTIVE || image.status === IN_REVIEW)
            return !!coverImage
        } else {
            const coverImages = userData.images.filter(image => image.index != null && Number(image.index) < 5 && (image.status === ACTIVE || image.status === IN_REVIEW))
            return Number(coverImages.length) === 5
        }
    }

    //active cover image => display edit icon
    //active additional image -> display delete icon
    const activeImageActions = [
        {
            label: 'Delete',
            onPress: onDeleteImagePress,
            iconName: 'delete-outline'
        }
    ]

    const pendingImageActions = currentAuthUser.app_metadata.userrole === 'ADMIN' ? [
        {
            label: 'Approve',
            onPress: onApproveImagePress
        },
        {
            label: 'Reject',
            onPress: onRejectImagePress
        }
    ] : [
        {
            label: 'Delete',
            onPress: onDeleteImagePress,
            iconName: 'delete-outline'
        }
    ]

    const rejectedImageActions = [
        {
            label: 'Delete',
            onPress: onDeleteImagePress,
            iconName: 'delete-outline'
        }
    ]

    const renderPhotosGrid = (photos) => (
        <View style={{ flexDirection: 'row', marginHorizontal: SPACING.small, marginBottom: SPACING.small }}>
            <View style={{ width: '50%', flexShrink: 1, marginRight: SPACING.xxx_small, }}>
                {photos[0] ? <><Image
                    style={{
                        aspectRatio: 3 / 4,
                        width: 'auto',
                        borderRadius: 10
                    }}
                    source={{ uri: photos[0].download_url }}
                    placeholder={photos[0].blurhash}
                    resizeMode="cover"
                    transition={200}
                />
                    {userData.status !== REJECTED && <IconButton
                        style={{ position: 'absolute', top: 2, right: 2, }}
                        containerColor={COLORS.grey + 'B3'}
                        icon="pencil-outline"
                        iconColor='white'
                        size={normalize(20)}
                        onPress={() => onEditImagePress(0)}
                    />}
                </>
                    :
                    <TouchableRipple
                        rippleColor={'rgba(255,255,255,.08)'}
                        onPress={() => onEditImagePress(0)}
                        style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 3 / 4, borderRadius: 10 }}
                    >
                        <>
                            <AntDesign name="plus" size={normalize(30)} color="white" />
                            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                        </>
                    </TouchableRipple>}
            </View>
            <View style={{ flexDirection: 'column', width: '50%', flexShrink: 1 }}>
                <View style={{ flexDirection: 'row', marginBottom: SPACING.xxx_small, flexGrow: 1 }}>

                    <View style={{ flex: 1, marginRight: SPACING.xxx_small }}>
                        {photos[1] ? (
                            <>
                                <Image
                                    style={{
                                        flex: 1,
                                        aspectRatio: 3 / 4,
                                        borderRadius: 10
                                    }}
                                    source={{ uri: photos[1].download_url }}
                                    placeholder={photos[1].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                                {userData.status !== REJECTED && <IconButton
                                    style={{ position: 'absolute', top: 2, right: 2, }}
                                    containerColor={COLORS.grey + 'B3'}
                                    icon="pencil-outline"
                                    iconColor='white'
                                    size={normalize(20)}
                                    onPress={() => onEditImagePress(1)}
                                />}
                            </>
                        ) : <TouchableRipple
                            rippleColor={'rgba(255,255,255,.08)'}
                            onPress={() => onEditImagePress(1)}
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 3 / 4, borderRadius: 10 }}
                        >
                            <>
                                <AntDesign name="plus" size={normalize(30)} color="white" />
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                            </>
                        </TouchableRipple>}
                    </View>


                    <View style={{ flex: 1 }}>
                        {photos[2] ? (
                            <>
                                <Image
                                    style={{
                                        flex: 1,
                                        borderRadius: 10,
                                        aspectRatio: 3 / 4
                                    }}
                                    source={{ uri: photos[2].download_url }}
                                    placeholder={photos[2].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                                {userData.status !== REJECTED && <IconButton
                                    style={{ position: 'absolute', top: 2, right: 2, }}
                                    containerColor={COLORS.grey + 'B3'}
                                    icon="pencil-outline"
                                    iconColor='white'
                                    size={normalize(20)}
                                    onPress={() => onEditImagePress(2)}
                                />}
                            </>
                        ) : <TouchableRipple
                            rippleColor={'rgba(255,255,255,.08)'}
                            onPress={() => onEditImagePress(2)}
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 3 / 4, borderRadius: 10 }}
                        >
                            <>
                                <AntDesign name="plus" size={normalize(30)} color="white" />
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                            </>
                        </TouchableRipple>}
                    </View>
                </View>
                <View style={{ flexDirection: 'row', flexGrow: 1 }}>

                    <View style={{ flex: 1, marginRight: SPACING.xxx_small }}>
                        {photos[3] ? (
                            <>
                                <Image
                                    style={{
                                        flex: 1,
                                        aspectRatio: 3 / 4,
                                        borderRadius: 10
                                    }}
                                    source={{ uri: photos[3].download_url }}
                                    laceholder={photos.blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />
                                {userData.status !== REJECTED && <IconButton
                                    style={{ position: 'absolute', top: 2, right: 2, }}
                                    containerColor={COLORS.grey + 'B3'}
                                    icon="pencil-outline"
                                    iconColor='white'
                                    size={normalize(20)}
                                    onPress={() => onEditImagePress(3)}
                                />}
                            </>
                        ) : <TouchableRipple
                            rippleColor={'rgba(255,255,255,.08)'}
                            onPress={() => onEditImagePress(3)}
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 3 / 4, borderRadius: 10 }}
                        >
                            <>
                                <AntDesign name="plus" size={normalize(30)} color="white" />
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                            </>
                        </TouchableRipple>}
                    </View>

                    <View style={{ flex: 1 }}>
                        {photos[4] ? (
                            <>
                                <Image
                                    style={{
                                        flex: 1,
                                        borderRadius: 10,
                                        aspectRatio: 3 / 4
                                    }}
                                    source={{ uri: photos[4].download_url }}
                                    placeholder={photos[4].blurhash}
                                    resizeMode="cover"
                                    transition={200}
                                />

                                {userData.status !== REJECTED && <IconButton
                                    style={{ position: 'absolute', top: 2, right: 2, }}
                                    containerColor={COLORS.grey + 'B3'}
                                    icon="pencil-outline"
                                    iconColor='white'
                                    size={normalize(20)}
                                    onPress={() => onEditImagePress(4)}
                                />}
                            </>
                        ) : <TouchableRipple
                            rippleColor={'rgba(255,255,255,.08)'}
                            onPress={() => onEditImagePress(4)}
                            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 3 / 4, borderRadius: 10 }}
                        >
                            <>
                                <AntDesign name="plus" size={normalize(30)} color="white" />
                                <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                            </>
                        </TouchableRipple>}
                    </View>
                </View>
            </View>
        </View>
    )

    const renderCoverPhoto = (photo ) => (
        <View style={{ flexDirection: 'row', marginHorizontal: SPACING.small, marginBottom: SPACING.small }}>
            {photo ?
                <React.Fragment>
                    <Image
                        style={{
                            flex: 1,
                            borderRadius: 10,
                            aspectRatio: 16 / 9,
                        }}
                        source={{ uri: photo.download_url }}
                        placeholder={photo.blurhash}
                        resizeMode="cover"
                        transition={200}
                    />
                    {userData.status !== REJECTED && <IconButton
                        style={{ position: 'absolute', top: normalize(10) - SPACING.xxx_small, right: normalize(10) - SPACING.xxx_small, backgroundColor: COLORS.grey + 'B3' }}
                        icon="pencil-outline"
                        iconColor='white'
                        size={normalize(20)}
                        onPress={() => onEditImagePress(0)}
                    />}
                </React.Fragment> :
                <TouchableRipple
                    rippleColor={'rgba(255,255,255,.08)'}
                    onPress={() => onEditImagePress(0)}
                    style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center', width: 'auto', aspectRatio: 16 / 9, flex: 1, borderRadius: 10 }}
                >
                    <>
                        <AntDesign name="plus" size={normalize(30)} color="white" />
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF' }}>Add</Text>
                    </>
                </TouchableRipple>
            }
        </View>
    )

    const renderAdditionalPhotos = (images, actions, showActions = true) => {
        if (!images?.length) {
            return null
        }

        return (
            <View style={{ flexDirection: 'row', marginLeft: SPACING.small, marginRight: SPACING.small - SPACING.small, marginBottom: SPACING.small, flexWrap: 'wrap' }}>
                {images.map((image) =>
                    <View key={image.download_url} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', borderRadius: 10, overflow: 'hidden', width: ((sectionWidth - (SPACING.small * 2) - (SPACING.small * 2)) / 3), marginRight: SPACING.small, marginBottom: SPACING.small }}>
                        <RenderImageWithActions image={image} actions={actions} offsetX={(windowWidth * index) + offsetX} showActions={showActions} />
                    </View>)}
            </View>
        )
    }

    const renderActive = () => {
        const photos = (
            (userData.status === ACTIVE || userData.status === INACTIVE || currentAuthUser.app_metadata.userrole === 'ADMIN')
                ? data.active.filter(image => image.index != null && image.index < (user_type === 'establishment' ? 1 : 5))//.slice(0, user_type === 'establishment' ? 1 : 5) 
                //For REJECTED Concat active and in review -> user is uploading missing cover images one by one
                : data.active.filter(image => image.index != null && image.index < (user_type === 'establishment' ? 1 : 5)).concat(data.inReview.filter(image => image.index != null && image.index < user_type === 'establishment' ? 1 : 5))//.slice(0, user_type === 'establishment' ? 1 : 5).concat(data.inReview.slice(0, user_type === 'establishment' ? 1 : 5))
        )
        .reduce((out, current) => {
            out[current.index] = current

            return out
        }, {})

        return (
            <View style={styles.section}>
                <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flexShrink: 1 }}>
                        <Octicons name="dot-fill" size={20} color={(userData.status === ACTIVE || userData.status === INACTIVE || currentAuthUser.app_metadata.userrole === 'ADMIN') ? "green" : "orange"} style={{ marginRight: SPACING.xx_small }} />
                        <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                            {userData.status === REJECTED ? 'Photos' : 'Active'}
                        </Text>
                        {(userData.status === ACTIVE || userData.status === INACTIVE) && <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                            • {data.active.length}
                        </Text>}
                    </View>

                    {((data.active.length + data.inReview.length) < MAX_PHOTOS) && hasAllCoverActivePhotos() && <Button
                        labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                        style={{ height: 'auto' }}
                        mode="outlined"
                        icon="plus"
                        onPress={onAddNewImagePress}
                        rippleColor="rgba(220, 46, 46, .16)"
                    >
                        Add photo
                    </Button>}
                </View>

                {!hasAllCoverPhotos() && userData.status === REJECTED && <>
                    <View style={{ flexDirection: 'row', marginHorizontal: SPACING.small, marginBottom: SPACING.xx_small }}>
                        <Ionicons name="information-circle-outline" size={normalize(20)} color={COLORS.error} style={{ marginRight: SPACING.xx_small, marginTop: 1 }} />

                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: COLORS.error }}>
                            Upload all cover photos
                        </Text>
                    </View>
                </>}
                {user_type === 'establishment' && renderCoverPhoto(photos[0])}
                {user_type === 'lady' && renderPhotosGrid(photos)}
                {renderAdditionalPhotos(data.active.filter(image => image.index == null || image.index >= (user_type === 'establishment' ? 1 : 5))/*slice(user_type === 'establishment' ? 1 : 5)*/, activeImageActions)}
            </View>
        )
    }

    const renderInReview = () => {
        if (data.inReview.length === 0 && userData.status !== IN_REVIEW) {
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
                            No photos in review
                        </Text>
                        : renderAdditionalPhotos(data.inReview, pendingImageActions, userData.status !== IN_REVIEW || currentAuthUser.app_metadata.userrole === 'ADMIN')
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

                {renderAdditionalPhotos(data.rejected, rejectedImageActions)}
            </View>
        )
    }

    return (
        <View style={{ paddingBottom: SPACING.large }} onLayout={onLayout}>
            {(userData.status === ACTIVE || userData.status === REJECTED || userData.status === INACTIVE || currentAuthUser.app_metadata.userrole === 'ADMIN') && renderActive()}
            {(userData.status !== REJECTED || currentAuthUser.app_metadata.userrole === 'ADMIN') && renderInReview()}
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

            {saving && <OverlaySpinner />}

            <ConfirmationModal 
                visible={!!imageToDelete}
                headerText='Confirm delete'
                text='Are you sure you want to delete this Photo?'
                onCancel={() => setImageToDelete(undefined)}
                onConfirm={() => deleteImage(imageToDelete)}
                icon='delete-outline'
                headerErrorText='Delete error'
                errorText='Photo could not be deleted.'
            />

            <ConfirmationModal 
                visible={!!coverImageToEdit}
                headerText='Replace in review cover photo?'
                text='There is already an image in review for the selected cover photo. By proceeding, you will replace the existing in-review image with the new one. Are you sure you want to continue?'
                onCancel={() => setCoverImageToEdit(undefined)}
                onConfirm={() => openImagePicker(coverImageToEdit.index, coverImageToEdit.id)}
                //icon='delete-outline'
                headerErrorText='Edit error'
                errorText='Photo could not be edited.'
                confirmLabel='Continue'
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef,
    currentAuthUser: store.userState.currentAuthUser
})

export default connect(mapStateToProps, { updateCurrentUserInRedux, updateLadyInRedux, updateNewLadyInRedux, updateNewEstablishmentInRedux })(memo(Photos))

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
    }
})