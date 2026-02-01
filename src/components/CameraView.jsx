import React, { useEffect } from 'react';
import { useCamera } from '../hooks/useCamera';
import { Camera, AlertCircle } from 'lucide-react';

const CameraView = ({ onReady }) => {
    const { videoRef, stream, error, startCamera } = useCamera();

    useEffect(() => {
        startCamera();
    }, []);

    useEffect(() => {
        if (stream && onReady) {
            onReady(videoRef);
        }
    }, [stream, onReady, videoRef]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-brand-pink/20 rounded-2xl h-96">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold font-fredoka text-gray-800">Oh snap!</h3>
                <p className="text-center text-gray-600">We can't access your camera. Please check permissions.</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-3xl shadow-xl border-4 border-white bg-black aspect-video">
            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                    <Camera className="animate-pulse mr-2" />
                    <span>Starting Camera...</span>
                </div>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
            />
        </div>
    );
};

export default CameraView;
