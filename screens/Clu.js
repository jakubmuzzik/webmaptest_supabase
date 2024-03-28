import React, { useState, useMemo, useLayoutEffect, useEffect, useRef } from 'react'
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
} from '../labels'
import RenderEstablishment from '../components/list/RenderEstablishment'
import { MOCK_DATA, DEFAULT_FILTERS } from '../constants'
import { stripDefaultFilters, getParam, areValuesEqual, buildFiltersForQuery, getFilterParams } from '../utils'
import { useSearchParams } from 'react-router-dom'
import { connect } from 'react-redux'
import { updateCurrentEstablishmentsCount } from '../redux/actions'
import Pagination from '../components/Pagination'
import LottieView from 'lottie-react-native'
import { supabase } from '../supabase/config'

const Clu = ({ currentEstablishmentsCount, updateCurrentEstablishmentsCount }) => {
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
    const [establishentsData, setEstablishmentsData] = useState({})
    
    useEffect(() => {
        if (!currentEstablishmentsCount) {
            getEstablishmentsCount()
        }
    }, [currentEstablishmentsCount])

    useLayoutEffect(() => {
        //filters changed
        if (!areValuesEqual(filters, previousFilters.current)) {
            setIsLoading(true)

            //will trigger useEffect to re-fetch ladies count
            updateCurrentEstablishmentsCount()

            //reset pagination data as filters changed
            setEstablishmentsData({})
            
            loadDataForCurrentPage()

            previousFilters.current = filters
        } 
        //pagination changed or init load
        else {
            if (!establishentsData[params.page]) {
                setIsLoading(true)
                loadDataForCurrentPage()
            } else {
                setIsLoading(false)
            }
        } 
    }, [params.page, filters])

    const loadMockDataForPage = () => {
        setEstablishmentsData((current) => ({
            ...current,
            [params.page] : new Array(MAX_ITEMS_PER_PAGE).fill({
                name: 'llll',
                date_of_birth: '25071996',
                address: {city: 'Praha'},
                images: [{ downloadUrl: require('../assets/dummy_photo.png') }]
            }, 0)
        }))
        setIsLoading(false)
    }

    const loadDataForCurrentPage = async () => {
        try {
            let query = supabase
                .from('users')
                .select()
                .match({ account_type: 'establishment', status: ACTIVE })  

            query = buildFiltersForQuery(query, filters)

            query = query.range((Number(params.page) - 1) * MAX_ITEMS_PER_PAGE, Number(params.page) * MAX_ITEMS_PER_PAGE)

            const { data } = await query

            if (data && data.length > 0) {
                setEstablishmentsData((current) => ({
                    ...current,
                    [params.page] : data
                }))
            } else {
                setEstablishmentsData((current) => ({
                    ...current,
                    [params.page] : []
                }))
            }
        } catch(error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        } 
    }

    const getEstablishmentsCount = async () => {
        try {
            let query = supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .match({ account_type: 'establishment', status: ACTIVE })      

            query = buildFiltersForQuery(query, filters)
                
            const { count } = await query

            if (!isNaN(count)) {
                updateCurrentEstablishmentsCount(count)
            } else {
                updateCurrentEstablishmentsCount(0)
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
                <RenderEstablishment establishment={data} width={cardWidth} delay={index*20}/>
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
        <View style={{ flex: 1, backgroundColor: COLORS.lightBlack, marginHorizontal: SPACING.page_horizontal - SPACING.large }} 
            onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        >
            <View style={{ marginLeft: SPACING.large, flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.large, flex: 1 }}>
                {isLoading && renderSkeleton()}
                {!isLoading && establishentsData[params.page]?.map((data, index) => renderCard(data, index))}
                {!isLoading && establishentsData[params.page]?.length === 0 && renderNoResults()}
            </View>

            <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
               {currentEstablishmentsCount && <Pagination dataCount={currentEstablishmentsCount}/>}
               {isNaN(currentEstablishmentsCount) && renderPaginationSkeleton()}
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    currentEstablishmentsCount: store.appState.currentEstablishmentsCount
})

export default connect(mapStateToProps, { updateCurrentEstablishmentsCount })(Clu)

const styles = StyleSheet.create({
    cardContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        overflow: 'hidden'
        //flexShrink: 1
    },
})