import {
  MIN_AGE,
  MAX_AGE,
  MIN_HEIGHT,
  MAX_HEIGHT,
  MIN_WEIGHT,
  MAX_WEIGHT,
  isSmallScreen
} from '../constants'
import { 
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
import { where } from '../firebase/config'

import { encode } from "blurhash"
import { MASSAGE_SERVICES } from '../labels'

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
  const parts = uri.split(',')
  return parts[0].split('/')[0].split(':')[1]
}

export const normalize = (size, inverse = false) => {
  return isSmallScreen ? size - 5 * (inverse ? -1 : 1) : size
}

export const stripEmptyParams = (params) => {
  return Object.keys(params).reduce((out, param) => params[param] ? {...out, [param]: params[param]} : out, {})
  //return params.reduce((out, param) => param ? {...out, [param]: }, {})
}

export const stripDefaultFilters = (defaultFilters, filters) => {
  return Object.keys(filters).reduce((out, filter) => areValuesEqual(filters[filter], defaultFilters[filter]) ? out : {...out, [filter]: filters[filter]}, {})
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

export const calculateAgeFromDate = (dateStr) => {
  const parsedPastDate = new Date(dateStr.slice(4, 8), dateStr.slice(2, 4) - 1, dateStr.slice(0, 2))
  const today = new Date()

  const timeDiff = today - parsedPastDate;

  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;

  const yearsDiff = timeDiff / millisecondsInYear;

  const roundedYears = Math.floor(yearsDiff);

  return roundedYears;
}

export const chunkArray = (arr, chunkSize) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  
  return chunks
}

export const getFilterParams = (searchParams) => {
  const ageRangeParam = decodeURIComponent(searchParams.get('ageRange'))?.split(',')
  let ageRange = undefined
  if (Array.isArray(ageRangeParam) && ageRangeParam.length === 2) {
    ageRange = []
    ageRange[0] = !isNaN(ageRangeParam[0]) && ageRangeParam[0] >= MIN_AGE && ageRangeParam[0] < MAX_AGE ? ageRangeParam[0] : MIN_AGE
    ageRange[1] = !isNaN(ageRangeParam[1]) && ageRangeParam[1] > ageRange[0] && ageRangeParam[1] <= MAX_AGE ? ageRangeParam[1] : MAX_AGE
  }

  const heightRangeParam = decodeURIComponent(searchParams.get('heightRange'))?.split(',')
  let heightRange = undefined
  if (Array.isArray(heightRangeParam) && heightRangeParam.length === 2) {
    heightRange = []
    heightRange[0] = !isNaN(heightRangeParam[0]) && heightRangeParam[0] >= MIN_HEIGHT && heightRangeParam[0] < MAX_HEIGHT ? heightRangeParam[0] : MIN_HEIGHT
    heightRange[1] = !isNaN(heightRangeParam[1]) && heightRangeParam[1] > heightRange[0] && heightRangeParam[1] <= MAX_HEIGHT ? heightRangeParam[1] : MAX_HEIGHT
  }

  const weightRangeParam = decodeURIComponent(searchParams.get('weightRange'))?.split(',')
  let weightRange = undefined
  if (Array.isArray(weightRangeParam) && weightRangeParam.length === 2) {
    weightRange = []
    weightRange[0] = !isNaN(weightRangeParam[0]) && weightRangeParam[0] >= MIN_WEIGHT && weightRangeParam[0] < MAX_WEIGHT ? weightRangeParam[0] : MIN_WEIGHT
    weightRange[1] = !isNaN(weightRangeParam[1]) && weightRangeParam[1] > weightRange[0] && weightRangeParam[1] <= MAX_WEIGHT ? weightRangeParam[1] : MAX_WEIGHT
  }

  const isBoolean = (value) => value === 'true' || value === 'false'

  return stripEmptyParams({
    ageRange,
    heightRange,
    weightRange,
    //onlyVerified: isBoolean(searchParams.get('onlyVerified')) ? Boolean(searchParams.get('onlyVerified')) : undefined,
    onlyIndependent: isBoolean(searchParams.get('onlyIndependent')) ? Boolean(searchParams.get('onlyIndependent')) : undefined,
    outcall: isBoolean(searchParams.get('outcall')) ? Boolean(searchParams.get('outcall')) : undefined,
    incall: isBoolean(searchParams.get('incall')) ? Boolean(searchParams.get('incall')) : undefined,
    services: searchParams.get('services') ? decodeURIComponent(searchParams.get('services')).split(',').filter(val => SERVICES.includes(val)) : undefined,
    bodyType: searchParams.get('bodyType') ? decodeURIComponent(searchParams.get('bodyType')).split(',').filter(val => BODY_TYPES.includes(val)) : undefined,
    hairColor: searchParams.get('hairColor') ? decodeURIComponent(searchParams.get('hairColor')).split(',').filter(val => HAIR_COLORS.includes(val)) : undefined,
    eyeColor: searchParams.get('eyeColor') ? decodeURIComponent(searchParams.get('eyeColor')).split(',').filter(val => EYE_COLORS.includes(val)) : undefined,
    pubicHair: searchParams.get('pubicHair') ? decodeURIComponent(searchParams.get('pubicHair')).split(',').filter(val => PUBIC_HAIR_VALUES.includes(val)) : undefined,
    breastSize: searchParams.get('breastSize') ? decodeURIComponent(searchParams.get('breastSize')).split(',').filter(val => BREAST_SIZES.includes(val)) : undefined,
    breastType: searchParams.get('breastType') ? decodeURIComponent(searchParams.get('breastType')).split(',').filter(val => BREAST_TYPES.includes(val)) : undefined,
    speaks: searchParams.get('speaks') ? decodeURIComponent(searchParams.get('speaks')).split(',').filter(val => LANGUAGES.includes(val)) : undefined,
    nationality: searchParams.get('nationality') ? decodeURIComponent(searchParams.get('nationality')).split(',').filter(val => NATIONALITIES.includes(val)) : undefined,
    sexualOrientation: searchParams.get('sexualOrientation') ? decodeURIComponent(searchParams.get('sexualOrientation')).split(',').filter(val => SEXUAL_ORIENTATION.includes(val)) : undefined
  })
}

