import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { 
    View, 
    StyleSheet,
    Text
} from 'react-native'
import ContentLoader, { Rect } from "react-content-loader/native"
import { 
    COLORS, 
    FONTS, 
    FONT_SIZES, 
    MAX_ITEMS_PER_PAGE, 
    SPACING, 
    SUPPORTED_LANGUAGES,
} from '../constants'
import { 
    ACTIVE,
    MASSAGE_SERVICES
} from '../labels'
import RenderLady from '../components/list/RenderLady'
import { stripDefaultFilters, getParam, buildFiltersForQuery, areValuesEqual, getFilterParams, calculateLadyCardWidth } from '../utils'
import { MOCK_DATA, DEFAULT_FILTERS } from '../constants'
import { useSearchParams } from 'react-router-dom'
import { updateCurrentMasseusesCount, resetMasseusesPaginationData, setMasseusesPaginationData } from '../redux/actions'
import { connect } from 'react-redux'
import Pagination from '../components/Pagination'
import LottieView from 'lottie-react-native'
import { supabase } from '../supabase/config'
import { isBrowser } from 'react-device-detect'

const Mas = ({ currentMasseusesCount, updateCurrentMasseusesCount, resetMasseusesPaginationData, setMasseusesPaginationData, masseusesData }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        page: searchParams.get('page') && !isNaN(searchParams.get('page')) ? searchParams.get('page') : 1
    }), [searchParams])

    const filters = useMemo(() => ({
        city: searchParams.get('city'),
        ...stripDefaultFilters(DEFAULT_FILTERS, getFilterParams(searchParams))
    }), [searchParams])

    const previousFilters = useRef(filters)

    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (currentMasseusesCount == null) {
            getMasseusesCount()
        }
    }, [currentMasseusesCount, filters])

    useLayoutEffect(() => {
        //filters changed
        if (!areValuesEqual(filters, previousFilters.current)) {
            setIsLoading(true)

            //will trigger useEffect to re-fetch ladies count
            updateCurrentMasseusesCount()

            //reset pagination data as filters changed
            resetMasseusesPaginationData()
            
            loadDataForCurrentPage()

            previousFilters.current = filters
        } 
        //pagination changed or init load
        else {
            if (!masseusesData[params.page]) {
                setIsLoading(true)
                loadDataForCurrentPage()
            } else {
                setIsLoading(false)
            }
        } 
    }, [params.page, filters])

    const loadDataForCurrentPage = async () => {
        try {
            let query = supabase
                .from('ladies')
                .select('*, images(*), videos(*)')
                .match({ status: ACTIVE })  
                .overlaps('services', MASSAGE_SERVICES)  

            query = buildFiltersForQuery(query, filters)

            query = query.range((Number(params.page) - 1) * MAX_ITEMS_PER_PAGE, (Number(params.page) * MAX_ITEMS_PER_PAGE) - 1)

            const { data } = await query

            if (data && data.length > 0) {
                setMasseusesPaginationData(params.page, data)
            } else {
                setMasseusesPaginationData(params.page, [])
            }
        } catch(error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        } 
    }

    const getMasseusesCount = async () => {
        try {
            let query = supabase
                .from('ladies')
                .select('*', { count: 'exact', head: true })
                .match({ status: ACTIVE })    
                .overlaps('services', MASSAGE_SERVICES)  

            query = buildFiltersForQuery(query, filters)
                
            const { count, error } = await query

            updateCurrentMasseusesCount(count ?? 0)
        } catch(e) {
            console.error(e)
        }
    }

    const cardWidth = useMemo(() => calculateLadyCardWidth(contentWidth - (isBrowser ? (SPACING.page_horizontal + SPACING.large) : 0)), [contentWidth])

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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.large }}>
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
        <View style={{ flex: 1, backgroundColor: COLORS.lightBlack, paddingHorizontal: SPACING.page_horizontal - SPACING.large, alignSelf: 'center', width: '100%', maxWidth: 1650 }} 
            onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        >
            <View style={{ marginLeft: SPACING.large, flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.large, flex: 1 }}>
                {isLoading && renderSkeleton()}
                {!isLoading && masseusesData[params.page]?.map((data, index) => renderCard(data, index))}
                {!isLoading && masseusesData[params.page]?.length === 0 && renderNoResults()}
            </View>

            <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
               {currentMasseusesCount && <Pagination dataCount={currentMasseusesCount}/>}
               {isNaN(currentMasseusesCount) && renderPaginationSkeleton()}
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentMasseusesCount: store.appState.currentMasseusesCount,
    masseusesData: store.appState.masseusesData
})

export default connect(mapStateToProps, { updateCurrentMasseusesCount, resetMasseusesPaginationData, setMasseusesPaginationData })(Mas)

const styles = StyleSheet.create({
    cardContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        //flexShrink: 1
    },
})