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
import { fetchNewEstablishments, setNewEstablishments } from '../../redux/actions'
import { ACTIVE, DELETED, INACTIVE, IN_REVIEW, REJECTED} from '../../labels'
import { MOCK_DATA } from '../../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import OverlaySpinner from '../../components/modal/OverlaySpinner'

import { supabase } from '../../supabase/config'

const NewEstablishments = ({ newEstablishments, toastRef, fetchNewEstablishments, setNewEstablishments }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const hasRendered = useRef()
     
    const [sectionWidth, setSectionWidth] = useState(0)

    const [saving, setSaving] = useState(false)

    const [establishmentToReject, setEstablishmentToReject] = useState()
    const [establishmentToActivate, setEstablishmentToActivate] = useState()

    useEffect(() => {
        if (newEstablishments === null) {
            fetchNewEstablishments()
        }
    }, [newEstablishments])

    const navigate = useNavigate()

    const { width: windowWidth } = useWindowDimensions()

    const onLayout = (event) => {
        //-2 due to border radius
        setSectionWidth(event.nativeEvent.layout.width - 2)
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

    const activateEstablishment = async (establishmentId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('establishments')
                .update({ status: ACTIVE })
                .eq('id', establishmentId)

            if (updateError) {
                throw updateError
            }

            setNewEstablishments(newEstablishments.filter(newEstablishment => newEstablishment.id !== establishmentId))

            toastRef.current.show({
                type: 'success',
                headerText: 'Establishment activated',
                text: 'Establishment was successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Activate error',
                text: 'Establishment could not be activated.'
            })
        } finally {
            setSaving(false)
        }
    }

    const rejectEstablishment = async (establishmentId) => {
        setSaving(true)
        try {
            const { error: updateError } = await supabase
                .from('establishments')
                .update({ status: REJECTED })
                .eq('id', establishmentId)

            if (updateError) {
                throw updateError
            }

            setNewEstablishments(newEstablishments.filter(newEstablishment => newEstablishment.id !== establishmentId))

            toastRef.current.show({
                type: 'success',
                headerText: 'Establishment rejected',
                text: 'Establishment was successfuly rejected.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Rejection error',
                text: 'Establishment could not be rejected.'
            })
        } finally {
            setSaving(false)
        }
    }

    const onEditEstablishmentPress = (establishmentId) => {
        navigate({
            pathname: '/admin/new-establishments/edit-establishment/' + establishmentId,
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onActivatePress = (establishmentId) => {
        setEstablishmentToActivate(establishmentId)
    }

    const onRejectPress = (establishmentId) => {
        setEstablishmentToReject(establishmentId)
    }

    const actions = [
        {
            label: 'Edit',
            onPress: onEditEstablishmentPress
        },
        {
            label: 'Approve',
            onPress: onActivatePress
        },
        {
            label: 'Reject',
            onPress: onRejectPress
        },
    ]

    if (newEstablishments === null) {
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
        <View onLayout={onLayout} style={{ paddingBottom: SPACING.large, width: normalize(800), maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.medium, }}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    {newEstablishments.length === 0 && <Text style={{ color: COLORS.greyText, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, textAlign: 'center' }}>
                        No establishments for review
                    </Text>}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                    {newEstablishments.map(establishment => (
                        <View key={establishment.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                            <RenderAccountLady lady={establishment} width={cardWidth} actions={actions} offsetX={windowWidth * 2}/>
                        </View>
                    ))}
                </View>
            </View>

            {saving && <OverlaySpinner />}

            <ConfirmationModal
                visible={!!establishmentToActivate}
                headerText='Confirm Activation'
                text='Are you sure you want to approve selected Establishment? All in review images and videos will be approved as well.'
                onCancel={() => setEstablishmentToActivate(undefined)}
                onConfirm={() => activateEstablishment(establishmentToActivate)}
                headerErrorText='Activation error'
                errorText='Establishment could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={!!establishmentToReject}
                headerText='Confirm Rejection'
                text='Are you sure you want to reject selected Establishment? All in review images and videos will be rejected as well.'
                onCancel={() => setEstablishmentToReject(undefined)}
                onConfirm={() => rejectEstablishment(establishmentToReject)}
                headerErrorText='Rejection error'
                errorText='Establishment could not be rejected.'
                confirmLabel='Reject'
                confirmButtonColor={COLORS.lightBlack}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    newEstablishments: store.adminState.newEstablishments,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchNewEstablishments, setNewEstablishments })(memo(NewEstablishments))

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