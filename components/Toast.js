import { Image, StyleSheet, Text, View } from 'react-native';
import React, {
    useState,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withDelay,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, FONT_SIZES, SPACING, COLORS } from '../constants';
import { normalize } from '../utils';
import { MotiView } from 'moti';
import { IconButton } from 'react-native-paper';

const Toast = forwardRef(({ }, ref) => {
    const toastTopAnimation = useSharedValue(-100);
    const context = useSharedValue(0);
    const [showing, setShowing] = useState(false);
    const [toastData, setToastData] = useState({
        type: '',
        headerText: '',
        text: '',
        duration: ''
    })

    const insets = useSafeAreaInsets()
    
    const TOP_VALUE = SPACING.medium + insets.top //60//Platform.OS === 'ios' ? 60 : 20;
    useImperativeHandle(
        ref,
        () => ({
            show,
        }),
        [show],
    );

    const show = useCallback(
        ({ type, headerText, text, duration=3000 }) => {
            setShowing(true);
            setToastData({
                type,
                headerText,
                text,
                duration
            })
            toastTopAnimation.value = withSequence(
                withTiming(TOP_VALUE),
                withDelay(
                    duration,
                    withTiming(-100, null, finish => {
                        if (finish) {
                            runOnJS(setShowing)(false);
                        }
                    }),
                ),
            );
        },
        [TOP_VALUE, toastTopAnimation],
    );

    const hide = () => {
        toastTopAnimation.value = withTiming(-100, null, finish => {
            if (finish) {
                runOnJS(setShowing)(false);
            }
        });
    }

    const animatedTopStyles = useAnimatedStyle(() => {
        return {
            top: toastTopAnimation.value,
        };
    });

    const pan = Gesture.Pan()
        .onBegin(() => {
            context.value = toastTopAnimation.value;
        })
        .onUpdate(event => {
            if (event.translationY < 100) {
                toastTopAnimation.value = withSpring(
                    context.value + event.translationY,
                    {
                        damping: 600,
                        stiffness: 100,
                    },
                );
            }
        })
        .onEnd(event => {
            if (event.translationY < 0) {
                toastTopAnimation.value = withTiming(-100, null, finish => {
                    if (finish) {
                        runOnJS(setShowing)(false);
                    }
                });
            } else if (event.translationY > 0) {
                toastTopAnimation.value = withSequence(
                    withTiming(TOP_VALUE),
                    withDelay(
                        toastData.duration,
                        withTiming(-100, null, finish => {
                            if (finish) {
                                runOnJS(setShowing)(false);
                            }
                        }),
                    ),
                );
            }
        });

    return (
        <>
            {showing && (
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[
                            styles.toastContainer,
                            toastData.type === 'success'
                                ? styles.successToastContainer
                                : toastData.type === 'warning'
                                    ? styles.warningToastContainer
                                    : styles.errorToastContainer,
                            animatedTopStyles,
                        ]}>
                        <View
                            style={{ padding: 10, marginVertical: 5, marginLeft: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: toastData.type === 'success' ? '#e0f7e7' : toastData.type === 'warning' ? '#fef7ec' : '#fcd9df', borderRadius: 10 }}
                        >
                            <MotiView
                                from={toastData.type === 'success' ? {
                                    transform: [{ scale: 0 }]
                                } : undefined}
                                animate={toastData.type === 'success' ? {
                                    transform: [{ scale: 1 }],
                                } : undefined}
                                transition={toastData.type === 'success' ? {
                                    delay: 50,
                                } : undefined}
                            >
                                <Image
                                    source={
                                        toastData.type === 'success'
                                            ? require('../assets/SuccessIcon.png')
                                            : toastData.type === 'warning'
                                                ? require('../assets/WarningIcon.png')
                                                : require('../assets/ErrorIcon.png')
                                    }
                                    style={styles.toastIcon}
                                />
                            </MotiView>
                        </View>
                        <View style={{ flexDirection: 'column', justifyContent: 'center', paddingVertical: SPACING.xxx_small, paddingHorizontal: SPACING.x_small, flexShrink: 1 }}>
                            <Text style={styles.toastHeaderText}>{toastData.headerText}</Text>
                            <Text
                                numberOfLines={4}
                                style={[
                                    styles.toastText,
                                    toastData.type === 'success'
                                        ? styles.successToastText
                                        : toastData.type === 'warning'
                                            ? styles.warningToastText
                                            : styles.errorToastText,
                                ]}>
                                {toastData.text}
                            </Text>
                        </View>
                        <IconButton
                            style={{ alignSelf: 'center' }}
                            icon="close"
                            iconColor="#000"
                            size={15}
                            onPress={hide}
                        />
                    </Animated.View>
                </GestureDetector>
            )}
        </>
    );
});

export default Toast;

const styles = StyleSheet.create({
    toastContainer: {
        position: 'fixed',
        top: 0,
        maxWidth: '90%',
        //padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    toastHeaderText: {
        fontSize: FONT_SIZES.medium,
        fontFamily: FONTS.bold
    },
    toastText: {
        //marginLeft: SPACING.xx_small,
        fontSize: FONT_SIZES.medium,
        fontFamily: FONTS.medium
    },
    toastIcon: {
        width: normalize(25),
        height: normalize(25),
        resizeMode: 'contain',
    },
    successToastContainer: {
        //backgroundColor: '#def1d7',
        backgroundColor: '#FFF',
        borderColor: '#1f8722',
    },
    warningToastContainer: {
        backgroundColor: '#FFF',//backgroundColor: '#fef7ec',
        borderColor: '#f08135',
    },
    errorToastContainer: {
        backgroundColor: '#FFF',//backgroundColor: '#fae1db',
        borderColor: '#d9100a',
    },
    successToastText: {
        color: '#000'//'#1f8722',
    },
    warningToastText: {
        color: '#000'//color: '#f08135',
    },
    errorToastText: {
        color: '#000'//color: '#d9100a',
    },
});