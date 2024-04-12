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
import { fetchNewLadies } from '../../redux/actions'
import { ACTIVE, DELETED, INACTIVE, IN_REVIEW, REJECTED} from '../../labels'
import { MOCK_DATA } from '../../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import ConfirmationModal from '../../components/modal/ConfirmationModal'

import { supabase } from '../../supabase/config'

const NewLadies = ({ newLadies, toastRef, fetchNewLadies }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const hasRendered = useRef()
     
    const [sectionWidth, setSectionWidth] = useState(0)

    const [ladyToDeactivate, setLadyToDeactivate] = useState()
    const [ladyToActivate, setLadyToActivate] = useState()

    useEffect(() => {
        if (newLadies === null) {
            fetchNewLadies()
        }
    }, [newLadies])

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

    const activateLady = async (ladyId) => {
        try {
            const { error } = await supabase
                .from('ladies')
                .update({ status: ACTIVE })
                .eq('id', ladyId)

            if (error) {
                throw error
            }

            //updateLadyInRedux({ status: ACTIVE, id: ladyId })

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

    const onEditLadyPress = (ladyId) => {
        navigate({
            pathname: '/admin/new-ladies/edit-lady/' + ladyId,
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const onActivatePress = (ladyId) => {
        //validate if parent establishment is approved
        //if approved, also approve all in review images
        setLadyToActivate(ladyId)
    }

    const onRejectPress = (ladyId) => {
        //if rejected, also reject all in review images
    }

    const actions = [
        {
            label: 'Edit',
            onPress: onEditLadyPress
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


    if (newLadies === null) {
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
                    <Text numberOfLines={1} style={[styles.sectionHeaderText, { marginBottom: 0, marginRight: 5 }]}>
                        Ladies in review
                    </Text>
                    <Text style={[styles.sectionHeaderText, { color: COLORS.greyText, fontFamily: FONTS.medium }]}>
                        • {newLadies.length}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.small }}>
                    {newLadies.map(lady => (
                        <View key={lady.id} style={{ width: cardWidth, marginBottom: SPACING.medium, marginRight: SPACING.small }}>
                            <RenderAccountLady lady={lady} width={cardWidth} actions={actions} offsetX={windowWidth}/>
                        </View>
                    ))}
                </View>
            </View>

            <ConfirmationModal
                visible={!!ladyToActivate}
                headerText='Confirm Activation'
                text='Are you sure you want to approve selected Lady? All in review images will be approved as well.'
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
    newLadies: store.adminState.newLadies,
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { fetchNewLadies })(memo(NewLadies))

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
        alignItems: 'center'
    },
    sectionHeaderText: {
        color: '#FFF',
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.h3
    }
})