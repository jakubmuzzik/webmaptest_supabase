import {
  MIN_AGE,
  MAX_AGE,
  MIN_HEIGHT,
  MAX_HEIGHT,
  MIN_WEIGHT,
  MAX_WEIGHT,
  isSmallScreen,
  SPACING
} from '../constants'
import { 
  BODY_TYPES,
  PUBIC_HAIR_VALUES,
  SEXUAL_ORIENTATION,
  SERVICES,
  MASSAGE_SERVICES,
  HAIR_COLORS,
  BREAST_SIZES,
  BREAST_TYPES,
  EYE_COLORS,
  LANGUAGES,
  NATIONALITIES,
  ESTABLISHMENT_TYPES
} from '../labels'

import { encode } from "blurhash"

const loadImage = async src =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (...args) => reject(args)
    img.src = src;
  })

const getImageData = image => {
  const canvas = document.createElement("canvas")
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext("2d")
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
};

export const encodeImageToBlurhash = async imageUrl => {
  const image = await loadImage(imageUrl)
  const imageData = getImageData(image)
  //return encode(imageData.data, imageData.width, imageData.height, 4, 4)
  return encode(imageData.data, imageData.width, imageData.height, 1, 1)
}

export const getFileSizeInMb = (uri) => {
  return (uri.length * (3 / 4) - 2) / (1024 * 1024)
}

export const getDataType = (uri) => {
  try {
    const parts = uri.split(',')
    return parts[0].split('/')[0].split(':')[1]
  } catch(e) {
    console.error('Could not get file type')
    return ''
  }
}

export const getFileExtension = (uri) => {
  try {
    const parts = uri.split(',')
    return parts[0].split('/')[1].split(';')[0]
  } catch(e) {
    console.error('Could not get file extension')
    return ''
  }
}

export const getMimeType = (uri) => {
  try {
    const parts = uri.split(',')
    return parts[0].split(':')[1].split(';')[0]
  } catch(e) {
    console.error('Could not get file mime type')
    return ''
  }
}

export const normalize = (size, inverse = false) => {
  return isSmallScreen ? size - 5 * (inverse ? -1 : 1) : size
}

export const getParam = (supportedValues, param, fallbackValue) => {
  if (!supportedValues) {
    return fallbackValue
  }

  const decodedParam = decodeURIComponent(param)

  if (!decodedParam) {
    return fallbackValue
  }

  const paramValid = supportedValues.some(value => value.toLowerCase() === decodedParam.toLocaleLowerCase())
  return paramValid ? decodedParam : fallbackValue
}

export const deepClone = (data) => JSON.parse(JSON.stringify(data))

//HELPER FUNCTIONS
const isArrayEqual = (array1, array2) => array1.length === array2.length && array1.every((value, index) => areValuesEqual(value,array2[index]))

const areDatesEqual = (date1, date2) => date1.getTime() === date2.getTime()

const areObjectsEqual = (object1, object2) => {
  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)
  if (keys1.length !== keys2.length) {
      return false
  }
  for (let key of keys1) {
      if (object1[key] !== object2[key]) {
          return false
      }
  }
  return true
}

//if same -> return true
export const areValuesEqual = (val1, val2) => {
  return typeof val1 === 'object' ? 
    (
      val1 instanceof Date ? areDatesEqual(val1, val2) 
      : Array.isArray(val1) ? isArrayEqual(val1, val2) 
      : areObjectsEqual(val1, val2)
    ) : val1 === val2
}

export const generateThumbnailFromLocalURI = (uri, time) => {
  return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = uri;
      video.crossOrigin = "anonymous";
      video.addEventListener("loadeddata", () => {
          try {
              video.currentTime = time;
          } catch (e) {
              console.log(e)
              reject(e);
          }
      });

      video.addEventListener("seeked", () => {
          try {
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const imageUrl = canvas.toDataURL();
                  resolve(imageUrl);
              } else {
                  reject(new Error("Failed to get canvas context"));
              }
          } catch (e) {
              reject(e);
              console.log(e)
          }
      });
      video.load();
  });
}

