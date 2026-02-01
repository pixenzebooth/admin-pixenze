import { useState, useRef, useCallback, useEffect } from 'react';
import { captureVideoFrame } from '../utils/imageUtils';

export const usePhotoBooth = () => {
    const [status, setStatus] = useState('idle'); // idle, countdown, capturing, processing, finished
    const [countdown, setCountdown] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [config, setConfig] = useState({ totalPhotos: 3, filter: 'none', theme: 'pink' });

    const videoRef = useRef(null);

    const startSession = useCallback((newConfig) => {
        if (newConfig) setConfig(prev => ({ ...prev, ...newConfig }));
        setPhotos([]);
        setCountdown(3);
        setStatus('countdown');
    }, []);

    // Countdown Logic
    useEffect(() => {
        let timer;
        if (status === 'countdown' && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (status === 'countdown' && countdown === 0) {
            capture();
        }
        return () => clearTimeout(timer);
    }, [status, countdown]);

    const capture = useCallback(() => {
        setStatus('capturing');
        setTimeout(() => { // Small delay to let UI show 'Cheese'
            if (videoRef.current) {
                const photo = captureVideoFrame(videoRef.current, config.filter);
                if (photo) {
                    setPhotos(prev => {
                        const newPhotos = [...prev, photo];
                        if (newPhotos.length >= config.totalPhotos) {
                            setStatus('finished');
                        } else {
                            // Prepare for next photo
                            setTimeout(() => {
                                setCountdown(3);
                                setStatus('countdown');
                            }, 1000);
                        }
                        return newPhotos;
                    });
                } else {
                    // Failed to capture, retry or stop? Let's retry
                    setStatus('countdown');
                    setCountdown(3);
                }
            }
        }, 500);
    }, [config.totalPhotos, config.filter]);

    const reset = () => {
        setStatus('idle');
        setPhotos([]);
        setCountdown(0);
    };

    return {
        status,
        countdown,
        photos,
        setPhotos, // Expose setPhotos manually for uploads
        config,
        setConfig,
        startSession,
        reset,
        setStatus,
        setCountdown,
        videoRef
    };
};
