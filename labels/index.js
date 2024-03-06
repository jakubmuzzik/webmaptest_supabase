import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "../constants"

export const translateLabel = (language, label) => {
    const translateTo = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    
    return LABELS[label][translateTo]
}

export const translateLabels = (language, labels) => labels.reduce((out, label) => ({...out, [label] : translateLabel(language, label)}), {}) 

//COUNTRIES / CITIES - TODO - load supported contries / cities from database?
export const BRNO = 'Brno'
export const CESKE_BUDEJOVICE = 'České Budějovice'
export const CHOMUTOV = 'Chomutov'
export const DECIN = 'Děčín'
export const HAVIROV = 'Havířov'
export const HRADEC_KRALOVE = 'Hradec Králové'
export const JABLONEC = 'Jablonec nad Nisou'
export const JIHLAVA = 'Jihlava'
export const KARLOVY = 'Karlovy Vary'
export const KARVINA = 'Karviná'
export const KLADNO = 'Kladno'
export const LIBEREC = 'Liberec'
export const MLADA_BOLESLAV = 'Mladá Boleslav'
export const MOST = 'Most'
export const OLOMOUC = 'Olomouc'
export const OPAVA = 'Opava'
export const OSTRAVA = 'Ostrava'
export const PARDUBICE = 'Pardubice'
export const PLZEN = 'Plzeň'
export const PRAGUE = 'Praha'
export const PREROV = 'Přerov'
export const PROSTEJOV = 'Prostějov'
export const TEPLICE = 'Teplice'
export const TRINEC = 'Třinec'
export const USTI = 'Ústí nad Labem'
export const ZLIN = 'Zlín'

//LABELS
export const CZECH = 'CZECH'
export const HOME = 'HOME' 
export const CITY = 'CITY'
export const SEARCH = 'SEARCH'
export const SELECT_CITY = 'SELECT_CITY'
export const SIGN_IN = 'SIGN_IN'
export const SIGN_UP = 'SIGN_UP'
export const ANYWHERE = 'ANYWHERE'

//STATUSES
export const IN_REVIEW = 'IN_REVIEW'
export const ACTIVE = 'ACTIVE'
export const INACTIVE = 'INACTIVE'
export const REJECTED = 'REJECTED'
export const DELETED = 'DELETED'

export const BODY_TYPE_SLIM = 'Slim' // TODO - do this for all filter values


export const BODY_TYPES = [BODY_TYPE_SLIM, 'Athletic', 'Muscular', 'Curvy']
export const PUBIC_HAIR_VALUES = ['Shaved', 'Trimmed', 'Natural']
export const SEXUAL_ORIENTATION = ['Heterosexual', 'Homosexual', 'Bisexual', 'Transsexual']
export const MASSAGE_SERVICES = ['Prostate massage', 'Relaxing & Erotic massage', 'Tantra massage']
export const SERVICES = ['Classic sex', 'Oral with condom', 'Shower together', 'Kissing', 'Oral without condom', 'Deepthroat', 'Autoerotic', 'Lesbishow', 'Anal sex', 'Footfetish', 'Piss', 'Rimming', 'Cum on body', 'Cum on face', 'Cum in mouth', 'Swallowing', 'Licking', 'Position 69', 'Group sex', 'Vibrator show', 'Fisting']
export const HAIR_COLORS = ['Black', 'Blonde', 'Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Red', 'White']
export const BREAST_SIZES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H+']
export const BREAST_TYPES = ['Natural', 'Silicone']
export const EYE_COLORS = ['Blue', 'Brown', 'Gray', 'Green', 'Hazel']
export const LANGUAGES = ['English', 'French', 'German', 'Japanese', 'Italian', 'Russian', 'Spanish', 'Chinese', 'Arabic', 'Hindi', 'Portuguese', 'Turkish', 'Indonesian', 'Dutch', 'Korean', 'Bengali', 'Thai', 'Punjabi', 'Greek', 'Polish', 'Malay', 'Tagalog', 'Danish', 'Swedish', 'Finnish', 'Czech', 'Hungarian', 'Ukrainian']
export const NATIONALITIES = ['Australian','Brazilian','Canadian','Chinese','French','German','Indian','Italian','Japanese','Korean','Mexican', 'Mixed', 'Russian','Spanish','American']
export const ESTABLISHMENT_TYPES = ['Club']

export const LABELS = {
    [HOME]: {
        'en': 'Home',
        'cs': 'Doma'
    },
    [CZECH]: {
        'en': 'Czech Republic',
        'cs': 'Česká Republika'
    },
    [CITY]: {
        'en': 'City',
        'cs': 'Město'
    },
    [SEARCH]: {
        'en': 'Search',
        'cs': 'Hledat'
    },
    [SELECT_CITY]: {
        'en': 'Select a city',
        'cs': 'Vybrat město'
    },
    [SIGN_IN]: {
        'en': 'Log in',
        'cs': 'Přihlásit'
    },
    [SIGN_UP]: {
        'en': 'Sign Up',
        'cs': 'Registrace'
    },
    [ANYWHERE]: {
        'en': 'Anywhere',
        'cs': 'Kdekoliv'
    }
}