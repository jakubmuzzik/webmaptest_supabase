import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, SPACING, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, CATEGORY1, CATEGORY2, CATEGORY3, CATEGORY4, CATEGORY5, SMALL_SCREEN_THRESHOLD, LARGE_SCREEN_THRESHOLD } from '../constants'
import HoverableView from '../components/HoverableView'
import { MaterialIcons } from '@expo/vector-icons'
import { normalize } from '../utils'
import {
    SELECT_CITY,
    translateLabels
} from '../labels'
import CityPicker from '../components/modal/CityPicker'
import { Link } from '@react-navigation/native'
import RenderLady from '../components/list/RenderLady'

const {
    width: INITIAL_SCREEN_WIDTH
} = Dimensions.get('window')

import { MOCK_DATA } from '../constants'

const Home = ({  }) => {
    const params = useMemo(() => ({
        language: 'en'
    }), [])

    const labels = useMemo(() => translateLabels(params.language, [
        SELECT_CITY
    ]), [params.language])

    const [locationModalVisible, setLocationModalVisible] = useState(false)

    useEffect(() => {
        setLocationModalVisible(false)
    }, [params])

    const [contentWidth, setContentWidth] = useState(INITIAL_SCREEN_WIDTH)

    //for 5 categories
    /*const categoryFlexBasis = isXSmallScreen ? (width) - (SPACING.large + SPACING.large)
        : isSmallScreen ? (width / 2) - (SPACING.large + SPACING.large / 2)
        : isMediumScreen ? (width / 3) - (SPACING.large + SPACING.large / 3)
        : isLargeScreen ? (width / 4) - (SPACING.large + SPACING.large / 4) : (width / 5) - (SPACING.large + SPACING.large / 5)*/

    //for 4 categories
    /*const categoryFlexBasis = isXSmallScreen ? (width) - (SPACING.large + SPACING.large)
        : isSmallScreen ? (width / 2) - (SPACING.large + SPACING.large / 2)
        : isMediumScreen ? (width / 3) - (SPACING.large + SPACING.large / 3)
        : isLargeScreen ? (width / 4) - (SPACING.large + SPACING.large / 4) : (width / 4) - (SPACING.large + SPACING.large / 4) */

    const categoryFlexBasis = useMemo(() => {
        const isXSmallScreen = contentWidth < 350
        const isSmallScreen = contentWidth >= 350 && contentWidth < SMALL_SCREEN_THRESHOLD
        const isMediumScreen = contentWidth >= SMALL_SCREEN_THRESHOLD && contentWidth < 960
        const isLargeScreen = contentWidth >= 960 && contentWidth < 1300

        const categoryFlexBasis = isXSmallScreen ? (contentWidth) - (SPACING.large + SPACING.large)
            : isSmallScreen ? (contentWidth / 2) - (SPACING.large + SPACING.large / 2)
            : isMediumScreen ? (contentWidth / 3) - (SPACING.large + SPACING.large / 3)
            : isLargeScreen ? (contentWidth / 4) - (SPACING.large + SPACING.large / 4) : (contentWidth / 4) - (SPACING.large + SPACING.large / 4) 
        
        return categoryFlexBasis
    }, [contentWidth])
    
    const categoryHeight = categoryFlexBasis / 3

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.lightBlack }}>
            <View style={{ marginBottom: SPACING.medium }}>
                <ImageBackground
                    source={require('../assets/header_logo2.png')}
                    style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xx_large, borderBottomRightRadius: 10, borderBottomLeftRadius: 10, overflow: 'hidden' }}
                    imageStyle={{ opacity: 0.6 }}
                    resizeMode='cover'
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.medium }}>
                        <Text style={{ fontFamily: FONTS.bold, fontSize: normalize(35), color: '#FFF', textAlign: 'center' }}>Find and Book Your Perfect Massage</Text>
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.large, color: '#FFF', marginTop: SPACING.medium, textAlign: 'center' }}>Discover Local Masseuses Near You!</Text>
                    </View>
                    <HoverableView style={{ marginTop: SPACING.x_large, borderRadius: 10, borderWidth: 2, borderColor: '#FFF', alignItems: 'center', overflow: 'hidden' }} backgroundColor='rgba(255,255,255,0.1)' hoveredBackgroundColor='rgba(255,255,255,0.2)'>
                        <TouchableOpacity onPress={() => setLocationModalVisible(true)} style={{ flexDirection: 'row', paddingHorizontal: SPACING.small, paddingVertical: SPACING.xx_small, alignItems: 'center', justifyContent: 'space-between' }} activeOpacity={0.8}>
                            <Text style={{ fontFamily: FONTS.medium, fontSize: normalize(18), color: '#FFF', marginHorizontal: SPACING.xx_small }}>{labels.SELECT_CITY}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={normalize(25)} color="white" />
                        </TouchableOpacity>
                    </HoverableView>
                </ImageBackground>
            </View>

            <View style={{ marginBottom: SPACING.large, marginHorizontal: SPACING.page_horizontal - SPACING.large }}
                onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
            >
                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h2, color: '#FFF', marginLeft: SPACING.large, marginBottom: SPACING.medium }}>Browse by Category</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: SPACING.large }}>
                    <HoverableView style={{...styles.categoryContainer, flexBasis: categoryFlexBasis }} hoveredOpacity={0.8}>
                        <Link to={{ screen: 'Esc', params: params.language ? { language: params.language } : {} }}>
                            <ImageBackground
                                source={require('../assets/CATEGORY1.png')}
                                style={[styles.category, { width: '100%', height: categoryHeight, minHeight: normalize(90) }]}
                                imageStyle={{ opacity: 0.6, minHeight: normalize(90) }}
                                resizeMode='cover'
                            >
                                <Text style={styles.categoryText}>{CATEGORY1}</Text>
                            </ImageBackground>
                        </Link>
                    </HoverableView>
                    <HoverableView style={{...styles.categoryContainer, flexBasis: categoryFlexBasis }} hoveredOpacity={0.8}>
                        <Link to={{ screen: 'Pri', params: params.language ? { language: params.language } : {} }}>
                            <ImageBackground
                                source={require('../assets/CATEGORY2.png')}
                                style={[styles.category, { width: '100%', height: categoryHeight, minHeight: normalize(90) }]}
                                imageStyle={{ opacity: 0.6, minHeight: normalize(90) }}
                                resizeMode='cover'
                            >
                                <Text style={styles.categoryText}>{CATEGORY2}</Text>
                            </ImageBackground>
                        </Link>
                    </HoverableView>
                    <HoverableView style={{...styles.categoryContainer, flexBasis: categoryFlexBasis }} hoveredOpacity={0.8}>
                        <Link to={{ screen: 'Mas', params: params.language ? { language: params.language } : {} }}>
                            <ImageBackground
                                source={require('../assets/CATEGORY3.png')}
                                style={[styles.category, { width: '100%', height: categoryHeight, minHeight: normalize(90) }]}
                                imageStyle={{ opacity: 0.6, minHeight: normalize(90) }}
                                resizeMode='cover'
                            >
                                <Text style={styles.categoryText}>{CATEGORY3}</Text>
                            </ImageBackground>
                        </Link>
                    </HoverableView>
                    <HoverableView style={{...styles.categoryContainer, flexBasis: categoryFlexBasis }} hoveredOpacity={0.8}>
                        <Link to={{ screen: 'Clu', params: params.language ? { language: params.language } : {} }}>
                            <ImageBackground
                                source={require('../assets/CATEGORY4.png')}
                                style={[styles.category, { width: '100%', height: categoryHeight, minHeight: normalize(90) }]}
                                imageStyle={{ opacity: 0.6, minHeight: normalize(90) }}
                                resizeMode='cover'
                            >
                                <Text style={styles.categoryText}>{CATEGORY4}</Text>
                            </ImageBackground>
                        </Link>
                    </HoverableView>
                    {/* <HoverableView style={{...styles.categoryContainer, flexBasis: categoryFlexBasis }} hoveredOpacity={0.8}>
                        <Link to={{ screen: 'Esc', params: params.language ? { language: params.language } : {} }}>
                            <ImageBackground
                                source={require('../assets/CATEGORY.png')}
                                style={[styles.category, { width: '100%'}]}
                                imageStyle={{ opacity: 0.6 }}
                                resizeMode='cover'
                            >
                                <Text style={styles.categoryText}>{CATEGORY5}</Text>
                            </ImageBackground>
                        </Link>
                    </HoverableView> */}
                </View>
            </View>

            <View style={{ marginBottom: SPACING.large }}>
                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.h2, color: '#FFF', marginBottom: SPACING.medium, marginHorizontal: SPACING.page_horizontal }}>
                    New Ladies
                </Text>

                <ScrollView contentContainerStyle={{ marginHorizontal: SPACING.page_horizontal }} horizontal showsHorizontalScrollIndicator={false}>
                    {MOCK_DATA.map((data, index) => <View key={data.id} style={{ marginLeft: index === 0 ? 0 : SPACING.large, width: 150 }}><RenderLady lady={data} width={150} showPrice={false} /></View> )}
                </ScrollView>
            </View>

            <CityPicker visible={locationModalVisible} params={params} setVisible={setLocationModalVisible} route={{ name: 'Esc', params: params.language ? { language: params.language } : {} }} />
        </ScrollView>
    )
}

export default Home

const styles = StyleSheet.create({
    categoryContainer: {
        marginRight: SPACING.large,
        marginBottom: SPACING.large,
        flexShrink: 1
    },
    category: {
        //paddingVertical: SPACING.xx_large, 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20,
        overflow: 'hidden'
    },
    categoryText: {
        fontFamily: FONTS.bold,
        fontSize: FONTS.large,
        color: '#FFF'
    }
})