import React, { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Image } from 'react-native'
import { Entypo } from '@expo/vector-icons'
import { SPACING, FONTS, FONT_SIZES, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { Button } from 'react-native-paper'
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons'
import { stripEmptyParams, getParam, normalize } from '../../utils'
import RenderAccountLady from '../../components/list/RenderAccountLady'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { fetchLadies, removeLadyFromRedux, updateLadyInRedux } from '../../redux/actions'
import { ACTIVE, DELETED, INACTIVE, IN_REVIEW, REJECTED} from '../../labels'
import { MOCK_DATA } from '../../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import ConfirmationModal from '../../components/modal/ConfirmationModal'

import { updateDoc, doc, db, ref, uploadBytes, storage, getDownloadURL, deleteObject } from '../../firebase/config'

const Ladies = ({ route, index, setTabHeight, ladies, fetchLadies, removeLadyFromRedux, updateLadyInRedux, toastRef }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const hasRendered = useRef()

    /**
     * active: [],
        inactive: [],
        inReview: [],
        rejected: []
     */
    const [data, setData] = useState({})
    const [sectionWidth, setSectionWidth] = useState(0)

    const [ladyToDeactivate, setLadyToDeactivate] = useState()
    const [ladyToActivate, setLadyToActivate] = useState()
    const [ladyToDelete, setLadyToDelete] = useState()

    useEffect(() => {
        if (!ladies) {
            fetchLadies()
        } else {
            const active = ladies.filter(lady => lady.status === ACTIVE)
            const inactive = ladies.filter(lady => lady.status === INACTIVE)
            const inReview = ladies.filter(lady => lady.status === IN_REVIEW)
            const rejected = ladies.filter(lady => lady.status === REJECTED)

            setData({
                active, inactive, inReview, rejected
            })
        }
    }, [ladies])

    const navigate = useNavigate()

    const { width: windowWidth } = useWindowDimensions()

    const onLayout = (event) => {
        //-2 due to border radius
        setSectionWidth(event.nativeEvent.layout.width - 2)
        setTabHeight(event.nativeEvent.layout.height)
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

    const deleteLady = async (ladyId) => {
        try {
            await updateDoc(doc(db, 'users', ladyId), { status: DELETED })

            removeLadyFromRedux(ladyId)

            toastRef.current.show({
                type: 'success',
                headerText: 'Lady deleted',
                text: 'Lady was successfuly deleted.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Delete error',
                text: 'Lady could not be deleted.'
            })
        }
    }

    const deactivateLady = async (ladyId) => {
        try {
            await updateDoc(doc(db, 'users', ladyId), { status: INACTIVE })

            updateLadyInRedux({ status: INACTIVE, id: ladyId })

            toastRef.current.show({
                type: 'success',
                headerText: 'Lady deactivated',
                text: 'Lady was successfuly deactivated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Deactivate error',
                text: 'Lady could not be deactivated.'
            })
        }
    }

    const activateLady = async (ladyId) => {
        try {
            await updateDoc(doc(db, 'users', ladyId), { status: ACTIVE })

            updateLadyInRedux({ status: ACTIVE, id: ladyId })

            toastRef.current.show({
                type: 'success',
                headerText: 'Lady activated',
                text: 'Lady was successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Lady could not be activated.'
            })
        }
    }

    const onOpenProfilePress = (ladyId) => {
        navigate({
            pathname: '/profile/' + ladyId, 
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onAddNewLadyPress = () => {
        navigate({
            pathname: '/account/add-lady',
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onDeletePress = (ladyId) => {
        setLadyToDelete(ladyId)
    }

    const onDeactivatePress = (ladyId) => {
        setLadyToDeactivate(ladyId)
    }

    const onActivatePress = (ladyId) => {
        setLadyToActivate(ladyId)
    }

    const onShowRejectedReasonPress = () => {

    }

    const onEditLadyPress = (ladyId) => {
        navigate({
            pathname: '/account/edit-lady/' + ladyId,
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    //cant use useRef -> didn't work on mobile
    const activeActions = [
        {
            label: 'Edit',
            onPress: onEditLadyPress
        },
        {
            label: 'Deactivate',
            onPress: onDeactivatePress
        },
        {
            label: 'Show profile',
            onPress: onOpenProfilePress
        },
        {
            label: 'Delete',
            onPress: onDeletePress
        }
    ]

    const inactiveActions = [
        {
            label: 'Edit',
            onPress: onEditLadyPress
        },
        {
            label: 'Activate',
            onPress: onActivatePress
        },
        {
            label: 'Delete',
            onPress: onDeletePress
        }
    ]

    const inReviewActions = [
        {
            label: 'Edit',
            onPress: onEditLadyPress
        },
        {
            label: 'Delete',
            onPress: onDeletePress,
            iconName: 'delete-outline'
        }
    ]

    const rejectedActions = [
        {
            label: 'Edit',
            onPress: onEditLadyPress
        },
        {
            label: 'Delete',
            onPress: onDeletePress
        }
    ]

    if (Object.keys(data).length === 0) {
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

                <ContentLoader
                    speed={2}
                    height={35}
                    width={'21.25%'}
                    style={{ borderRadius: 5, marginTop: SPACING.x_large }}
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
    
                <Button
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    style={{ height: 'auto' }}
                    mode="outlined"
                    icon="plus"
                    onPress={onAddNewLadyPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Add lady
                </Button>
            </View>
    
            {
                data.active.length === 0 ? <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, textAlign: 'center', margin: SPACING.small }}>
                    No active profiles
                </Text> : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                        {data.active.map(lady => (
                            <View key={lady.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                                <RenderAccountLady lady={lady} width={cardWidth} actions={activeActions} offsetX={windowWidth * index} />
                            </View>
                        ))}
                    </View>
                )
            }
        </View>
    )

    const renderInReview = () => (
        data.inReview.length === 0 ? null :
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
    
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                    {data.inReview.map(lady => (
                        <View key={lady.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                            <RenderAccountLady lady={lady} width={cardWidth} actions={inReviewActions} offsetX={windowWidth * index} />
                        </View>
                    ))}
                </View>
            </View>
    )

    const renderInactive = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Octicons name="dot-fill" size={20} color="grey" style={{ marginRight: SPACING.xx_small }} />
                <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                    Inactive
                </Text>
                <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                    • {data.length}
                </Text>
            </View>
    
            {
                data.inactive.length === 0 ? (
                    <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: COLORS.greyText, textAlign: 'center', margin: SPACING.small }}>
                        No inactive profiles
                    </Text>
                ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                        {data.inactive.map(lady => (
                            <View key={lady.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                                <RenderAccountLady lady={lady} width={cardWidth} actions={inactiveActions} offsetX={windowWidth * index} />
                            </View>
                        ))}
                    </View>
                )
            }
        </View>
    )

    const renderRejected = () => (
        data.rejected.length === 0 ? null :
            <View style={styles.section}>
                <View style={[styles.sectionHeader, { alignItems: 'center' }]}>
                    <Octicons name="dot-fill" size={20} color="red" style={{ marginRight: SPACING.xx_small }} />
                    <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Rejected
                    </Text>
                    <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                        • {data.rejected.length}
                    </Text>
                </View>
    
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                    {data.rejected.map(lady => (
                        <View key={lady.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                            <RenderAccountLady lady={lady} width={cardWidth} actions={rejectedActions} offsetX={windowWidth * index} />
                        </View>
                    ))}
                </View>
            </View>
    )

    return (
        <View onLayout={onLayout} style={{ paddingBottom: SPACING.large }}>
            {renderActive()}
            {renderInReview()}
            {renderInactive()}
            {renderRejected()}
            
            <ConfirmationModal 
                visible={!!ladyToDelete}
                headerText='Confirm delete'
                text='Are you sure you want to delete selected Lady? This action can not be undone.'
                onCancel={() => setLadyToDelete(undefined)}
                onConfirm={() => deleteLady(ladyToDelete)}
                icon='delete-outline'
                headerErrorText='Delete error'
                errorText='Lady could not be deleted.'
            />

            <ConfirmationModal
                visible={!!ladyToActivate}
                headerText='Confirm Activation'
                text='Are you sure you want to activate selected Lady? Profile will become visible in profile listings and search results.'
                onCancel={() => setLadyToActivate(undefined)}
                onConfirm={() => activateLady(ladyToActivate)}
                headerErrorText='Activation error'
                errorText='Lady could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!ladyToDeactivate}
                headerText='Confirm Deactivation'
                text='Are you sure you want to deactivate selected Lady? Profile will be hidden from the profile listings and search results. You can reactivate the profile at any time.'
                onCancel={() => setLadyToDeactivate(undefined)}
                onConfirm={() => deactivateLady(ladyToDeactivate)}
                headerErrorText='Deactivation error'
                errorText='Lady could not be deactivated.'
                confirmLabel='Deactivate'
                confirmButtonColor={COLORS.lightBlack}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    ladies: store.userState.ladies,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchLadies, removeLadyFromRedux, updateLadyInRedux })(memo(Ladies))

const styles = StyleSheet.create({
    section: {
        marginTop: SPACING.large,
        //padding: SPACING.small, 
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