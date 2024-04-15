import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { View, Text, useWindowDimensions, Dimensions } from 'react-native'
import { FONTS, FONT_SIZES, SPACING, COLORS, SUPPORTED_LANGUAGES } from '../../constants'
import { ActivityIndicator, Button } from 'react-native-paper'
import { normalize, stripEmptyParams, getParam } from '../../utils'
import { MotiText, AnimatePresence, MotiView } from 'moti'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import HoverableView from '../../components/HoverableView'
import { Image } from 'expo-image'

import { connect } from 'react-redux'

import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import LadySignup from '../signup/LadySignup'

import { MaterialIcons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons'

import AccountSettings from '../account/AccountSettings'
import EditLady from '../account/EditLady'

import ContentLoader, { Rect } from "react-content-loader/native"
import { ACTIVE, IN_REVIEW, REJECTED } from '../../labels'
import { TouchableRipple } from 'react-native-paper' 

import SwappableText from '../../components/animated/SwappableText'

import { setNewEstablishmentsCount, setNewLadiesCount, setNewPhotosCount, setNewVideosCount } from '../../redux/actions'

import { supabase } from '../../supabase/config'

const { height: initialHeight } = Dimensions.get('window')

const AdminDashboard = ({ 
    toastRef,
    setIndex, 
    setNewEstablishmentsCount, 
    setNewLadiesCount, 
    setNewPhotosCount, 
    setNewVideosCount,
    newLadiesCount,
    newEstablishmentsCount,
    newPhotosCount,
    newVideosCount
}) => {
    const [searchParams] = useSearchParams()

    const [newLadies, setNewLadies] = useState()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }), [searchParams])

    const { width: windowWidth } = useWindowDimensions()

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (newLadiesCount === null) {
            fetchNewLadiesCount()
        }

        if (newEstablishmentsCount === null) {
            fetchNewEstablishmentsCount()
        }

        if (newPhotosCount === null) {
            fetchNewPhotosCount()
        }

        if (newVideosCount === null) {
            fetchNewVideosCount()
        }
    }, [
        newLadiesCount,
        newEstablishmentsCount,
        newPhotosCount,
        newVideosCount
    ])

    const fetchNewLadiesCount = async () => {
        try {
            const query = supabase
                .from('ladies')
                .select('*', { count: 'exact', head: true })
                .match({ status: IN_REVIEW })

            const { count } = await query

            if (!isNaN(count)) {
                setNewLadiesCount(count)
            } else {
                setNewLadiesCount(0)
            }
        } catch (error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                text: error.message
            })
        }
    }

    const fetchNewEstablishmentsCount = async () => {
        try {
            const query = supabase
                .from('establishments')
                .select('*', { count: 'exact', head: true })
                .match({ status: IN_REVIEW })

            const { count } = await query

            if (!isNaN(count)) {
                setNewEstablishmentsCount(count)
            } else {
                setNewEstablishmentsCount(0)
            }
        } catch (error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                text: error.message
            })
        }

    }

    const fetchNewPhotosCount = async () => {
        try {
            const ladiesQuery = supabase
                .from('images')
                .select('ladies!inner(status)', { count: 'exact', head: true })
                .eq('status', IN_REVIEW)
                .eq('ladies.status', ACTIVE)

            const estQuery = supabase
                .from('images')
                .select('establishments!inner(status)', { count: 'exact', head: true })
                .eq('status', IN_REVIEW)
                .eq('establishments.status', ACTIVE)

            const results = await Promise.all([
                ladiesQuery,
                estQuery
            ])

            let total = 0

            if (!isNaN(results[0].count)) {
                total += results[0].count
            }
            if (!isNaN(results[1].count)) {
                total += results[1].count
            }

            setNewPhotosCount(total)
        } catch (error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                text: error.message
            })
        }
    }

    const fetchNewVideosCount = async () => {
        try {
            const ladiesQuery = supabase
                .from('videos')
                .select('ladies!inner(status)', { count: 'exact', head: true })
                .eq('status', IN_REVIEW)
                .eq('ladies.status', ACTIVE)

            const estQuery = supabase
                .from('videos')
                .select('establishments!inner(status)', { count: 'exact', head: true })
                .eq('status', IN_REVIEW)
                .eq('establishments.status', ACTIVE)

            const results = await Promise.all([
                ladiesQuery,
                estQuery
            ])

            let total = 0

            if (!isNaN(results[0].count)) {
                total += results[0].count
            }
            if (!isNaN(results[1].count)) {
                total += results[0].count
            }

            setNewVideosCount(total)
        } catch (error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                text: error.message
            })
        }
    }

    const onDataCountCardPress = (pathToNavigate) => {
        navigate({
            pathname: pathToNavigate,
            search: new URLSearchParams(stripEmptyParams(params)).toString()
        })
    }

    const renderNewDataCard = (dataCount, title, pathToNavigate, marginRight, icon) => (
        <TouchableRipple style={{
            flex: 1,
            marginRight: marginRight,
            flexDirection: 'column',
            padding: SPACING.x_small,
            borderRadius: 15,
            backgroundColor: COLORS.grey,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,.08)',
        }}
            onPress={() => onDataCountCardPress(pathToNavigate)}
            rippleColor="rgba(220, 46, 46, .10)"
        >
            <>
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                    <Text style={{ color: COLORS.greyText, fontFamily: FONTS.medium, fontSize: FONT_SIZES.large }}>
                        {title}
                    </Text>
                    {icon}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flexShrink: 1 }}>
                    {dataCount === null && <ContentLoader
                        speed={2}
                        height={FONT_SIZES.large}
                        width={80}
                        style={{ borderRadius: 5 }}
                        backgroundColor={COLORS.grey}
                        foregroundColor={COLORS.lightGrey}
                    >
                        <Rect x="0" y="0" rx="0" ry="0" width="100%" height={FONT_SIZES.large} />
                    </ContentLoader>}

                    {dataCount !== null && (
                        <SwappableText
                            value={dataCount}
                            style={{ fontFamily: FONTS.bold, color: dataCount > 0 ? 'orange' : COLORS.greyText, fontSize: FONT_SIZES.h3 }}
                        />
                    )}
                </View>
            </>

        </TouchableRipple>
    )

    return (
        <View style={{ width: normalize(800), maxWidth: '100%', alignSelf: 'center', paddingHorizontal: SPACING.medium }}>
            <View style={{ flexDirection: 'row', marginBottom: SPACING.xx_small }}>
                {renderNewDataCard(newEstablishmentsCount, 'New Establishments', '/admin/new-establishments', SPACING.xx_small, <MaterialIcons name="meeting-room" size={25} color="white" />)}
                {renderNewDataCard(newLadiesCount, 'New Ladies', '/admin/new-ladies', 0, <Entypo name="mask" size={25} color={COLORS.white} />)}
            </View>

            <View style={{ flexDirection: 'row' }}>
                {renderNewDataCard(newPhotosCount, 'New Photos', '/admin/new-photos', SPACING.xx_small, <MaterialIcons name="photo" size={25} color="white" />)}
                {renderNewDataCard(newVideosCount, 'New Videos', '/admin/new-videos', 0, <MaterialIcons name="video-library" size={25} color="white" />)}
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    toastRef: store.appState.toastRef,
    newLadiesCount: store.adminState.newLadiesCount,
    newEstablishmentsCount: store.adminState.newEstablishmentsCount,
    newPhotosCount: store.adminState.newPhotosCount,
    newVideosCount: store.adminState.newVideosCount
})

export default connect(mapStateToProps, { setNewEstablishmentsCount, setNewLadiesCount, setNewPhotosCount, setNewVideosCount })(AdminDashboard)