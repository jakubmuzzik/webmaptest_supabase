import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES, MAX_ITEMS_PER_PAGE } from '../constants'
import { useSearchParams } from 'react-router-dom'
import { getParam, normalize, stripEmptyParams } from '../utils'
import { MOCK_DATA } from '../constants'
import ContentLoader, { Rect } from "react-content-loader/native"
import RenderLady from '../components/list/RenderLady'
import RenderEstablishment from '../components/list/RenderEstablishment'
import { AnimatePresence, MotiView } from 'moti'
import { ACTIVE } from '../labels'
import { connect } from 'react-redux'
import { 
    getCountFromServer, 
    db, 
    collection, 
    query, 
    where, 
    startAt, 
    limit, 
    orderBy, 
    getDocs,
    endAt
} from '../firebase/config'
import { useNavigate } from 'react-router-dom'
import SwappableText from '../components/animated/SwappableText'
import LottieView from 'lottie-react-native'

const SearchResults = ({ toastRef }) => {
    const [searchParams] = useSearchParams()

    const navigate = useNavigate()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        query: decodeURIComponent(searchParams.get('q'))
    }), [searchParams])

    const [isLoading, setIsLoading] = useState(true)
    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)
    const [results, setResults] = useState([])

    const ladies = results.filter(result => result.accountType === 'lady')
    const establishments = results.filter(result => result.accountType === 'establishment')

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
        console.log('searching')
        setIsLoading(true)
        try {
            const q = query(
                collection(db, "users"), 
                where('status', '==', ACTIVE),
                orderBy('nameLowerCase'),
                startAt(params.query.toLowerCase()),
                endAt(params.query.toLowerCase() + '\uf8ff'),
                limit(MAX_ITEMS_PER_PAGE)
            )
    
            const snapshot = await getDocs(q)
            setResults(snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })))
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

    const cardWidth = useMemo(() => {
        const isXSmallScreen = contentWidth < 300
        const isSmallScreen = contentWidth >= 300 && contentWidth < 550
        const isMediumScreen = contentWidth >= 550 && contentWidth < 750
        const isXMediumScreen = contentWidth >= 750 && contentWidth < 960
        const isLargeScreen = contentWidth >= 960 && contentWidth < 1300

        return isXSmallScreen ? (contentWidth) - (SPACING.large + SPACING.large)
            : isSmallScreen ? (contentWidth / 2) - (SPACING.large + SPACING.large / 2)
            : isMediumScreen ? (contentWidth / 3) - (SPACING.large + SPACING.large / 3)
            : isXMediumScreen ? (contentWidth / 4) - (SPACING.large + SPACING.large / 4)
            : isLargeScreen ? (contentWidth / 5) - (SPACING.large + SPACING.large / 5) : (contentWidth / 6) - (SPACING.large + SPACING.large / 6) 
    }, [contentWidth])

    const renderLady = (data, index) => (
        <View
            style={[styles.cardContainer, { width: cardWidth }]}
            key={data.id}
        >
            <RenderLady lady={data} width={cardWidth} delay={index * 20} />
        </View>
    )

    const renderEstablishment = (data, index) => (
        <View
            style={[styles.cardContainer, { width: cardWidth }]}
            key={data.id}
        >
            <RenderEstablishment establishment={data} width={cardWidth} delay={index * 20} />
        </View>
    )

    const renderSkeletonLoader = () => (
        <>
            {/* <ContentLoader
                speed={2}
                width={cardWidth * 2}
                height={FONT_SIZES.h1}
                style={{ marginHorizontal: SPACING.large, borderRadius: 5 }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
                <Rect x="0" y="0" rx="0" ry="0" width="100%" height={FONT_SIZES.h1} />
            </ContentLoader> */}

            <ContentLoader
                speed={2}
                width={(cardWidth * 2) * 0.4}
                height={FONT_SIZES.h1}
                style={{ marginHorizontal: SPACING.large, marginTop: SPACING.large, borderRadius: 5, alignSelf: 'center' }}
                backgroundColor={COLORS.grey}
                foregroundColor={COLORS.lightGrey}
            >
               <Rect x="0" y="0" rx="0" ry="0" width="100%" height={FONT_SIZES.h1} />
            </ContentLoader>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.medium }}>
                {MOCK_DATA.map((_, index) => (
                    <View key={index} style={{ marginRight: SPACING.large, marginBottom: SPACING.large, overflow: 'hidden', width: cardWidth }}>
                        <ContentLoader
                            speed={2}
                            width={cardWidth}
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

    const renderLadies = () => {
        if (ladies.length === 0) {
            return null
        }

        return (
            <View style={{ marginTop: SPACING.large }}>
                <Text style={{ fontSize: FONT_SIZES.h2, color: '#FFF', fontFamily: FONTS.bold, marginHorizontal: SPACING.large, textAlign: 'center'}}>
                    Ladies
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.small }}>
                    {ladies.map((result, index) => renderLady(result, index))}
                </View>
            </View>
        )
    }

    const renderEstablishments = () => {
        if (establishments.length === 0) {
            return null
        }

        return (
            <View style={{ marginTop: SPACING.large }}>
                <Text style={{ fontSize: FONT_SIZES.h2, color: '#FFF', fontFamily: FONTS.bold, marginHorizontal: SPACING.large, textAlign: 'center' }}>
                    Establishments
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large, marginTop: SPACING.small }}>
                    {establishments.map((result, index) => renderEstablishment(result, index))}
                </View>
            </View>
        )
    }

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
        <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)} style={{ backgroundColor: COLORS.lightBlack, flex: 1, marginHorizontal: SPACING.page_horizontal - SPACING.large, paddingTop: SPACING.large }}>
            <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.large, marginHorizontal: SPACING.large, color: COLORS.greyText, textAlign: 'center' }}>
                Search results
            </Text>
            <SwappableText 
                value={params.query} 
                style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h1, marginHorizontal: SPACING.large, color: '#FFF', textAlign: 'center' }} 
            />

            {isLoading && renderSkeletonLoader()}

            {!isLoading && ladies.length > 0 && renderLadies()}

            {!isLoading && establishments.length > 0 && renderEstablishments()}

            {!isLoading && ladies.length === 0 && establishments.length === 0 && renderNoResults()}
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