import { connect } from "react-redux"
import { getParam } from '../utils'
import { SUPPORTED_LANGUAGES } from '../constants'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'

const RequireAdminUser = ({ children, currentAuthUser }) => {
    const location = useLocation()
    const [searchParams] = useSearchParams()

    const params = {
        language: getParam(SUPPORTED_LANGUAGES, searchParams.get('language'), '')
    }

    const isLoggedIn = currentAuthUser.id

    if (!isLoggedIn || currentAuthUser.app_metadata.userrole !== 'ADMIN') {
        let to = '/'
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

export default connect(mapStateToProps)(RequireAdminUser)