export const buildWhereConditions = (filterParams) => {
  let whereConditions = []

  const filterNames = Object.keys(filterParams)
  console.log(filterNames)

  if (filterNames.includes('ageRange')) {

  } else {

  }

  if (filterNames.includes('heightRange')) {

  } else {

  }

  if (filterNames.includes('weightRange')) {

  } else {

  }

  if (filterNames.includes('onlyIndependent')) {
    //whereConditions.push(where('independent', '==', true), )
  } else {

  }

  if (filterNames.includes('outcall')) {

  } else {

  }

  if (filterNames.includes('incall')) {

  } else {

  }

  whereConditions.push(where('services', 'array-contains-any', filterNames.includes('services') ? filterParams.services : [...SERVICES, ...MASSAGE_SERVICES]))

  whereConditions.push(where('bodyType', 'array-contains-any', filterNames.includes('bodyType') ? filterParams.bodyType : BODY_TYPES))

  whereConditions.push(where('hairColor', 'array-contains-any', filterNames.includes('hairColor') ? filterParams.hairColor : HAIR_COLORS))

  whereConditions.push(where('eyeColor', 'array-contains-any', filterNames.includes('eyeColor') ? filterParams.eyeColor : EYE_COLORS))

  whereConditions.push(where('pubicHair', 'array-contains-any', filterNames.includes('pubicHair') ? filterParams.pubicHair : PUBIC_HAIR_VALUES))

  whereConditions.push(where('breastSize', 'array-contains-any', filterNames.includes('breastSize') ? filterParams.breastSize : BREAST_SIZES))

  whereConditions.push(where('breastType', 'array-contains-any', filterNames.includes('breastType') ? filterParams.breastType : BREAST_TYPES))

  whereConditions.push(where('languages', 'array-contains-any', filterNames.includes('speaks') ? filterParams.speaks : LANGUAGES))

  whereConditions.push(where('nationality', 'array-contains-any', filterNames.includes('nationality') ? filterParams.nationality : NATIONALITIES))

  whereConditions.push(where('sexuality', 'array-contains-any', filterNames.includes('sexualOrientation') ? filterParams.sexualOrientation : SEXUAL_ORIENTATION))

  return whereConditions
}