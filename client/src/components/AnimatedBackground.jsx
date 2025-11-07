import { motion } from 'framer-motion';

const gradientVariants = {
    animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
            duration: 18,
            ease: 'linear',
            repeat: Infinity,
        },
    },
};

const orbVariants = {
    animate: {
        x: ['-5%', '5%', '-5%'],
        y: ['-5%', '5%', '-5%'],
        rotate: [0, 15, 0],
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <motion.div
                className="absolute inset-0 opacity-90 dark:opacity-60"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 55%),' +
                        'radial-gradient(circle at bottom right, rgba(14,165,233,0.25), transparent 45%),' +
                        'linear-gradient(120deg, rgba(14, 165, 233, 0.15), rgba(192, 132, 252, 0.15), rgba(59,130,246,0.15))',
                    backgroundSize: '140% 140%',
                }}
                variants={gradientVariants}
                animate="animate"
            />

            <motion.div
                className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)',
                }}
                variants={orbVariants}
                animate="animate"
            />

            <motion.div
                className="absolute bottom-[-15%] left-[-10%] w-[36rem] h-[36rem] rounded-full blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(192,132,252,0.35) 0%, transparent 70%)',
                }}
                variants={orbVariants}
                animate="animate"
                transition={{ delay: 2 }}
            />
        </div>
    );
};

export default AnimatedBackground;

