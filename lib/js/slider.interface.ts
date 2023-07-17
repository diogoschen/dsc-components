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
    sliderButtons?: {
        sliderBtnPrevious?: HTMLElement,
        sliderBtnNext?: HTMLElement
    }
}