export const convertStringToDate = (dateStr) => {
  return dateStr.length === 8 ? new Date(Date.UTC(dateStr.slice(4, 8), dateStr.slice(2, 4) - 1, dateStr.slice(0, 2))) : ''
}

export const convertDateToString = (dateVal) => {
  const dateParts = dateVal instanceof Date ? dateVal.toISOString().split('-') : dateVal.split('-')

  //e.g. 25071996
  return dateParts[2].split('T')[0] + '.' + dateParts[1] + '.' + dateParts[0]
}

export const convertDateToBirthdayString = (dateVal) => {
  const dateParts = dateVal instanceof Date ? dateVal.toISOString().split('-') : dateVal.split('-')

  //e.g. 25071996
  return dateParts[2].split('T')[0] + dateParts[1] + dateParts[0]
}

export const calculateAgeFromDate = (dateStr) => {
  //const parsedPastDate = new Date(dateStr.slice(4, 8), dateStr.slice(2, 4) - 1, dateStr.slice(0, 2))
  const today = new Date()

  const timeDiff = today - new Date(dateStr);

  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;

  const yearsDiff = timeDiff / millisecondsInYear;

  const roundedYears = Math.floor(yearsDiff);

  return roundedYears;
}

export const calculateLadyCardWidth = (contentWidth) => {
  const isXSmallScreen = contentWidth < 300 //1 item
  const isSmallScreen = contentWidth >= 300 && contentWidth < 550 //2 items
  const isMediumScreen = contentWidth >= 550 && contentWidth < 950 //3 items
  const isXMediumScreen = contentWidth >= 950 && contentWidth < 1300 //4 items

  return isXSmallScreen ? (contentWidth) - (SPACING.large + SPACING.large)
    : isSmallScreen ? (contentWidth / 2) - (SPACING.large + SPACING.large / 2)
      : isMediumScreen ? (contentWidth / 3) - (SPACING.large + SPACING.large / 3)
        : isXMediumScreen ? (contentWidth / 4) - (SPACING.large + SPACING.large / 4)
          : (contentWidth / 6) - (SPACING.large + SPACING.large / 6)
}

export const calculateEstablishmentCardWidth = (contentWidth) => {
  const isXSmallScreen = contentWidth < 300 //1 item
  const isSmallScreen = contentWidth >= 300 && contentWidth < 550 //2 items
  const isMediumScreen = contentWidth >= 550 && contentWidth < 950 //3 items
  const isXMediumScreen = contentWidth >= 950 && contentWidth < 1500 //4 items

  return isXSmallScreen ? (contentWidth) - (SPACING.large + SPACING.large)
    : isSmallScreen ? (contentWidth / 2) - (SPACING.large + SPACING.large / 2)
      : isMediumScreen ? (contentWidth / 3) - (SPACING.large + SPACING.large / 3)
        : isXMediumScreen ? (contentWidth / 4) - (SPACING.large + SPACING.large / 4)
          : (contentWidth / 6) - (SPACING.large + SPACING.large / 6)
}

export const chunkArray = (arr, chunkSize) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  
  return chunks
}

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
} 

export const stripEmptyParams = (params) => {
  return Object.keys(params).reduce((out, param) => params[param] ? {...out, [param]: params[param]} : out, {})
  //return params.reduce((out, param) => param ? {...out, [param]: }, {})
}

export const stripDefaultFilters = (defaultFilters, filters) => {
  return Object.keys(filters).reduce((out, filter) => areValuesEqual(filters[filter], defaultFilters[filter]) ? out : {...out, [filter]: filters[filter]}, {})
}

