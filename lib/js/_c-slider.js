export const init = () => document.addEventListener('DOMContentLoaded', initSlider);
const slidersList = [];
function initSlider() {
    slider();
}
function slider() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach((slide, i) => {
        startSlider(slide, i);
    });
}
function startSlider(slider, id) {
    const sliderStage = slider.querySelector('.slider-stage');
    const sliderIndicators = slider.querySelector('.slider-indicators');
    // records number of childs
    const nSlides = sliderStage.childElementCount;
    slidersList.push({ id: `slider-${id}`, currentIndex: 0, nSlides, nIndicators: 0 });
    slider.id = `slider-${id}`;
    // add previous/next buttons events
    const sliderBtnNext = slider.querySelector('#slider-next');
    const sliderBtnPrevious = slider.querySelector('#slider-previous');
    let sliderElements = { slider, sliderStage };
    if (sliderBtnNext && sliderBtnPrevious) {
        sliderElements = Object.assign(Object.assign({}, sliderElements), { sliderButtons: [sliderBtnPrevious, sliderBtnNext] });
        sliderBtnNext.addEventListener('click', () => nextSlide(sliderElements, 1));
        sliderBtnPrevious.addEventListener('click', () => nextSlide(sliderElements, -1));
    }
    if (sliderIndicators) {
        sliderElements = Object.assign(Object.assign({}, sliderElements), { sliderIndicators });
        handleIndicators(sliderElements);
        window.addEventListener('resize', () => handleIndicators(sliderElements));
    }
}
function handleIndicators(sliderElements) {
    const { slider, sliderStage, sliderIndicators } = sliderElements;
    // add indicators
    const sliderInfo = getSlider(slider.id);
    if (!sliderInfo)
        return false;
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
        for (let i = 0; i < nIndicators; i++) {
            sliderIndicators.innerHTML += `<button type="button" class="slider-indicator-${i * nSlidesVisible} ${i * nSlidesVisible === sliderInfo.currentIndex ? 'active' : null} btn btn-indicator" aria-label="go to slide ${i * nSlidesVisible}"></button>`;
        }
        handleEventIndicators(sliderElements);
        // moves to slide after resizing
        goToSlide(sliderElements, sliderInfo.currentIndex);
    }
}
function nextSlide(sliderElements, direction) {
    const { slider, sliderStage } = sliderElements;
    const sliderInfo = getSlider(slider.id);
    if (!sliderInfo)
        return false;
    const nSlides = sliderInfo.nSlides;
    let nSlidesVisible = ((slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth);
    nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
    let index = sliderInfo.currentIndex + direction * nSlidesVisible >= nSlides ? sliderInfo.currentIndex : sliderInfo.currentIndex + direction * nSlidesVisible;
    index = index < 0 ? 0 : index;
    handleActiveIndicators(sliderElements, index);
    goToSlide(sliderElements, index);
    sliderInfo.currentIndex = index;
}
function goToSlide(sliderElements, index) {
    const { sliderStage } = sliderElements;
    const scrollAmount = sliderStage.children[0].clientWidth * index * 1.05;
    const scrollMax = sliderStage.scrollWidth - sliderStage.clientWidth * 1.05;
    sliderStage.scrollTo(scrollAmount, 0);
    if (scrollAmount >= scrollMax)
        handleNavigationButtonsState(sliderElements, 'end');
    else if (scrollAmount === 0)
        handleNavigationButtonsState(sliderElements, 'start');
    else
        handleNavigationButtonsState(sliderElements);
}
function handleNavigationButtonsState(sliderElements, point) {
    if (!sliderElements.sliderButtons)
        return false;
    const sliderBtnNext = sliderElements.sliderButtons[1];
    const sliderBtnPrevious = sliderElements.sliderButtons[0];
    if (sliderBtnNext instanceof HTMLButtonElement && sliderBtnPrevious instanceof HTMLButtonElement) {
        sliderBtnNext.disabled = false;
        sliderBtnPrevious.disabled = false;
        if (point === 'end') {
            sliderBtnNext.disabled = true;
        }
        else if (point === 'start') {
            sliderBtnPrevious.disabled = true;
        }
    }
}
function getSlider(id) {
    return slidersList.find(slider => slider.id === id);
}
function handleActiveIndicators(sliderElements, index) {
    var _a;
    const { sliderIndicators } = sliderElements;
    sliderIndicators === null || sliderIndicators === void 0 ? void 0 : sliderIndicators.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    (_a = sliderIndicators === null || sliderIndicators === void 0 ? void 0 : sliderIndicators.querySelector(`.slider-indicator-${index}`)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
}
function handleEventIndicators(sliderElements) {
    const { slider, sliderStage, sliderIndicators } = sliderElements;
    const sliderButtons = sliderIndicators === null || sliderIndicators === void 0 ? void 0 : sliderIndicators.querySelectorAll('button');
    sliderButtons === null || sliderButtons === void 0 ? void 0 : sliderButtons.forEach((btn, btnIndex) => {
        btn.addEventListener('click', (e) => {
            if (e.target instanceof HTMLButtonElement) {
                const nSlides = getSlider(slider.id).nSlides;
                let nSlidesVisible = ((slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth);
                nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
                let index = btnIndex * nSlidesVisible >= nSlides ? btnIndex : btnIndex * nSlidesVisible;
                index = index < 0 ? 0 : index;
                goToSlide(sliderElements, index);
                handleActiveIndicators(sliderElements, index);
                const sliderInfo = getSlider(slider.id);
                if (sliderInfo)
                    sliderInfo.currentIndex = index;
            }
        });
    });
}
export default { init };
