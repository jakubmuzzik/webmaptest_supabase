import React from 'react'
import { Modal } from 'react-native'
import { BlurView } from 'expo-blur'
import { MotiView } from 'moti'
import { ActivityIndicator } from 'react-native-paper'
import { COLORS } from '../../constants'

const OverlaySpinner = ({ color=COLORS.red }) => {
    return (
        <Modal transparent visible animationType='none'>
            <BlurView intensity={20} style={{ flex: 1 }}>
                <MotiView
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', width: '100%' }}
                    from={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        type: 'timing',
                        duration: 150,
                    }}
                >
                    <ActivityIndicator color={color} />
                </MotiView>
            </BlurView>
        </Modal>
    )
}

export default OverlaySpinner