export const init = () => document.addEventListener('DOMContentLoaded', initSlider);

type Slider = { id: string, currentIndex: number, nSlides: number, nIndicators: number }
type SliderElements = { slider: Element, sliderStage: Element, sliderIndicators?: Element, sliderButtons?: Element[] }
const slidersList: Slider[] = [];

function initSlider() {
    slider();
}

function slider() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach((slide: Element, i: number) => {
        startSlider(slide, i);
    });
}

function startSlider(slider: Element, id: number) {
    const sliderStage = slider.querySelector('.slider-stage')!
    const sliderIndicators = slider.querySelector('.slider-indicators');

    // records number of childs
    const nSlides = sliderStage.childElementCount;
    slidersList.push({ id: `slider-${id}`, currentIndex: 0, nSlides, nIndicators: 0 });
    
    slider.id = `slider-${id}`;

    // add previous/next buttons events
    const sliderBtnNext = slider.querySelector('#slider-next');
    const sliderBtnPrevious = slider.querySelector('#slider-previous');
    let sliderElements: SliderElements = { slider, sliderStage }

    if (sliderBtnNext && sliderBtnPrevious) {
        sliderElements = { ...sliderElements, sliderButtons: [sliderBtnPrevious, sliderBtnNext] }
        sliderBtnNext.addEventListener('click', () => nextSlide(sliderElements, 1));
        sliderBtnPrevious.addEventListener('click', () => nextSlide(sliderElements, -1));
    }


    if (sliderIndicators) {
        sliderElements = { ...sliderElements, sliderIndicators }
        handleIndicators(sliderElements);
        window.addEventListener('resize', () => handleIndicators(sliderElements))
    }
}

function handleIndicators(sliderElements: SliderElements) {

    const { slider, sliderStage, sliderIndicators } = sliderElements;
    // add indicators
    const sliderInfo = getSlider(slider.id);
    if (!sliderInfo) return false

    const nSlides = sliderStage.childElementCount;
    // get the number of indicators according to the number of items visible
    let nSlidesVisible = (slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth;
    nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
    const nIndicators = Math.ceil(nSlides / nSlidesVisible);

    if (sliderIndicators && nIndicators !== sliderInfo.nIndicators) {
        sliderInfo.nIndicators = nIndicators;
        sliderInfo.currentIndex = sliderInfo.currentIndex - sliderInfo.currentIndex % nSlidesVisible;
        sliderIndicators.innerHTML = '';
        // adds the number of indicators according to the number of visible cards
        for (let i = 0; i < nIndicators; i++) { sliderIndicators.innerHTML += `<button type="button" class="slider-indicator-${i * nSlidesVisible} ${i * nSlidesVisible === sliderInfo.currentIndex ? 'active' : null} btn btn-indicator" aria-label="go to slide ${i * nSlidesVisible}"></button>` }
        handleEventIndicators(sliderElements);
        // moves to slide after resizing
        goToSlide(sliderElements, sliderInfo.currentIndex)
    }
}

function nextSlide(sliderElements: SliderElements, direction: number) {
    const { slider, sliderStage } = sliderElements;
    const sliderInfo = getSlider(slider.id);
    if (!sliderInfo) return false

    const nSlides = sliderInfo.nSlides;

    let nSlidesVisible = ((slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth);
    nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
    let index = sliderInfo.currentIndex + direction * nSlidesVisible >= nSlides ? sliderInfo.currentIndex : sliderInfo.currentIndex + direction * nSlidesVisible;
    index = index < 0 ? 0 : index;

    handleActiveIndicators(sliderElements, index);
    goToSlide(sliderElements, index);

    sliderInfo.currentIndex = index;
}

function goToSlide(sliderElements: SliderElements, index: number) {
    const { sliderStage } = sliderElements;

    const scrollAmount = sliderStage.children[0].clientWidth * index * 1.05;
    const scrollMax = sliderStage.scrollWidth - sliderStage.clientWidth * 1.05;
    sliderStage.scrollTo(scrollAmount, 0);
    if (scrollAmount >= scrollMax) handleNavigationButtonsState(sliderElements, 'end');
    else if (scrollAmount === 0) handleNavigationButtonsState(sliderElements, 'start');
    else handleNavigationButtonsState(sliderElements)
}

function handleNavigationButtonsState(sliderElements: SliderElements, point?: string) {
    if (!sliderElements.sliderButtons) return false
    const sliderBtnNext = sliderElements.sliderButtons[1];
    const sliderBtnPrevious = sliderElements.sliderButtons[0];
    if (sliderBtnNext instanceof HTMLButtonElement && sliderBtnPrevious instanceof HTMLButtonElement) {
        sliderBtnNext.disabled = false;
        sliderBtnPrevious.disabled = false;
        if (point === 'end') {
            sliderBtnNext.disabled = true
        } else if (point === 'start') {
            sliderBtnPrevious.disabled = true;
        }
    }
}

function getSlider(id: string) {
    return slidersList.find(slider => slider.id === id)
}

function handleActiveIndicators(sliderElements: SliderElements, index: number) {
    const { sliderIndicators } = sliderElements;
    sliderIndicators?.querySelectorAll('button')!.forEach(btn => btn.classList.remove('active'));
    sliderIndicators?.querySelector(`.slider-indicator-${index}`)?.classList.add('active');
}

function handleEventIndicators(sliderElements: SliderElements) {
    const { slider, sliderStage, sliderIndicators } = sliderElements;
    const sliderButtons = sliderIndicators?.querySelectorAll('button')
    sliderButtons?.forEach((btn, btnIndex) => {
        btn.addEventListener('click', (e: Event) => {
            if (e.target instanceof HTMLButtonElement) {

                const nSlides = getSlider(slider.id)!.nSlides;
                let nSlidesVisible = ((slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth);
                nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
                let index = btnIndex * nSlidesVisible >= nSlides ? btnIndex : btnIndex * nSlidesVisible;
                index = index < 0 ? 0 : index;

                goToSlide(sliderElements, index);
                handleActiveIndicators(sliderElements, index)
                const sliderInfo = getSlider(slider.id);
                if (sliderInfo) sliderInfo.currentIndex = index;
            }
        })
    })
}


export default { init }