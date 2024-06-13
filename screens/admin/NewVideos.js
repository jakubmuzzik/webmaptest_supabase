import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { SPACING, FONTS, FONT_SIZES, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { IconButton } from 'react-native-paper'
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons'
import { stripEmptyParams, getParam, normalize } from '../../utils'
import RenderAccountLady from '../../components/list/RenderAccountLady'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchNewVideos, setNewVideos } from '../../redux/actions'
import { ACTIVE, DELETED, INACTIVE, IN_REVIEW, REJECTED} from '../../labels'
import { MOCK_DATA } from '../../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import OverlaySpinner from '../../components/modal/OverlaySpinner'

import DropdownSelect from '../../components/DropdownSelect'
import RenderVideoWithActions from '../../components/list/RenderVideoWithActions'

import { supabase } from '../../supabase/config'

const NewVideos = ({ newVideos, toastRef, fetchNewVideos, setNewVideos, index }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])
     
    const [sectionWidth, setSectionWidth] = useState(0)

    const [saving, setSaving] = useState(false)

    const [videoToReject, setVideoToReject] = useState()
    const [videoToActivate, setVideoToActivate] = useState()
    const [rejectAllVideosForProfile, setRejectAllVideosForProfile] = useState()
    const [activateAllVideosForProfile, setActivateAllVideosForProfile] = useState()

    const [videos, setVideos] = useState(undefined)

    useEffect(() => {
        if (newVideos === null) {
            fetchNewVideos()
        } else {
            const reduceVideos = (out, current, foreignKeyName) => {
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
            let groupedLadiesVideos = newVideos.filter(newVideo => newVideo.lady_id).reduce((out, current) => reduceVideos(out, current, 'lady_id'), {})

            let groupedEstVideos = newVideos.filter(newVideo => newVideo.establishment_id).reduce((out, current) => reduceVideos(out, current, 'establishment_id'), {})

            setVideos({
                ladies: groupedLadiesVideos,
                establishments: groupedEstVideos
            })
        }
    }, [newVideos])

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

    const rejectAllVideos = async (profileId) => {
        setSaving(true)
        try {
            const isLady = Object.keys(videos.ladies).includes(profileId)

            const profileVideos = isLady ? videos.ladies[profileId].data : videos.establishments[profileId].data
            
            const { error: updateError } = await supabase
                .from('videos')
                .upsert(profileVideos.map(video => ({ id: video.id, status: REJECTED })))

            if (updateError) {
                throw updateError
            }

            setNewVideos(newVideos.filter(newVideo => isLady ? newVideo.lady_id !== profileId : newVideo.establishment_id !== profileId))

            toastRef.show({
                type: 'success',
                headerText: 'Videos rejected',
                text: 'Videos were successfuly rejected.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Rejection error',
                text: 'Videos could not be rejected.'
            })
        } finally {
            setSaving(false)
        }
    }

    const activateAllVideos = async (profileId) => {
        setSaving(true)
        try {
            const isLady = Object.keys(videos.ladies).includes(profileId)

            const profileVideos = isLady ? videos.ladies[profileId].data : videos.establishments[profileId].data

            console.log(profileVideos.map(video => ({ id: video.id, status: ACTIVE })))

            const { error: updateError } = await supabase
                .from('videos')
                .upsert(profileVideos.map(video => ({ id: video.id, status: ACTIVE })))

            if (updateError) {
                throw updateError
            }

            setNewVideos(newVideos.filter(newVideo => isLady ? newVideo.lady_id !== profileId : newVideo.establishment_id !== profileId))

            toastRef.show({
                type: 'success',
                headerText: 'Videos activated',
                text: 'Videos were successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Videos could not be activated.'
            })
        } finally {
            setSaving(false)
        }
    }

    const activateVideo = async (videoId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('videos')
                .update({ status: ACTIVE })
                .eq('id', videoId)

            if (updateError) {
                throw updateError
            }

            setNewVideos(newVideos.filter(newVideo => newVideo.id !== videoId))

            toastRef.show({
                type: 'success',
                headerText: 'Video activated',
                text: 'Video was successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Video could not be activated.'
            })
        } finally {
            setSaving(false)
        }
    }

    const rejectVideo = async (videoId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('videos')
                .update({ status: REJECTED })
                .eq('id', videoId)

            if (updateError) {
                throw updateError
            }

            setNewVideos(newVideos.filter(newVideo => newVideo.id !== videoId))

            toastRef.show({
                type: 'success',
                headerText: 'Video rejected',
                text: 'Video was successfuly rejected.'
            })
        } catch(error) {
            console.error(error)
            toastRef.show({
                type: 'error',
                headerText: 'Rejection error',
                text: 'Video could not be rejected.'
            })
        } finally {
            setSaving(false)
        }
    }

    const onViewProfilePress = (profileId) => {        
        navigate({
            pathname: Object.keys(videos.ladies).includes(profileId) ? ('/lady/' + profileId) : ('/establishment/' + profileId),
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onActivateAllPress = (profileId) => {
        setActivateAllVideosForProfile(profileId)
    }

    const onRejectAllPress = (profileId) => {
        setRejectAllVideosForProfile(profileId)
    }

    const onActivatePress = (videoId) => {
        setVideoToActivate(videoId)
    }

    const onRejectPress = (videoId) => {
        setVideoToReject(videoId)
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

    const videoActions = [
        {
            label: 'Approve',
            onPress: onActivatePress
        },
        {
            label: 'Reject',
            onPress: onRejectPress
        },
    ]


    if (videos == null) {
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
            {newVideos.length === 0 && <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={{ color: COLORS.greyText, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textAlign: 'center' }}>
                        No videos for review
                    </Text>
                </View>
            </View>}

            {Object.keys(videos.ladies).length > 0 && (
                <>
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h3, paddingBottom: SPACING.small }}>
                        Ladies
                    </Text>

                    {Object.keys(videos.ladies).map(ladyId => (
                        <View style={[styles.section, { marginBottom: SPACING.small }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.x_large, padding: SPACING.small }}>
                                    {videos.ladies[ladyId].data[0].ladies.name}
                                    <Text style={{ color: COLORS.greyText }}>{' • ' + videos.ladies[ladyId].data.length}</Text>
                                </Text>

                                <DropdownSelect
                                    ref={videos.ladies[ladyId].ref}
                                    offsetX={windowWidth * index}
                                    values={ladyActions.map(action => action.label)}
                                    setText={(text) => ladyActions.find(action => action.label === text).onPress(videos.ladies[ladyId].data[0].ladies.id)}
                                >
                                    <IconButton
                                        icon="dots-horizontal"
                                        iconColor="#FFF"
                                        containerColor={COLORS.grey + 'B3'}
                                        size={22}
                                        onPress={() => videos.ladies[ladyId].ref?.current.onDropdownPress()}
                                    />
                                </DropdownSelect>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                {videos.ladies[ladyId].data.map(video => (
                                    <View key={video.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small, borderRadius: 10, overflow: 'hidden' }}>
                                        <RenderVideoWithActions video={video} actions={videoActions} offsetX={windowWidth * index}/>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </>
            )}

            {Object.keys(videos.establishments).length > 0 && (
                <>
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.h3, paddingVertical: SPACING.small }}>
                        Establishments
                    </Text>

                    {Object.keys(videos.establishments).map(establishmentId => (
                        <View style={[styles.section, { marginBottom: SPACING.small }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.x_large, padding: SPACING.small }}>
                                    {videos.establishments[establishmentId].data[0].establishments.name}
                                    <Text style={{ color: COLORS.greyText }}>{' • ' + videos.establishments[establishmentId].data.length}</Text>
                                </Text>

                                <DropdownSelect
                                    ref={videos.establishments[establishmentId].ref}
                                    offsetX={windowWidth * index}
                                    values={ladyActions.map(action => action.label)}
                                    setText={(text) => ladyActions.find(action => action.label === text).onPress(videos.establishments[establishmentId].data[0].establishments.id)}
                                >
                                    <IconButton
                                        icon="dots-horizontal"
                                        iconColor="#FFF"
                                        containerColor={COLORS.grey + 'B3'}
                                        size={22}
                                        onPress={() => videos.establishments[establishmentId].ref?.current.onDropdownPress()}
                                    />
                                </DropdownSelect>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                                {videos.establishments[establishmentId].data.map(video => (
                                    <View key={video.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small, borderRadius: 10, overflow: 'hidden' }}>
                                        <RenderVideoWithActions video={video} actions={videoActions} offsetX={windowWidth * index}/>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </>
            )}

            {saving && <OverlaySpinner />}

            <ConfirmationModal
                visible={!!activateAllVideosForProfile}
                headerText='Confirm Activation'
                text='Are you sure you want to approve all Videos?'
                onCancel={() => setActivateAllVideosForProfile(undefined)}
                onConfirm={() => activateAllVideos(activateAllVideosForProfile)}
                headerErrorText='Activation error'
                errorText='Videos could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!rejectAllVideosForProfile}
                headerText='Confirm Rejection'
                text='Are you sure you want to reject all Videos?'
                onCancel={() => setRejectAllVideosForProfile(undefined)}
                onConfirm={() => rejectAllVideos(rejectAllVideosForProfile)}
                headerErrorText='Rejection error'
                errorText='Videos could not be rejected.'
                confirmLabel='Reject'
                confirmButtonColor={COLORS.lightBlack}
            />

            <ConfirmationModal
                visible={!!videoToActivate}
                headerText='Confirm Activation'
                text='Are you sure you want to approve selected Video?'
                onCancel={() => setVideoToActivate(undefined)}
                onConfirm={() => activateVideo(videoToActivate)}
                headerErrorText='Activation error'
                errorText='Video could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!videoToReject}
                headerText='Confirm Rejection'
                text='Are you sure you want to reject selected Video?'
                onCancel={() => setVideoToReject(undefined)}
                onConfirm={() => rejectVideo(videoToReject)}
                headerErrorText='Rejection error'
                errorText='Video could not be rejected.'
                confirmLabel='Reject'
                confirmButtonColor={COLORS.lightBlack}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    newVideos: store.adminState.newVideos,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchNewVideos, setNewVideos })(memo(NewVideos))

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