export const getFilterParams = (searchParams) => {
  const ageRangeParam = decodeURIComponent(searchParams.get('ageRange'))?.split(',')
  let ageRange = undefined
  if (Array.isArray(ageRangeParam) && ageRangeParam.length === 2) {
    ageRange = []
    ageRange[0] = !isNaN(ageRangeParam[0]) && ageRangeParam[0] >= MIN_AGE && ageRangeParam[0] < MAX_AGE ? Number(ageRangeParam[0]) : MIN_AGE
    ageRange[1] = !isNaN(ageRangeParam[1]) && ageRangeParam[1] > ageRange[0] && ageRangeParam[1] <= MAX_AGE ? Number(ageRangeParam[1]) : MAX_AGE
  }

  const heightRangeParam = decodeURIComponent(searchParams.get('heightRange'))?.split(',')
  let heightRange = undefined
  if (Array.isArray(heightRangeParam) && heightRangeParam.length === 2) {
    heightRange = []
    heightRange[0] = !isNaN(heightRangeParam[0]) && heightRangeParam[0] >= MIN_HEIGHT && heightRangeParam[0] < MAX_HEIGHT ? Number(heightRangeParam[0]) : MIN_HEIGHT
    heightRange[1] = !isNaN(heightRangeParam[1]) && heightRangeParam[1] > heightRange[0] && heightRangeParam[1] <= MAX_HEIGHT ? Number(heightRangeParam[1]) : MAX_HEIGHT
  }

  const weightRangeParam = decodeURIComponent(searchParams.get('weightRange'))?.split(',')
  let weightRange = undefined
  if (Array.isArray(weightRangeParam) && weightRangeParam.length === 2) {
    weightRange = []
    weightRange[0] = !isNaN(weightRangeParam[0]) && weightRangeParam[0] >= MIN_WEIGHT && weightRangeParam[0] < MAX_WEIGHT ? Number(weightRangeParam[0]) : MIN_WEIGHT
    weightRange[1] = !isNaN(weightRangeParam[1]) && weightRangeParam[1] > weightRange[0] && weightRangeParam[1] <= MAX_WEIGHT ? Number(weightRangeParam[1]) : MAX_WEIGHT
  }

  const isBoolean = (value) => value === 'true' || value === 'false'

  return stripEmptyParams({
    city: searchParams.get('city'),
    ageRange,
    heightRange,
    weightRange,
    //onlyVerified: isBoolean(searchParams.get('onlyVerified')) ? Boolean(searchParams.get('onlyVerified')) : undefined,
    onlyIndependent: isBoolean(searchParams.get('onlyIndependent')) ? Boolean(searchParams.get('onlyIndependent')) : undefined,
    outcall: isBoolean(searchParams.get('outcall')) ? Boolean(searchParams.get('outcall')) : undefined,
    incall: isBoolean(searchParams.get('incall')) ? Boolean(searchParams.get('incall')) : undefined,
    services: searchParams.get('services') ? decodeURIComponent(searchParams.get('services')).split(',').filter(val => [...SERVICES, ...MASSAGE_SERVICES].includes(val)) : undefined,
    body_type: searchParams.get('body_type') ? decodeURIComponent(searchParams.get('body_type')).split(',').filter(val => BODY_TYPES.includes(val)) : undefined,
    hair_color: searchParams.get('hair_color') ? decodeURIComponent(searchParams.get('hair_color')).split(',').filter(val => HAIR_COLORS.includes(val)) : undefined,
    eye_color: searchParams.get('eye_color') ? decodeURIComponent(searchParams.get('eye_color')).split(',').filter(val => EYE_COLORS.includes(val)) : undefined,
    pubic_hair: searchParams.get('pubic_hair') ? decodeURIComponent(searchParams.get('pubic_hair')).split(',').filter(val => PUBIC_HAIR_VALUES.includes(val)) : undefined,
    breast_size: searchParams.get('breast_size') ? decodeURIComponent(searchParams.get('breast_size')).split(',').filter(val => BREAST_SIZES.includes(val)) : undefined,
    breast_type: searchParams.get('breast_type') ? decodeURIComponent(searchParams.get('breast_type')).split(',').filter(val => BREAST_TYPES.includes(val)) : undefined,
    speaks: searchParams.get('speaks') ? decodeURIComponent(searchParams.get('speaks')).split(',').filter(val => LANGUAGES.includes(val)) : undefined,
    nationality: searchParams.get('nationality') ? decodeURIComponent(searchParams.get('nationality')).split(',').filter(val => NATIONALITIES.includes(val)) : undefined,
    establishment_type: searchParams.get('establishment_type') ? decodeURIComponent(searchParams.get('establishment_type')).split(',').filter(val => ESTABLISHMENT_TYPES.includes(val)) : undefined,
    //sexualOrientation: searchParams.get('sexualOrientation') ? decodeURIComponent(searchParams.get('sexualOrientation')).split(',').filter(val => SEXUAL_ORIENTATION.includes(val)) : undefined
  })
}

