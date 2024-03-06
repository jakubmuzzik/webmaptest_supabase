import React, { useState, useMemo, useRef } from 'react'
import { View, useWindowDimensions, Text } from 'react-native'
import { COLORS, FONTS, FONT_SIZES, MAX_ITEMS_PER_PAGE, SPACING } from '../constants'
import { getFilterParams, normalize, stripEmptyParams } from '../utils'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { AntDesign } from '@expo/vector-icons'
import HoverableIcon from './HoverableIcon'
import HoverableText from './HoverableText'

const Pagination = ({ dataCount, maxItemsPerPage = MAX_ITEMS_PER_PAGE }) => {
    const [searchParams] = useSearchParams()
    const location = useLocation()

    const { width } = useWindowDimensions()

    const params = useMemo(() => ({
        //does not need to have a supported language val.. do not translating anything here...
        //same for city..
        language: searchParams.get('city'),
        city: searchParams.get('city'),
        page: searchParams.get('page') && !isNaN(searchParams.get('page')) ? searchParams.get('page') : 1
    }), [searchParams])

    const filterParams = useMemo(() => {
        return getFilterParams(searchParams)
    }, [searchParams])

    const allPages = useRef([...Array(Math.ceil(dataCount / maxItemsPerPage)).keys()].map((_, index) => ({pagenum: index + 1})))

    const PAGINATION_ITEM_WIDTH = normalize(28) + 20
    const MAX_PAGINATION_WIDTH = width - normalize(160)
    const MAX_VISIBLE_PAGES = Math.floor(MAX_PAGINATION_WIDTH / PAGINATION_ITEM_WIDTH) - 4

    let leftMostVisiblePageNumber = params.page
    let rightMostVisiblePageNumber = params.page

    if (allPages.current.length > MAX_VISIBLE_PAGES) {
        let pagesToDistribute = MAX_VISIBLE_PAGES

        while(pagesToDistribute > 0) {
            if (Number(leftMostVisiblePageNumber) > 1) {
                leftMostVisiblePageNumber--
                pagesToDistribute--
            }

            if (pagesToDistribute > 0 && Number(rightMostVisiblePageNumber) < allPages.current.length) {
                rightMostVisiblePageNumber++
                pagesToDistribute--
            }
        }
    } else {
        leftMostVisiblePageNumber = 1
        rightMostVisiblePageNumber = allPages.current.length
    }

    const visiblePages = allPages.current.slice(leftMostVisiblePageNumber - 1, rightMostVisiblePageNumber)

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Link style={{ textDecoration: 'none', width: PAGINATION_ITEM_WIDTH }} to={{
                pathname: location.pathname,
                search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: 1, ...filterParams })).toString()
            }}>
                <HoverableIcon color={COLORS.white} hoveredColor={COLORS.red} containerStyle={{ alignItems: 'flex-end' }} renderIcon={(color) => <AntDesign name="doubleleft" size={FONT_SIZES.x_large} color={color} />} />
            </Link>
            <Link style={{ textDecoration: 'none', width: PAGINATION_ITEM_WIDTH }} to={{
                pathname: location.pathname,
                search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: Number(params.page) === 1 ? 1 : Number(params.page) - 1, ...filterParams })).toString()
            }}>
                <HoverableIcon color={COLORS.white} hoveredColor={COLORS.red} containerStyle={{ alignItems: 'flex-end' }} renderIcon={(color) => <AntDesign name="left" size={FONT_SIZES.x_large} color={color} />} />
            </Link>

            <View style={{ marginHorizontal: SPACING.xxx_small, flexDirection: 'row' }}>
                {visiblePages.map(page => (
                    <Link
                        key={page.pagenum}
                        style={{ textDecoration: 'none', minWidth: PAGINATION_ITEM_WIDTH, alignItems: 'center', display: 'flex', justifyContent: 'center' }}
                        to={{
                            pathname: location.pathname,
                            search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: page.pagenum, ...filterParams })).toString()
                        }}
                    >
                        <HoverableText
                            text={page.pagenum}
                            hoveredColor={COLORS.red}
                            textStyle={{
                                width: '100%',
                                textAlign: 'center',
                                fontFamily: FONTS.medium,
                                fontSize: FONT_SIZES.x_large,
                                paddingHorizontal: 10,
                                color: Number(params.page) === page.pagenum ? COLORS.red : COLORS.white
                            }}
                        />
                    </Link>
                ))}

                {allPages.current.length > MAX_VISIBLE_PAGES && Number(rightMostVisiblePageNumber) !== allPages.current.length && (
                    <>
                        <Text style={{ textAlign: 'center', fontFamily: FONTS.medium,  fontSize: FONT_SIZES.x_large, color: COLORS.white }}>
                            ...
                        </Text>

                        <Link
                            style={{ textDecoration: 'none', minWidth: PAGINATION_ITEM_WIDTH, alignItems: 'center', display: 'flex', justifyContent: 'center' }}
                            to={{
                                pathname: location.pathname,
                                search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: allPages.current.length, ...filterParams })).toString()
                            }}
                        >
                            <HoverableText
                                text={allPages.current.length}
                                hoveredColor={COLORS.red}
                                textStyle={{
                                    width: '100%',
                                    textAlign: 'center',
                                    fontFamily: FONTS.medium,
                                    fontSize: FONT_SIZES.x_large,
                                    color: Number(params.page) === allPages.current.length ? COLORS.red : COLORS.white
                                }}
                            />
                        </Link>
                    </>
                )}
            </View>

            <Link style={{ textDecoration: 'none', width: PAGINATION_ITEM_WIDTH }} to={{
                pathname: location.pathname,
                search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: Number(params.page) === allPages.current.length ? allPages.current.length : Number(params.page) + 1, ...filterParams })).toString()
            }}>
                <HoverableIcon color={COLORS.white} hoveredColor={COLORS.red} renderIcon={(color) => <AntDesign name="right" size={FONT_SIZES.x_large} color={color} />} />
            </Link>
            <Link style={{ textDecoration: 'none', width: PAGINATION_ITEM_WIDTH }} to={{
                pathname: location.pathname,
                search: new URLSearchParams(stripEmptyParams({ language: params.language, city: params.city, page: allPages.current.length, ...filterParams })).toString()
            }}>
                <HoverableIcon color={COLORS.white} hoveredColor={COLORS.red} renderIcon={(color) => <AntDesign name="doubleright" size={FONT_SIZES.x_large} color={color} />} />
            </Link>
        </View>
    )
}

export default Pagination