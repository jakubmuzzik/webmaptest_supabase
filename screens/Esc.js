import React, { useState, useMemo, useLayoutEffect, useEffect, useRef } from 'react'
import { 
    View, 
    Dimensions, 
    StyleSheet,
    ScrollView,
    Text
} from 'react-native'
import ContentLoader, { Rect } from "react-content-loader/native"
import { 
    COLORS, 
    FONTS, 
    FONT_SIZES, 
    MAX_ITEMS_PER_PAGE, 
    SPACING, 
    SUPPORTED_LANGUAGES ,
    MIN_AGE,
    MAX_AGE,
    MIN_HEIGHT,
    MAX_HEIGHT,
    MIN_WEIGHT,
    MAX_WEIGHT,
    DEFAULT_FILTERS
} from '../constants'
import { 
    ACTIVE, 
    BODY_TYPES,
    PUBIC_HAIR_VALUES,
    SEXUAL_ORIENTATION,
    SERVICES,
    HAIR_COLORS,
    BREAST_SIZES,
    BREAST_TYPES,
    EYE_COLORS,
    LANGUAGES,
    NATIONALITIES
} from '../labels'
import RenderLady from '../components/list/RenderLady'
import { MOCK_DATA } from '../constants'
import { normalize, getParam, buildFiltersForQuery, areValuesEqual, getFilterParams, stripDefaultFilters } from '../utils'
import { useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { getCountFromServer, db, collection, query, where, startAfter, startAt, limit, orderBy, getDocs, getDoc, doc } from '../firebase/config'
import { MotiView, MotiText } from 'moti'
import { updateLadiesCount, updateLadiesData, resetAllPaginationData } from '../redux/actions'
import SwappableText from '../components/animated/SwappableText'
import Pagination from '../components/Pagination'
import LottieView from 'lottie-react-native'

import { supabase } from '../supabase/config'

const Esc = ({ updateLadiesCount, updateLadiesData, resetAllPaginationData, ladiesCount, ladiesData, ladyCities=[] }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        page: searchParams.get('page') && !isNaN(searchParams.get('page')) ? searchParams.get('page') : 1
    }), [searchParams, ladyCities])

    const filters = useMemo(() => ({
        city: searchParams.get('city'),
        ...stripDefaultFilters(DEFAULT_FILTERS, getFilterParams(searchParams))
    }), [searchParams])

    const previousFilters = useRef(filters)

    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
        if (isNaN(ladiesCount)) {
            getLadiesCount()
        }
    }, [ladiesCount])

    useLayoutEffect(() => {
        //filters changed
        if (!areValuesEqual(filters, previousFilters.current)) {
            console.log('filters changed')
            console.log(filters)
            
            setIsLoading(true)

            //trigger useEffect to update ladies count
            updateLadiesCount()

            resetAllPaginationData()
            loadDataForCurrentPage()

            previousFilters.current = filters
        } 
        //pagination changed or init load
        else {
            console.log('pagination changed or init load')
            if (!ladiesData[params.page]) {
                console.log('does not have data for page: ' + params.page)
                setIsLoading(true)
                loadDataForCurrentPage()
            } else {
                setIsLoading(false)
            }
        } 
    }, [params.page, filters])

    const getOrdering = () => {
        return orderBy("created_date")
    }

    const loadMockDataForPage = () => {
        updateLadiesData(new Array(MAX_ITEMS_PER_PAGE).fill({
            name: 'llll',
            date_of_birth: '25071996',
            address: {city: 'Praha'},
            images: [{ downloadUrl: require('../assets/dummy_photo.png') }]
        }, 0), params.page)
        setIsLoading(false)
    }

    const loadDataForCurrentPage = async () => {
        try {
            let query = supabase
                .from('users')
                .select()
                .match({ account_type: 'lady', status: ACTIVE })  

            query = buildFiltersForQuery(query, filters)

            query = query.range((Number(params.page) - 1) * MAX_ITEMS_PER_PAGE, Number(params.page) * MAX_ITEMS_PER_PAGE)

            const { data } = await query

            if (data && data.length > 0) {
                updateLadiesData(data, params.page)
            } else {
                updateLadiesData([], params.page)
            }
        } catch(error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        } 
    }

    const getLadiesCount = async () => {
        try {
            let query = supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .match({ account_type: 'lady', status: ACTIVE })      

            query = buildFiltersForQuery(query, filters)
                
            const { count } = await query

            if (!isNaN(count)) {
                updateLadiesCount(count)
            }
        } catch(e) {
            console.error(e)
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

    const renderCard = (data, index) => {
        return (
            <View
                key={data.id}
                style={[styles.cardContainer, { width: cardWidth }]}
            >
                <RenderLady lady={data} width={cardWidth} delay={index * 20}/>
            </View>
        )
    }

    const renderSkeleton = () => {
        return new Array(MAX_ITEMS_PER_PAGE).fill(null, 0).map((_, index) => (
            <View key={index} style={[styles.cardContainer, { width: cardWidth }]}>
                <ContentLoader
                    speed={2}
                    width={cardWidth}
                    style={{ aspectRatio: 3/4, borderRadius: 10 }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
                </ContentLoader>
            </View>
        ))
    }

    const renderPaginationSkeleton = () => {
        return (
            <View style={{width: 300, alignSelf: 'center'}}>
                <ContentLoader
                    speed={2}
                    width={300}
                    style={{ height: FONT_SIZES.x_large }}
                    backgroundColor={COLORS.grey}
                    foregroundColor={COLORS.lightGrey}
                >
                    <Rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
                </ContentLoader>
            </View>
        )
    }

    const renderNoResults = () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
        <View style={{ flex: 1, backgroundColor: COLORS.lightBlack, marginHorizontal: SPACING.page_horizontal - SPACING.large }} 
            onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        >
            <View style={{ marginLeft: SPACING.large, flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.large, flex: 1 }}>
                {isLoading && renderSkeleton()}
                {!isLoading && ladiesData[params.page]?.map((data, index) => renderCard(data, index))}
                {!isLoading && ladiesData[params.page]?.length === 0 && renderNoResults()}
            </View>

            <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
               {ladiesCount && <Pagination dataCount={ladiesCount}/>}
               {isNaN(ladiesCount) && renderPaginationSkeleton()}
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    ladiesCount: store.appState.ladiesCount,
    ladiesData: store.appState.ladiesData,
    ladyCities: store.appState.ladyCities,
})

export default connect(mapStateToProps, { updateLadiesCount, updateLadiesData, resetAllPaginationData })(Esc)

const styles = StyleSheet.create({
    cardContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        overflow: 'hidden'
        //flexShrink: 1
    },
})