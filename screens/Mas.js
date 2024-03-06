import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
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
    NATIONALITIES,
    MASSAGE_SERVICES
} from '../labels'
import RenderLady from '../components/list/RenderLady'
import { normalize, getParam, chunkArray, areValuesEqual, getFilterParams } from '../utils'
import { MOCK_DATA } from '../constants'
import { useSearchParams } from 'react-router-dom'
import { getCountFromServer, db, collection, query, where, startAt, limit, orderBy, getDocs, getDoc, startAfter, doc } from '../firebase/config'
import { updateMasseusesCount, updateMasseusesData, resetAllPaginationData } from '../redux/actions'
import { MotiView, MotiText } from 'moti'
import { connect } from 'react-redux'
import SwappableText from '../components/animated/SwappableText'
import Pagination from '../components/Pagination'
import LottieView from 'lottie-react-native'

const Mas = ({ updateMasseusesCount, updateMasseusesData, masseusesCount, masseusesData, ladyCities=[], resetAllPaginationData }) => {
    const [searchParams] = useSearchParams()

    const params = useMemo(() => ({
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), ''),
        city: searchParams.get('city'),
        page: searchParams.get('page') && !isNaN(searchParams.get('page')) ? searchParams.get('page') : 1
    }), [searchParams, ladyCities])

    const previousCity = useRef(searchParams.get('city'))

    const [contentWidth, setContentWidth] = useState(document.body.clientWidth - (SPACING.page_horizontal - SPACING.large) * 2)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!masseusesCount) {
            getMasseusesCount()
        }
    }, [masseusesCount])

    useLayoutEffect(() => {
        //filters changed
        if (previousCity.current !== params.city) {
            console.log('city changed')

            setIsLoading(true)

            //trigger useEffect to update ladies count
            updateMasseusesCount()

            loadDataForPage()
            resetAllPaginationData()

            previousCity.current = params.city
        }
        //pagination changed
        else {
            console.log('pagination changed')
            if (!masseusesData[params.page]) {
                console.log('does not have data for page: ' + params.page)
                setIsLoading(true)
                loadDataForPage()
            } else {
                setIsLoading(false)
            }
        }
    }, [params.page, params.city])

    const getWhereConditions = () => {
        let whereConditions = []

        if (params.city) {
            whereConditions.push(where('address.city', '==', params.city))
        }

        return whereConditions
    }

    const getOrdering = () => {
        return orderBy("createdDate")
    }

    const loadMockDataForPage = () => {
        updateMasseusesData(new Array(MAX_ITEMS_PER_PAGE).fill({
            name: 'llll',
            dateOfBirth: '25071996',
            address: {city: 'Praha'},
            images: [{ downloadUrl: require('../assets/dummy_photo.png') }]
        }, 0), params.page)
        setIsLoading(false)
    }

    const loadDataForPage = async () => {
        if (Number(params.page) === 1) {
            loadDataForFirstPage()
            return
        }

        //previous page has data and is the last one
        if (masseusesData[Number(params.page) - 1] && masseusesData[Number(params.page) - 1].length < MAX_ITEMS_PER_PAGE) {
            updateMasseusesData([], params.page)
            return
        }

        try {
            let lastVisibleSnapshot
            //previous page has data - use last doc from previous page
            if (masseusesData[Number(params.page) - 1]) {
                const lastVisibleId = masseusesData[Number(params.page) - 1][MAX_ITEMS_PER_PAGE - 1].id
                lastVisibleSnapshot = await getDoc(doc(db, 'users', lastVisibleId))
            } 
            //previous page does not have data
            else {
                const dataCountFromBeginning = (Number(params.page) - 1) * MAX_ITEMS_PER_PAGE
    
                //query all data from the beginning till the last one
                const q = query(
                    collection(db, "users"), 
                    where('accountType', '==', 'lady'), 
                    where('status', '==', ACTIVE),
                    where('services', 'array-contains-any', MASSAGE_SERVICES),
                    ...getWhereConditions(),
                    getOrdering(),
                    limit(dataCountFromBeginning)
                )
    
                const previousDataSnapshot = await getDocs(q)
                //requested page number from url might exceeds data size
                if (previousDataSnapshot.empty || previousDataSnapshot.size !== dataCountFromBeginning) {
                    updateMasseusesData([], params.page)
                    return
                }
    
                lastVisibleSnapshot = previousDataSnapshot.docs[previousDataSnapshot.docs.length-1]

                //store data from previous pages in redux
                chunkArray(previousDataSnapshot.docs, MAX_ITEMS_PER_PAGE).forEach((chunk, index) => {
                    if (!masseusesData[Number(index) + 1]) {
                        const data = chunk.map(doc => {                    
                            return ({
                                ...doc.data(),
                                id: doc.id
                            })
                        })
        
                        updateMasseusesData(data, Number(index) + 1)
                    }
                })
            }

            const snapshot = await getDocs(
                query(
                    collection(db, "users"), 
                    where('accountType', '==', 'lady'), 
                    where('status', '==', ACTIVE),
                    where('services', 'array-contains-any', MASSAGE_SERVICES),
                    ...getWhereConditions(),
                    getOrdering(),
                    startAfter(lastVisibleSnapshot),
                    limit(MAX_ITEMS_PER_PAGE)
                )
            )
            
            if (snapshot.empty) {
                updateMasseusesData([], params.page)
            } else {
                //store data from the requested page in redux
                const data = snapshot.docs.map(doc => {                    
                    return ({
                        ...doc.data(),
                        id: doc.id
                    })
                })

                updateMasseusesData(data, params.page)
            }
        } catch(error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        } 
    }

    const loadDataForFirstPage = async () => {
        try {
            const snapshot = await getDocs(
                query(
                    collection(db, "users"), 
                    where('accountType', '==', 'lady'), 
                    where('status', '==', ACTIVE),
                    where('services', 'array-contains-any', MASSAGE_SERVICES),
                    ...getWhereConditions(),
                    getOrdering(),
                    startAt(0),
                    limit(MAX_ITEMS_PER_PAGE)
                )
            )
            
            if (snapshot.empty) {
                updateMasseusesData([], 1)
            } else {
                const data = snapshot.docs.map(doc => {                    
                    return ({
                        ...doc.data(),
                        id: doc.id
                    })
                })
    
                updateMasseusesData(data, 1)
            }
        } catch(error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        } 
    }

    const getMasseusesCount = async () => {
        try {
            const snapshot = await getCountFromServer(
                query(
                    collection(db, "users"), 
                    where('accountType', '==', 'lady'), 
                    where('status', '==', ACTIVE),
                    where('services', 'array-contains-any', MASSAGE_SERVICES),
                    ...getWhereConditions(),
                )
            )
            
            updateMasseusesCount(snapshot.data().count)
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
                {!isLoading && masseusesData[params.page]?.map((data, index) => renderCard(data, index))}
                {!isLoading && masseusesData[params.page]?.length === 0 && renderNoResults()}
            </View>

            <View style={{ marginTop: SPACING.large, marginBottom: SPACING.medium }}>
               {masseusesCount && <Pagination dataCount={masseusesCount}/>}
               {isNaN(masseusesCount) && renderPaginationSkeleton()}
            </View>
        </View>
    )
}

const mapStateToProps = (store) => ({
    masseusesCount: store.appState.masseusesCount,
    masseusesData: store.appState.masseusesData,
    ladyCities: store.appState.ladyCities,
})

export default connect(mapStateToProps, { updateMasseusesCount, updateMasseusesData, resetAllPaginationData })(Mas)

const styles = StyleSheet.create({
    cardContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        //flexShrink: 1
    },
})