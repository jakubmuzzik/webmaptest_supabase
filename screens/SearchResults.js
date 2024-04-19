import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES, MAX_ITEMS_PER_PAGE } from '../constants'
import { useSearchParams } from 'react-router-dom'
import { getParam, normalize, stripEmptyParams, calculateLadyCardWidth, calculateEstablishmentCardWidth } from '../utils'
import { MOCK_DATA } from '../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import RenderLady from '../components/list/RenderLady'
import RenderEstablishment from '../components/list/RenderEstablishment'
import { AnimatePresence, MotiView } from 'moti'
import { ACTIVE } from '../labels'
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SwappableText from '../components/animated/SwappableText'
import LottieView from 'lottie-react-native'
import { supabase } from '../supabase/config'
import { isBrowser } from 'react-device-detect'

const SearchResults = ({ toastRef }) => {
    const [searchParams] = useSearchParams()

    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        query: decodeURIComponent(searchParams.get('q'))
    }), [searchParams])

    const [isLoading, setIsLoading] = useState(true)
    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)
    const [ladiesResults, setLadiesResults] = useState([])
    const [establisthmentsResults, setEstablisthmentsResults] = useState([])

    useEffect(() => {
        if (!params.query) {
            navigate({
                pathname: '/',
                search: new URLSearchParams(stripEmptyParams({ language: params.language })).toString()
            }, { replace: true })
            return
        }
        
        search()
    }, [params.query])

    const search = async () => {
        setIsLoading(true)
        try {
            const results = await Promise.all([
                supabase
                    .from('ladies')
                    .select('*, images(*), videos(*)')
                    .match({ status: ACTIVE })
                    .like('name_lowercase', '%' + params.query.toLowerCase() + '%')
                    .limit(MAX_ITEMS_PER_PAGE),
                supabase
                    .from('establishments')
                    .select('*, images(*), videos(*)')
                    .match({ status: ACTIVE })
                    .like('name_lowercase', '%' + params.query.toLowerCase() + '%')
                    .limit(MAX_ITEMS_PER_PAGE),
            ])

            const { data: ladiesData, error: ladiesError } = results[0]
            const { data: estsData, error: estsError } = results[1]

            if (ladiesData?.length > 0) {
                setLadiesResults(ladiesData)
            } else {
                setLadiesResults([])
            }

            if (estsData?.length > 0) {
                setEstablisthmentsResults(estsData)
            } else {
                setEstablisthmentsResults([])
            }
        } catch(error) {
            toastRef.current.show({
                type: 'error',
                text: "Failed to search the data. Please try again later."
            })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const ladyCardWidth = useMemo(() => calculateLadyCardWidth(contentWidth - (isBrowser ? (SPACING.page_horizontal + SPACING.large) : 0)), [contentWidth])

    const estCardWidth = useMemo(() => calculateEstablishmentCardWidth(contentWidth - (isBrowser ? (SPACING.page_horizontal + SPACING.large) : 0)), [contentWidth])

    const renderLady = (data, index) => (
        <View
            style={[styles.cardContainer, { width: ladyCardWidth }]}
            key={data.id}
        >
            <RenderLady lady={data} width={ladyCardWidth} delay={index * 20} />
        </View>
    )

    const renderEstablishment = (data, index) => (
        <View
            style={[styles.cardContainer, { width: estCardWidth }]}
            key={data.id}
        >
            <RenderEstablishment establishment={data} width={estCardWidth} delay={index * 20} />
        </View>
    )

    const renderSkeletonLoader = () => (
        <>
            <ContentLoader
                speed={2}
                width={(ladyCardWidth * 2) * 0.4}
                height={FONT_SIZES.h1}
                style={{ marginHorizontal: SPACING.large, marginTop: SPACING.large, borderRadius: 5, alignSelf: 'center' }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
               <Rect x="0" y="0" rx="0" ry="0" width="100%" height={FONT_SIZES.h1} />
            </ContentLoader>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.medium }}>
                {MOCK_DATA.map((_, index) => (
                    <View key={index} style={{ marginRight: SPACING.large, marginBottom: SPACING.large, overflow: 'hidden', width: ladyCardWidth }}>
                        <ContentLoader
                            speed={2}
                            width={ladyCardWidth}
                            style={{ aspectRatio: 3 / 4, borderRadius: 10 }}
                            backgroundColor={COLORS.grey}
                            foregroundColor={COLORS.lightGrey}
                        >
                            <Rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
                        </ContentLoader>
                    </View>
                ))}
            </View>
        </>
    )

    const renderLadies = () => (
        <View style={{ marginTop: SPACING.large }}>
            <Text style={{ fontSize: FONT_SIZES.h2, color: '#FFF', fontFamily: FONTS.bold, marginHorizontal: SPACING.large, textAlign: 'center' }}>
                Ladies
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.small }}>
                {ladiesResults.map((result, index) => renderLady(result, index))}
            </View>
        </View>
    )

    const renderEstablishments = () => (
        <View style={{ marginTop: SPACING.large }}>
            <Text style={{ fontSize: FONT_SIZES.h2, color: '#FFF', fontFamily: FONTS.bold, marginHorizontal: SPACING.large, textAlign: 'center' }}>
                Establishments
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.small }}>
                {establisthmentsResults.map((result, index) => renderEstablishment(result, index))}
            </View>
        </View>
    )

    const renderNoResults = () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -normalize(50)}}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.x_large, color: '#FFF' }}>Sorry, we couldn't find any results</Text>
            <LottieView
                style={{ height: 180 }}
                autoPlay
                loop
                source={require('../assets/no-results-white.json')}
            />
        </View>
    )

    return (
        <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)} style={{ flex: 1, backgroundColor: COLORS.lightBlack, paddingHorizontal: SPACING.page_horizontal - SPACING.large, alignSelf: 'center', width: '100%', maxWidth: 1650, paddingTop: SPACING.large }}>
            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.large, color: COLORS.greyText, textAlign: 'center' }}>
                Search results
            </Text>
            <SwappableText 
                value={params.query} 
                style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginHorizontal: SPACING.large, color: '#FFF', textAlign: 'center' }} 
            />

            {isLoading && renderSkeletonLoader()}

            {!isLoading && ladiesResults.length > 0 && renderLadies()}

            {!isLoading && establisthmentsResults.length > 0 && renderEstablishments()}

            {!isLoading && ladiesResults.length === 0 && establisthmentsResults.length === 0 && renderNoResults()}
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps)(SearchResults)

const styles = StyleSheet.create({
    cardContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        overflow: 'hidden'
        //flexShrink: 1
    },
})