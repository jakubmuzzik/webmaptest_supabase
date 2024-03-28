import { useEffect } from "react"
import { connect } from "react-redux"
import { getParam } from '../utils'
import { SUPPORTED_LANGUAGES } from '../constants'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'

const RequireAuth = ({ children, currentAuthUser }) => {
    const location = useLocation()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const hasParams = new URLSearchParams(location.hash)

        //forgot password redirect
        if (hasParams.get('error_code')?.startsWith('4')) {
            window.alert(hasParams.get('error_description'))
        }
    }, [])

    const params = {
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }

    const isLoggedIn = currentAuthUser.id

    if (!isLoggedIn) {
        console.log('is not logged in')
        let to = '/auth'
        //need to hardcode => search param on Navigate component didn't work
        if (params.language) {
            to += '?language=' + params.language
        }

        return <Navigate to={to} state={{ from: location }} replace />
    }

    return children
}

const mapStateToProps = (store) => ({
    currentAuthUser: store.userState.currentAuthUser
})

export default connect(mapStateToProps)(RequireAuth)