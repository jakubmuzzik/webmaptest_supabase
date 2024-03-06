import React, { useState, memo } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { FONTS, FONT_SIZES, COLORS, SPACING } from '../../constants'
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons'
import { normalize } from '../../utils'
import { Button, Tooltip, IconButton } from 'react-native-paper'
import { connect } from 'react-redux'
import { logOut, updateCurrentUserInRedux } from '../../redux/actions'
import { ACTIVE, IN_REVIEW, INACTIVE, REJECTED } from '../../labels'
import ConfirmationModal from '../../components/modal/ConfirmationModal'

import { updateDoc, doc, db, getAuth } from '../../firebase/config'

import PasswordEditor from '../../components/modal/account/PasswordEditor'
import EmailEditor from '../../components/modal/account/EmailEditor'
import DeleteAccount from '../../components/modal/account/DeleteAccount'

const Settings = ({ setTabHeight, toastRef, logOut, currentUser, updateCurrentUserInRedux }) => {
    const [passwordEditorVisible, setPasswordEditorVisible] = useState(false)
    const [emailEditorVisible, setEmailEditorVisible] = useState(false)
    const [deleteAccountVisible, setDeleteAccountVisible] = useState(false)
    const [deactivateConfirmationVisible, setDeactivateConfirmationVisiblet] = useState(false)
    const [activateConfirmationVisible, setActivateConfirmationVisiblet] = useState(false)

    const onLogoutPress = () => {
        logOut()

        toastRef.current.show({
            type: 'success',
            text: "You've been logged out."
        })
    }

    const onEmailEditPress = () => {
        setEmailEditorVisible(true)
    }

    const onPasswordEditPress = () => {
        setPasswordEditorVisible(true)
    }

    const onStatusChangePress = () => {
        if (currentUser.accountType === 'establishment') {
            return
        }

        if (currentUser.status != INACTIVE && currentUser.status != ACTIVE) {
            return
        }

        if (currentUser.status === ACTIVE) {
            setDeactivateConfirmationVisiblet(true)
        } else {
            setActivateConfirmationVisiblet(true)
        }
    }

    const deactivateProfile = async () => {
        try {
            await updateDoc(doc(db, 'users', getAuth().currentUser.uid), { status: INACTIVE })

            updateCurrentUserInRedux({ status: INACTIVE, id: getAuth().currentUser.uid })

            toastRef.current.show({
                type: 'success',
                headerText: 'Profile deactivated',
                text: 'Profile was successfuly deactivated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Deactivation error',
                text: 'Profile could not be deactivated.'
            })
        }
    }

    const activateProfile = async () => {
        try {
            await updateDoc(doc(db, 'users', getAuth().currentUser.uid), { status: ACTIVE })

            updateCurrentUserInRedux({ status: ACTIVE, id: getAuth().currentUser.uid })

            toastRef.current.show({
                type: 'success',
                headerText: 'Profile activated',
                text: 'Profile was successfuly activated.'
            })
        } catch(error) {
            console.error(error)
            toastRef.current.show({
                type: 'error',
                headerText: 'Activation error',
                text: 'Profile could not be activated.'
            })
        }
    }

    const onDeleteAccountPress = () => {
        setDeleteAccountVisible(true)
    }

    return (
        <View onLayout={(event) => setTabHeight(event.nativeEvent.layout.height)}>
            <View style={styles.container}>
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="email-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                            Email
                        </Text>
                    </View>
                    <Text numberOfLines={1} onPress={onEmailEditPress} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}>
                        {getAuth().currentUser.email}
                    </Text>
                </View>
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="lock-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                            Password
                        </Text>
                    </View>
                    <Text onPress={onPasswordEditPress} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}>
                        Change
                    </Text>
                </View>
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="account-check-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                            Profile Status
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onStatusChangePress} style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={1}>
                        <Octicons name="dot-fill" size={20} color={currentUser.status === IN_REVIEW ? 'yellow' : currentUser.status === INACTIVE ? 'grey' : currentUser.status === REJECTED ? 'red' : 'green'} style={{ marginRight: SPACING.xxx_small }} />
                        <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}>
                            {currentUser.status}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.row}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="delete-outline" size={FONT_SIZES.medium} color="white" style={{ marginRight: SPACING.xxx_small }} />
                        <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.medium, color: '#FFF', marginRight: SPACING.x_small }}>
                            Delete account
                        </Text>
                    </View>
                    <Text onPress={onDeleteAccountPress} style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: COLORS.lightRed }}>
                        Delete
                    </Text>
                </View>
                <Button
                    style={{ alignSelf: 'flex-end', marginTop: SPACING.small }}
                    labelStyle={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.medium, color: '#FFF' }}
                    mode="outlined"
                    icon="logout"
                    onPress={onLogoutPress}
                    rippleColor="rgba(220, 46, 46, .16)"
                >
                    Log out
                </Button>
            </View>

            <PasswordEditor visible={passwordEditorVisible} setVisible={setPasswordEditorVisible} toastRef={toastRef} />
            <EmailEditor visible={emailEditorVisible} setVisible={setEmailEditorVisible} toastRef={toastRef} />
            <DeleteAccount visible={deleteAccountVisible} setVisible={setDeleteAccountVisible} toastRef={toastRef} isEstablishment={currentUser.accountType === 'establishment'} logOut={logOut} />

            <ConfirmationModal
                visible={activateConfirmationVisible}
                headerText='Confirm Activation'
                text='Are you sure you want to activate your profile? Profile will become visible in profile listings and search results.'
                onCancel={() => setActivateConfirmationVisiblet(false)}
                onConfirm={() => activateProfile()}
                headerErrorText='Activation error'
                errorText='Profile could not be activated.'
                confirmLabel='Activate'
                confirmButtonColor='green'
            />

            <ConfirmationModal
                visible={deactivateConfirmationVisible}
                headerText='Confirm Deactivation'
                text='Are you sure you want to deactivate your profile? Profile will be hidden from the profile listings and search results. You can reactivate your profile at any time.'
                onCancel={() => setDeactivateConfirmationVisiblet(false)}
                onConfirm={() => deactivateProfile()}
                headerErrorText='Deactivation error'
                errorText='Profile could not be deactivated.'
                confirmLabel='Deactivate'
                confirmButtonColor={COLORS.lightBlack}
            />
        </View>
    )
}

const mapStateToProps = (store) => ({
    toastRef: store.appState.toastRef
})

export default connect(mapStateToProps, { logOut, updateCurrentUserInRedux })(memo(Settings))

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.large,
        paddingVertical: SPACING.small,
        paddingHorizontal: SPACING.medium,
        borderRadius: 20,
        backgroundColor: COLORS.grey
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.small,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey
    }
})