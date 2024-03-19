export interface ISlider { 
    id: string,
    currentIndex: number,
    nSlides: number,
    nIndicators: number
}

export interface ISliderElements {
    slider: HTMLElement,
    sliderStage: HTMLElement,
    sliderIndicators?: HTMLElement,
    slides: HTMLElement[],
    sliderButtons?: {
        sliderBtnPrevious?: HTMLElement,
        sliderBtnNext?: HTMLElement
    }
}

export interface ISliderOptions {
    id?: number;
    indicatorsAsButtons?: boolean;
    animationDuration?: number;
}