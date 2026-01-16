import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Gauge, Cpu, CircuitBoard, Palette, Smartphone } from 'lucide-react';
import { t } from '../utils/i18n';

const TUTORIAL_STEPS = [
    {
        id: 'fps',
        icon: Gauge,
        iconColor: 'text-green-400',
        title: 'FPS em Tempo Real',
        titleEn: 'Real-time FPS',
        description: 'Este é seu contador de FPS. Mostra quantos frames por segundo seu jogo está rodando.',
        descriptionEn: 'This is your FPS counter. It shows how many frames per second your game is running.',
        highlight: 'fps-panel'
    },
    {
        id: 'hardware',
        icon: Cpu,
        iconColor: 'text-orange-400',
        title: 'Monitoramento de Hardware',
        titleEn: 'Hardware Monitoring',
        description: 'Acompanhe a temperatura e uso da CPU, GPU e RAM. Clique nos cards para renomear.',
        descriptionEn: 'Track CPU, GPU and RAM temperature and usage. Click on cards to rename.',
        highlight: 'cpu-panel'
    },
    {
        id: 'customization',
        icon: Palette,
        iconColor: 'text-purple-400',
        title: 'Personalização Total',
        titleEn: 'Total Customization',
        description: 'Escolha temas, fundos animados e cores individuais para cada componente.',
        descriptionEn: 'Choose themes, animated backgrounds and individual colors for each component.',
        highlight: null
    },
    {
        id: 'nav',
        icon: Smartphone,
        iconColor: 'text-blue-400',
        title: 'Menu de Navegação',
        titleEn: 'Navigation Menu',
        description: 'Toque na tela para abrir o menu. Acesse temas, alertas e muito mais!',
        descriptionEn: 'Tap the screen to open the menu. Access themes, alerts and more!',
        highlight: null
    },

];

export default function TutorialOverlay({ isOpen, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const StepIcon = step.icon;
    const isLast = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirst = currentStep === 0;

    const handleNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    // Get language (simplified detection)
    const lang = navigator.language?.startsWith('en') ? 'en' : 'pt';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/90" />

            {/* Tutorial Card */}
            <div className="relative z-10 mx-4 max-w-sm w-full">
                {/* Skip Button */}
                <button
                    onClick={handleSkip}
                    className="absolute -top-12 right-0 flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                >
                    <span className="text-sm">{t('skip') || 'Pular'}</span>
                    <X className="w-4 h-4" />
                </button>

                <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-800">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Icon */}
                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800 flex items-center justify-center ${step.iconColor}`}>
                            <StepIcon className="w-8 h-8" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {lang === 'en' ? step.titleEn : step.title}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-400 leading-relaxed">
                            {lang === 'en' ? step.descriptionEn : step.description}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-800">
                        {/* Previous Button */}
                        <button
                            onClick={handlePrev}
                            disabled={isFirst}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isFirst
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>{t('previous') || 'Anterior'}</span>
                        </button>

                        {/* Step Indicator */}
                        <div className="flex gap-1">
                            {TUTORIAL_STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentStep
                                        ? 'bg-blue-500'
                                        : index < currentStep
                                            ? 'bg-green-500'
                                            : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                        >
                            <span>{isLast ? (t('finish') || 'Concluir') : (t('next') || 'Próximo')}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