export const buildFiltersForQuery = (query, filterParams) => {
  const filterNames = Object.keys(filterParams)

  if (filterParams.city) {
    query = query.eq('address->>city', filterParams.city)
  }

  if (filterNames.includes('ageRange')) {
    const calculateMinDateOfBirthFromAge = (age) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      const birthYear = currentYear - age - 1;

      return new Date(Date.UTC(birthYear, today.getMonth(), today.getDate())).toISOString()
    }

    const calculateMaxDateOfBirthFromAge = (age) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      const birthYear = currentYear - age;

      return new Date(Date.UTC(birthYear, today.getMonth(), today.getDate())).toISOString()
    }
    
    query = query.lte('date_of_birth', calculateMaxDateOfBirthFromAge(filterParams.ageRange[0]))
    query = query.gte('date_of_birth', calculateMinDateOfBirthFromAge(filterParams.ageRange[1]))
  }

  if (filterNames.includes('heightRange')) {
    query = query.gte('height', filterParams.heightRange[0])
    query = query.lte('height', filterParams.heightRange[1])
  }

  if (filterNames.includes('weightRange')) {
    query = query.gte('weight', filterParams.weightRange[0])
    query = query.lte('weight', filterParams.weightRange[1])
  }

  if (filterNames.includes('onlyIndependent')) {
    query = query.is('establishment_id', null)
  }

  if (filterNames.includes('outcall')) {
    query = query.eq('outcall', true)
  }

  if (filterNames.includes('incall')) {
    query = query.eq('incall', true)
  }

  if (filterNames.includes('services')) {
    query = query.overlaps('services', filterParams.services)
  }

  if (filterNames.includes('body_type')) {
    query = query.or(filterParams.body_type.map(value => 'body_type.eq.' + value).join(','))
  }

  if (filterNames.includes('hair_color')) {
    query = query.or(filterParams.hair_color.map(value => 'hair_color.eq.' + value).join(','))
  }

  if (filterNames.includes('eye_color')) {
    query = query.or(filterParams.eye_color.map(value => 'eye_color.eq.' + value).join(','))
  }

  if (filterNames.includes('pubic_hair')) {
    query = query.or(filterParams.pubic_hair.map(value => 'pubic_hair.eq.' + value).join(','))
  }

  if (filterNames.includes('breast_size')) {
    query = query.or(filterParams.breast_size.map(value => 'breast_size.eq.' + value).join(','))
  }

  if (filterNames.includes('breast_type')) {
    query = query.or(filterParams.breast_type.map(value => 'breast_type.eq.' + value).join(','))
  }

  if (filterNames.includes('speaks')) {
    query = query.overlaps('languages', filterParams.speaks)
  }

  if (filterNames.includes('nationality')) {
    query = query.or(filterParams.nationality.map(value => 'nationality.eq.' + value).join(','))
  }

  if (filterNames.includes('establishment_type')) {
    query = query.or(filterParams.establishment_type.map(value => 'establishment_type.eq.' + value).join(','))
  }

  return query
}