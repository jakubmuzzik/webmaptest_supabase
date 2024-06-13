import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { SPACING, FONTS, FONT_SIZES, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { IconButton } from 'react-native-paper'
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons'
import { stripEmptyParams, getParam, normalize } from '../../utils'
import RenderAccountLady from '../../components/list/RenderAccountLady'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchNewPhotos, setNewPhotos } from '../../redux/actions'
import { ACTIVE, DELETED, INACTIVE, IN_REVIEW, REJECTED} from '../../labels'
import { MOCK_DATA } from '../../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import OverlaySpinner from '../../components/modal/OverlaySpinner'

import DropdownSelect from '../../components/DropdownSelect'
import RenderImageWithActions from '../../components/list/RenderImageWithActions'

import { supabase } from '../../supabase/config'

const NewPhotos = ({ newPhotos, toastRef, fetchNewPhotos, setNewPhotos, index }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])
     
    const [sectionWidth, setSectionWidth] = useState(0)

    const [saving, setSaving] = useState(false)

    const [photoToReject, setPhotoToReject] = useState()
    const [photoToActivate, setPhotoToActivate] = useState()
    const [rejectAllPhotosForProfile, setRejectAllPhotosForProfile] = useState()
    const [activateAllPhotosForProfile, setActivateAllPhotosForProfile] = useState()

    const [photos, setPhotos] = useState(undefined)

    useEffect(() => {
        if (newPhotos === null) {
            fetchNewPhotos()
        } else {
            const reducePhotos = (out, current, foreignKeyName) => {
                if (out[current[foreignKeyName]]) {
                    out[current[foreignKeyName]] = {
                        data: [
                            ...out[current[foreignKeyName]].data,
                            current
                        ],
                        ref: out[current[foreignKeyName]].ref
                    }
                } else {
                    out[current[foreignKeyName]] = {
                        data: [current],
                        ref: React.createRef()
                    }
                }

                return out
            }
            let groupedLadiesPhotos = newPhotos.filter(newPhoto => newPhoto.lady_id).reduce((out, current) => reducePhotos(out, current, 'lady_id'), {})

            let groupedEstPhotos = newPhotos.filter(newPhoto => newPhoto.establishment_id).reduce((out, current) => reducePhotos(out, current, 'establishment_id'), {})

            setPhotos({
                ladies: groupedLadiesPhotos,
                establishments: groupedEstPhotos
            })
        }
    }, [newPhotos])

    const navigate = useNavigate()

    const { width: windowWidth } = useWindowDimensions()

    const onLayout = (event) => {
        //-2 due to border radius
        setSectionWidth(event.nativeEvent.layout.width - 2 - SPACING.small - SPACING.small)
    }

    const cardWidth = useMemo(() => {
        const isXSmallScreen = sectionWidth < 300
        const isSmallScreen = sectionWidth >= 300 && sectionWidth < 550
        const isMediumScreen = sectionWidth >= 550 && sectionWidth < 750
        const isXMediumScreen = sectionWidth >= 750 && sectionWidth < 960
        const isLargeScreen = sectionWidth >= 960 && sectionWidth < 1300

        return isXSmallScreen ? ((sectionWidth - SPACING.small - SPACING.small)) 
            : isSmallScreen ? ((sectionWidth - SPACING.small - SPACING.small) / 2) - (SPACING.small) / 2
                : isMediumScreen ? ((sectionWidth - SPACING.small - SPACING.small) / 3) - (SPACING.small * 2) / 3
                    : isXMediumScreen ? ((sectionWidth - SPACING.small - SPACING.small) / 4) - (SPACING.small * 3) / 4
                        : isLargeScreen ? ((sectionWidth - SPACING.small - SPACING.small) / 5) - (SPACING.small * 4) / 5 : ((sectionWidth - SPACING.small - SPACING.small) / 6) - (SPACING.small * 5) / 6
    }, [sectionWidth])

    const rejectAllPhotos = async (profileId) => {
        setSaving(true)
        try {
            const isLady = Object.keys(photos.ladies).includes(profileId)

            const profilePhotos = isLady ? photos.ladies[profileId].data : photos.establishments[profileId].data
            
            const { error: updateError } = await supabase
                .from('images')
                .upsert(profilePhotos.map(photo => ({ id: photo.id, status: REJECTED })))

            if (updateError) {
                throw updateError
            }

            setNewPhotos(newPhotos.filter(newPhoto => isLady ? newPhoto.lady_id !== profileId : newPhoto.establishment_id !== profileId))

            toastRef.show({
                type: 'success',
                headerText: 'Photos rejected',
                text: 'Photos were successfuly rejected.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Rejection error',
                text: 'Photos could not be rejected.'
            })
        } finally {
            setSaving(false)
        }
    }

    const activateAllPhotos = async (profileId) => {
        setSaving(true)
        try {
            const isLady = Object.keys(photos.ladies).includes(profileId)

            const profilePhotos = isLady ? photos.ladies[profileId].data : photos.establishments[profileId].data

            console.log(profilePhotos.map(photo => ({ id: photo.id, status: ACTIVE })))

            const { error: updateError } = await supabase
                .from('images')
                .upsert(profilePhotos.map(photo => ({ id: photo.id, status: ACTIVE })))

            if (updateError) {
                throw updateError
            }

            setNewPhotos(newPhotos.filter(newPhoto => isLady ? newPhoto.lady_id !== profileId : newPhoto.establishment_id !== profileId))

            toastRef.show({
                type: 'success',
                headerText: 'Photos activated',
                text: 'Photos were successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Photos could not be activated.'
            })
        } finally {
            setSaving(false)
        }
    }

    const activatePhoto = async (photoId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('images')
                .update({ status: ACTIVE })
                .eq('id', photoId)

            if (updateError) {
                throw updateError
            }

            setNewPhotos(newPhotos.filter(newPhoto => newPhoto.id !== photoId))

            toastRef.show({
                type: 'success',
                headerText: 'Photo activated',
                text: 'Photo was successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Photo could not be activated.'
            })
        } finally {
            setSaving(false)
        }
    }

    const rejectPhoto = async (photoId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('images')
                .update({ status: REJECTED })
                .eq('id', photoId)

            if (updateError) {
                throw updateError
            }

            setNewPhotos(newPhotos.filter(newPhoto => newPhoto.id !== photoId))

            toastRef.show({
                type: 'success',
                headerText: 'Photo rejected',
                text: 'Photo was successfuly rejected.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Rejection error',
                text: 'Photo could not be rejected.'
            })
        } finally {
            setSaving(false)
        }
    }

    const onViewProfilePress = (profileId) => {        
        navigate({
            pathname: Object.keys(photos.ladies).includes(profileId) ? ('/lady/' + profileId) : ('/establishment/' + profileId),
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onActivateAllPress = (profileId) => {
        setActivateAllPhotosForProfile(profileId)
    }

    const onRejectAllPress = (profileId) => {
        setRejectAllPhotosForProfile(profileId)
    }

    const onActivatePress = (photoId) => {
        setPhotoToActivate(photoId)
    }

    const onRejectPress = (photoId) => {
        setPhotoToReject(photoId)
    }

    const ladyActions = [
        {
            label: 'View profile',
            onPress: onViewProfilePress
        },
        {
            label: 'Approve all',
            onPress: onActivateAllPress
        },
        {
            label: 'Reject all',
            onPress: onRejectAllPress
        },
    ]

    const photoActions = [
        {
            label: 'Approve',
            onPress: onActivatePress
        },
        {
            label: 'Reject',
            onPress: onRejectPress
        },
    ]


    if (photos == null) {
        return (
            <View onLayout={onLayout} style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', paddingVertical: SPACING.x_large }}>
                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={35} />
                </ContentLoader>
                <ContentLoader
                    speed={2}
                    height={200}
                    style={{ marginTop: SPACING.medium, borderRadius: 20 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height={200} />
                </ContentLoader>
            </View>
        )
    }

    return (
        <View onLayout={onLayout} style={{ paddingBottom: SPACING.large, width: normalize(800), maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.small }}>
            {newPhotos.length === 0 && <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={{ color: COLORS.greyText, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textAlign: 'center' }}>
                        No photos for review
                    </Text>
                </View>
            </View>}

            {Object.keys(photos.ladies).length > 0 && (
                <>
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h3, paddingBottom: SPACING.small }}>
                        Ladies
                    </Text>

                    {Object.keys(photos.ladies).map(ladyId => (
                        <View style={[styles.section, { marginBottom: SPACING.small }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.x_large, padding: SPACING.small }}>
                                    {photos.ladies[ladyId].data[0].ladies.name}
                                    <Text style={{ color: COLORS.greyText }}>{' • ' + photos.ladies[ladyId].data.length}</Text>
                                </Text>

                                <DropdownSelect
                                    ref={photos.ladies[ladyId].ref}
                                    offsetX={windowWidth * index}
                                    values={ladyActions.map(action => action.label)}
                                    setText={(text) => ladyActions.find(action => action.label === text).onPress(photos.ladies[ladyId].data[0].ladies.id)}
                                >
                                    <IconButton
                                        icon="dots-horizontal"
                                        iconColor="#FFF"
                                        containerColor={COLORS.grey + 'B3'}
                                        size={22}
                                        onPress={() => photos.ladies[ladyId].ref?.current.onDropdownPress()}
                                    />
                                </DropdownSelect>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                {photos.ladies[ladyId].data.map(photo => (
                                    <View key={photo.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small, borderRadius: 10, overflow: 'hidden' }}>
                                        <RenderImageWithActions image={photo} actions={photoActions} offsetX={windowWidth * index}/>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </>
            )}

            {Object.keys(photos.establishments).length > 0 && (
                <>
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h3, paddingVertical: SPACING.small }}>
                        Establishments
                    </Text>

                    {Object.keys(photos.establishments).map(establishmentId => (
                        <View style={[styles.section, { marginBottom: SPACING.small }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.x_large, padding: SPACING.small }}>
                                    {photos.establishments[establishmentId].data[0].establishments.name}
                                    <Text style={{ color: COLORS.greyText }}>{' • ' + photos.establishments[establishmentId].data.length}</Text>
                                </Text>

                                <DropdownSelect
                                    ref={photos.establishments[establishmentId].ref}
                                    offsetX={windowWidth * index}
                                    values={ladyActions.map(action => action.label)}
                                    setText={(text) => ladyActions.find(action => action.label === text).onPress(photos.establishments[establishmentId].data[0].establishments.id)}
                                >
                                    <IconButton
                                        icon="dots-horizontal"
                                        iconColor="#FFF"
                                        containerColor={COLORS.grey + 'B3'}
                                        size={22}
                                        onPress={() => photos.establishments[establishmentId].ref?.current.onDropdownPress()}
                                    />
                                </DropdownSelect>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                {photos.establishments[establishmentId].data.map(photo => (
                                    <View key={photo.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small, borderRadius: 10, overflow: 'hidden' }}>
                                        <RenderImageWithActions image={photo} actions={photoActions} offsetX={windowWidth * index}/>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </>
            )}

            {saving && <OverlaySpinner />}

            <ConfirmationModal
                visible={!!activateAllPhotosForProfile}
                headerText='Confirm Activation'
                text='Are you sure you want to approve all Photos?'
                onCancel={() => setActivateAllPhotosForProfile(undefined)}
                onConfirm={() => activateAllPhotos(activateAllPhotosForProfile)}
                headerErrorText='Activation error'
                errorText='Photos could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!rejectAllPhotosForProfile}
                headerText='Confirm Rejection'
                text='Are you sure you want to reject all Photos?'
                onCancel={() => setRejectAllPhotosForProfile(undefined)}
                onConfirm={() => rejectAllPhotos(rejectAllPhotosForProfile)}
                headerErrorText='Rejection error'
                errorText='Photos could not be rejected.'
                confirmLabel='Reject'
                confirmButtonColor={COLORS.lightBlack}
            />

            <ConfirmationModal
                visible={!!photoToActivate}
                headerText='Confirm Activation'
                text='Are you sure you want to approve selected Photo?'
                onCancel={() => setPhotoToActivate(undefined)}
                onConfirm={() => activatePhoto(photoToActivate)}
                headerErrorText='Activation error'
                errorText='Photo could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!photoToReject}
                headerText='Confirm Rejection'
                text='Are you sure you want to reject selected Photo?'
                onCancel={() => setPhotoToReject(undefined)}
                onConfirm={() => rejectPhoto(photoToReject)}
                headerErrorText='Rejection error'
                errorText='Photo could not be rejected.'
                confirmLabel='Reject'
                confirmButtonColor={COLORS.lightBlack}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    newPhotos: store.adminState.newPhotos,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchNewPhotos, setNewPhotos })(memo(NewPhotos))

const styles = StyleSheet.create({
    section: {
        borderRadius: 20,
        backgroundColor: COLORS.grey,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,.08)',
    },
    sectionHeader: {
        flexDirection: 'row',
        margin: SPACING.small,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sectionHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3
    }
})