import { Dimensions } from 'react-native'

const {
  width: SCREEN_WIDTH
} = Dimensions.get('window')

export const LARGE_SCREEN_THRESHOLD = 960
export const SMALL_SCREEN_THRESHOLD = 640

export const isLargeScreen = SCREEN_WIDTH >= LARGE_SCREEN_THRESHOLD
export const isMediumScreen = SCREEN_WIDTH >= SMALL_SCREEN_THRESHOLD && SCREEN_WIDTH < LARGE_SCREEN_THRESHOLD
export const isSmallScreen = SCREEN_WIDTH < SMALL_SCREEN_THRESHOLD

export const SUPPORTED_LANGUAGES = [
    'en',
    'cs'
]

export const CATEGORY1 = 'CATEGORY1'
export const CATEGORY2 = 'CATEGORY2'
export const CATEGORY3 = 'CATEGORY3'
export const CATEGORY4 = 'CATEGORY4'
export const CATEGORY5 = 'CATEGORY5'

export const SUPPORTED_CATEGORIES = [
    CATEGORY1,
    CATEGORY2,
    CATEGORY3,
    CATEGORY4,
    CATEGORY5
]

export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_CITY = 'Praha'
export const DEFAULT_CATEGORY = CATEGORY1

const normalizeSize = (forSmallScreenSize, forMediumScreenSize, forLargeScreenSize) => {
    return isLargeScreen ? forLargeScreenSize : isMediumScreen ? forMediumScreenSize : forSmallScreenSize
}

export const FONTS = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    light: 'Poppins-Light',
    bold: 'Poppins-Bold'
}

export const COLORS = {
    lightGrey: '#323232',//'#404040',
    darkGrey: '#1F1F1F',
    hoveredLightGrey: '#404040',//'#4c4c4c',
    grey: '#1d1c20',//'#1F1F1F',//'#323232',
    greyText: '#a9a9a9',
    lightBlack: '#161616',
    red: '#c91e1e',//'#dc2e2e',
    darkRed: '#720f10',
    darkRed2: '#821516',
    darkRed3: '#6F2232',
    secondaryRed: '#e89492',
    hoveredSecondaryRed: '#b66c6c',
    lightRed: '#D9534F',
    hoveredRed: '#bc2020',
    darkRed: '#990000',
    pastelRed: '#ec9e9f',
    placeholder: '#c4c4c4',
    hoveredWhite: '#efeff0',
    hoveredHoveredWhite: '#e1e1e1',
    error: '#ff190c',
    linkColor: '#0077cc',
    lightPurple: '#cfbcff',
    purple: '#6152bb',
    darkestBlue: '#05375a',
    white: '#FFF'
}

export const FONT_SIZES = {
    x_small: normalizeSize(8, 8, 10),
    small: normalizeSize(10, 10, 12), //span
    medium: normalizeSize(12, 12, 14), //base
    large: normalizeSize(14, 14, 16), //paragraph
    x_large: normalizeSize(18, 18, 20),
    h1: normalizeSize(24, 24, 28),
    h2: normalizeSize(22, 22, 26),
    h3: normalizeSize(20, 20, 24),
}

export const SPACING = {
    xxx_small: normalizeSize(4, 6, 6),
    xx_small: normalizeSize(8, 10, 10),
    x_small: normalizeSize(11, 15, 15),
    small:normalizeSize(15, 20, 20),
    medium: normalizeSize(20, 25, 25),
    large: normalizeSize(25, 30, 30),
    x_large: normalizeSize(30, 35, 35),
    xx_large: normalizeSize(35, 40, 40),
    xxx_large: normalizeSize(40, 45, 45),
    xxxx_large: normalizeSize(45, 50, 50),
    xxxxx_large: normalizeSize(55, 60, 60),
    page_horizontal: normalizeSize(24, 40, 80)
}

export const CURRENCIES = ['CZK', 'EUR']
export const CURRENCY_SYMBOLS = {
    'CZK' : 'Kč',
    'EUR': '€'
}

export const rem = (number) => {
    return isLargeScreen ? number * 16 : isMediumScreen ? number * 14 : number * 12
}

export const MAX_PHOTO_SIZE_MB = 5
export const MAX_VIDEO_SIZE_MB = 10
export const MAX_VIDEOS = 5
export const MAX_PHOTOS = 15
export const MAX_ITEMS_PER_PAGE = 36

export const MIN_AGE = 18
export const MAX_AGE = 60
export const MIN_HEIGHT = 150
export const MAX_HEIGHT = 190
export const MIN_WEIGHT = 50
export const MAX_WEIGHT = 90

export const MOCK_DATA = [
    {
        id: 1,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/CATEGORY1.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 2,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/CATEGORY1.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 3,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/CATEGORY1.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 4,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/CATEGORY1.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 5,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 6,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 7,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 8,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 9,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 10,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 11,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 12,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 13,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 14,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 15,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 16,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 17,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 18,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 19,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 20,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 21,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 22,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 23,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 24,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 25,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 26,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 27,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 28,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 29,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 30,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 31,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 32,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },
    {
        id: 33,
        name: 'Test Name',
        profilePhoto: require('../assets/dummy_photo.png'),
        images: [require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png'),require('../assets/dummy_photo.png')],
        text1: 'Prague',
        text2: 'from 2000 CZK/hour',
        dateOfBirth: '25071996',
        address: {city: 'Praha'}
    },

]