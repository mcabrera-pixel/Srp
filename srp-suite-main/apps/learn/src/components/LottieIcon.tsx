import React from 'react';
import { Lottie } from '@remotion/lottie';
import {
    staticFile,
    continueRender,
    delayRender,
} from 'remotion';

interface LottieIconProps {
    /** URL remota o nombre de archivo en public/ */
    src: string;
    /** Tamaño en píxeles */
    size?: number;
    /** Velocidad de reproducción (1 = normal) */
    speed?: number;
    /** Opacidad */
    opacity?: number;
    /** Estilo adicional del contenedor */
    style?: React.CSSProperties;
}

export const LottieIcon: React.FC<LottieIconProps> = ({
    src,
    size = 300,
    speed = 1,
    opacity = 1,
    style,
}) => {
    const [animationData, setAnimationData] =
        React.useState<unknown>(null);
    const [handle] = React.useState(() => delayRender('Loading Lottie'));

    React.useEffect(() => {
        const url = src.startsWith('http') ? src : staticFile(`lottie/${src}`);

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                setAnimationData(data);
                continueRender(handle);
            })
            .catch((err) => {
                console.error('Error loading Lottie:', err);
                continueRender(handle);
            });
    }, [src, handle]);

    if (!animationData) {
        return null;
    }

    return (
        <div
            style={{
                width: size,
                height: size,
                opacity,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...style,
            }}
        >
            <Lottie
                animationData={animationData as any}
                style={{ width: size, height: size }}
                playbackRate={speed}
            />
        </div>
    );
};
