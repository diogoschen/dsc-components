var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const init = () => document.addEventListener('DOMContentLoaded', initSlidy);
function initSlidy() {
    class Slider {
        constructor(slider, index) {
            this.SWIPPER_THRESHOLD = 1;
            this.currentSlide = 0;
            this.nSlidesVisible = 0;
            this.checkIndicators = true;
            this.slider = slider;
            this.index = index;
            this.onInit();
        }
        onInit() {
            return __awaiter(this, void 0, void 0, function* () {
                const sliderStage = this.slider.querySelector('.slidy-stage');
                if (!sliderStage)
                    return;
                // records number of childs
                this.nSlides = sliderStage.childElementCount;
                const slides = [...sliderStage.children].map((c, i) => {
                    const el = c;
                    el.dataset.id = `${i}`;
                    return el;
                });
                this.slider.id = `slidy-${this.index}`;
                this.sliderElements = { slider: this.slider, sliderStage, slides };
                this.initNavigationButtons();
                yield this.updateNumberVisibleSlides();
                this.initNavigationIndicators();
                this.initSlidesObserver();
            });
        }
        updateNumberVisibleSlides() {
            const observeElements = (resolve) => {
                if (!this.sliderElements)
                    return;
                const { slides, sliderStage } = this.sliderElements;
                this.nSlidesVisible = 0;
                let options = {
                    root: sliderStage,
                    rootMargin: "0px",
                    threshold: this.SWIPPER_THRESHOLD,
                };
                let observer = new IntersectionObserver(e => {
                    e.forEach(entry => {
                        if (!entry.isIntersecting)
                            return;
                        this.nSlidesVisible += 1;
                    });
                    resolve();
                    observer.disconnect();
                }, options);
                slides.forEach((s, i) => {
                    observer.observe(s);
                });
            };
            return new Promise((resolve, reject) => {
                observeElements(resolve);
            });
        }
        initSlidesObserver() {
            if (!this.sliderElements)
                return;
            const { slides, sliderStage, sliderIndicators } = this.sliderElements;
            let options = {
                root: sliderStage,
                rootMargin: "0px",
                threshold: this.SWIPPER_THRESHOLD - 0.01,
            };
            let observer = new IntersectionObserver(e => {
                e.forEach((entry) => {
                    var _a, _b;
                    if (!entry.isIntersecting || !sliderIndicators)
                        return;
                    const id = Number((_b = (_a = entry.target) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id);
                    const hasIndicator = sliderIndicators.querySelector(`.slidy-indicator-${id}`);
                    if (hasIndicator) {
                        this.handleActiveIndicators(id);
                        this.goToSlide(id);
                    }
                    if (id === this.nSlides - 1) {
                        this.handleNavigationButtonsState("end");
                    }
                    if (id === 0) {
                        this.handleNavigationButtonsState("start");
                    }
                });
            }, options);
            slides.forEach((s, i) => {
                observer.observe(s);
            });
        }
        delay(time) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, _) => setTimeout(() => resolve(true), time));
            });
        }
        isSmaller(slide) {
            return this.slider.clientWidth > slide.clientWidth * 1.05;
        }
        initNavigationIndicators() {
            const sliderIndicators = this.slider.querySelector('.slidy-indicators');
            if (!sliderIndicators)
                return;
            this.sliderElements = Object.assign(Object.assign({}, this.sliderElements), { sliderIndicators });
            this.handleIndicators();
            window.addEventListener('resize', () => __awaiter(this, void 0, void 0, function* () {
                yield this.updateNumberVisibleSlides();
                this.handleIndicators();
            }));
        }
        initNavigationButtons() {
            // add previous/next buttons events
            const sliderBtnNext = this.slider.querySelector('.slidy-next');
            const sliderBtnPrevious = this.slider.querySelector('.slidy-previous');
            if (!sliderBtnNext && !sliderBtnPrevious)
                return;
            const sliderButtons = {};
            if (sliderBtnPrevious) {
                Object.assign(sliderButtons, { sliderBtnPrevious });
                sliderBtnPrevious.addEventListener('click', () => this.nextSlide(-1));
            }
            if (sliderBtnNext) {
                Object.assign(sliderButtons, { sliderBtnNext });
                sliderBtnNext.addEventListener('click', () => this.nextSlide(1));
            }
            this.sliderElements = Object.assign(Object.assign({}, this.sliderElements), { sliderButtons });
        }
        getActiveIndex(direction) {
            const { slider, sliderStage } = this.sliderElements;
            const currentSlide = this.currentSlide;
            const nSlides = this.nSlides;
            let nSlidesVisible = this.nSlidesVisible;
            let index = currentSlide + direction * nSlidesVisible >= nSlides ? currentSlide : currentSlide + direction * nSlidesVisible;
            index = index < 0 ? 0 : index;
            return index;
        }
        nextSlide(direction) {
            if (!this.sliderElements)
                return;
            const index = this.getActiveIndex(direction);
            this.handleActiveIndicators(index);
            this.goToSlide(index);
            this.currentSlide = index;
        }
        handleIndicators() {
            if (!this.sliderElements)
                return;
            const { slider, sliderStage, sliderIndicators } = this.sliderElements;
            let nSlidesVisible = this.nSlidesVisible;
            if (sliderIndicators && nSlidesVisible > 0) {
                let nIndicators = Math.ceil(this.nSlides / nSlidesVisible);
                sliderIndicators.innerHTML = '';
                // adds the number of indicators according to the number of visible cards
                // adds event on click
                sliderIndicators.innerHTML = "";
                for (let i = 0; i < nIndicators; i++) {
                    if (nIndicators === 1)
                        break;
                    const temp = document.createElement('div');
                    const id = nSlidesVisible * i;
                    temp.innerHTML = `
                        <button
                            type="button"
                            class="slidy-indicator slidy-indicator-${id} ${id === this.currentSlide ? 'active ' : ''}btn btn-indicator"
                            aria-label="Slide ${id}">
                        </button>`;
                    temp.children[0].addEventListener('click', () => {
                        this.goToSlide(id);
                        this.handleActiveIndicators(id);
                    });
                    sliderIndicators.append(temp.children[0]);
                    temp.remove();
                }
                // this.handleEventIndicators(sliderElements);
                // moves to slide after resizing
                this.goToSlide(this.currentSlide);
            }
        }
        handleActiveIndicators(index) {
            var _a;
            if (!this.sliderElements)
                return;
            const { sliderIndicators } = this.sliderElements;
            sliderIndicators === null || sliderIndicators === void 0 ? void 0 : sliderIndicators.querySelectorAll('.slidy-indicator').forEach(btn => btn.classList.remove('active'));
            (_a = sliderIndicators === null || sliderIndicators === void 0 ? void 0 : sliderIndicators.querySelector(`.slidy-indicator-${index}`)) === null || _a === void 0 ? void 0 : _a.classList.add('active');
        }
        goToSlide(index) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.sliderElements)
                    return;
                const { sliderStage } = this.sliderElements;
                const currentSlide = sliderStage.children[index];
                currentSlide.scrollIntoView({ behavior: 'smooth', inline: 'start' });
                let gap = ((_a = sliderStage.children[index - 1]) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().left) - ((_b = sliderStage.children[index]) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect().left) + ((_c = sliderStage.children[index - 1]) === null || _c === void 0 ? void 0 : _c.clientWidth);
                gap = gap ? Math.abs(gap) : 0;
                let point;
                this.currentSlide = index;
                yield this.delay(1000);
                if (Math.round(sliderStage.scrollLeft + currentSlide.clientWidth + gap) + 2 >= sliderStage.scrollWidth)
                    point = 'end';
                if (sliderStage.scrollLeft === 0)
                    point = 'start';
                this.handleNavigationButtonsState(point);
            });
        }
        handleNavigationButtonsState(point) {
            if (!this.sliderElements)
                return;
            const { sliderButtons } = this.sliderElements;
            if (!sliderButtons)
                return;
            const sliderBtnNext = sliderButtons.sliderBtnNext;
            const sliderBtnPrevious = sliderButtons.sliderBtnPrevious;
            if (sliderBtnNext)
                sliderBtnNext.disabled = false;
            if (sliderBtnPrevious)
                sliderBtnPrevious.disabled = false;
            if (sliderBtnNext && point === 'end')
                return sliderBtnNext.disabled = true;
            if (sliderBtnPrevious && point === 'start')
                return sliderBtnPrevious.disabled = true;
        }
    }
    const sliders = [...document.querySelectorAll('.slidy')];
    sliders.forEach((slide, i) => {
        new Slider(slide, i);
    });
}
export default { init };
