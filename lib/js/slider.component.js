var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const init = (options) => document.addEventListener('DOMContentLoaded', () => initSlidy(options));
function initSlidy(options) {
    class Slider {
        constructor(slider, index, options) {
            this.SWIPPER_THRESHOLD = 1;
            this.isMoving = false;
            this.nSlides = 0;
            this.currentSlide = 0;
            this.nSlidesVisible = 0;
            this.isResizing = false;
            this.sliderIsVisible = false;
            this.options = {
                indicatorsAsButtons: true,
                animationDuration: 0
            };
            this.slider = slider;
            this.index = index;
            this.options = Object.assign(Object.assign({}, this.options), options);
            this.onInit();
        }
        onInit() {
            return __awaiter(this, void 0, void 0, function* () {
                const sliderStage = this.slider.querySelector('.slidy-stage');
                const mutationObserver = new MutationObserver(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.delay(500);
                    this.restart(sliderStage);
                }));
                mutationObserver.observe(sliderStage, { childList: true, subtree: true });
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
                let options = {
                    root: document,
                    rootMargin: "0px",
                    threshold: .5,
                };
                let observer = new IntersectionObserver(e => {
                    e.forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                        this.initSlidesObserver(entry.isIntersecting);
                        this.sliderIsVisible = entry.isIntersecting;
                        if (entry.isIntersecting) {
                            yield this.updateNumberVisibleSlides();
                            this.handleIndicators();
                        }
                    }));
                    // observer.disconnect();
                }, options);
                observer.observe(this.slider);
            });
        }
        restart(sliderStage) {
            return __awaiter(this, void 0, void 0, function* () {
                // records number of childs
                this.nSlides = sliderStage.childElementCount;
                const slides = [...sliderStage.children].map((c, i) => {
                    const el = c;
                    el.dataset.id = `${i}`;
                    return el;
                });
                this.slider.id = `slidy-${this.index}`;
                this.sliderElements = { slider: this.slider, sliderStage, slides };
                this.initNavigationButtons(true);
                yield this.updateNumberVisibleSlides();
                this.initNavigationIndicators();
                let options = {
                    root: document,
                    rootMargin: "0px",
                    threshold: .5,
                };
                let observer = new IntersectionObserver(e => {
                    e.forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                        this.initSlidesObserver(entry.isIntersecting);
                        this.sliderIsVisible = entry.isIntersecting;
                        if (entry.isIntersecting) {
                            yield this.updateNumberVisibleSlides();
                            this.handleIndicators();
                        }
                    }));
                }, options);
                observer.observe(this.slider);
            });
        }
        toggleActiveClass(element, isIntersecting) {
            if (this.isResizing || !element)
                return;
            if (isIntersecting) {
                element.classList.add("slidy-active");
                element.ariaCurrent = "true";
                element.ariaHidden = "false";
                element.ariaDisabled = "false";
                [...element.querySelectorAll("a, button")].map(p => p.setAttribute("tabIndex", "0"));
            }
            else {
                element.classList.remove("slidy-active");
                element.ariaCurrent = "false";
                element.ariaHidden = "true";
                element.ariaDisabled = "true";
                [...element.querySelectorAll("a, button")].map(p => p.setAttribute("tabIndex", "-1"));
            }
        }
        updateNumberVisibleSlides() {
            const observeElements = (resolve) => {
                if (!this.sliderElements)
                    return;
                const { slides, sliderStage } = this.sliderElements;
                let options = {
                    root: sliderStage,
                    rootMargin: "0px",
                    threshold: this.SWIPPER_THRESHOLD,
                };
                let observer = new IntersectionObserver(e => {
                    this.nSlidesVisible = 0;
                    e.forEach(entry => {
                        if (!entry.isIntersecting)
                            return;
                        this.nSlidesVisible += 1;
                    });
                    observer.disconnect();
                    resolve();
                }, options);
                slides.forEach((s) => {
                    observer.observe(s);
                });
            };
            return new Promise((resolve, _) => {
                observeElements(resolve);
            });
        }
        initSlidesObserver(connect) {
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
                    this.toggleActiveClass(entry.target, entry.isIntersecting);
                    if (!entry.isIntersecting || !sliderIndicators || this.isMoving || this.isResizing)
                        return;
                    const id = Number((_b = (_a = entry.target) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.id);
                    const hasIndicator = sliderIndicators.querySelector(`.slidy-indicator-${id}`);
                    if (hasIndicator) {
                        this.handleActiveIndicators(id);
                    }
                    if (id === this.nSlides - 1) {
                        this.handleNavigationButtonsState("end");
                    }
                    if (id === 0) {
                        this.handleNavigationButtonsState("start");
                    }
                });
            }, options);
            if (connect) {
                slides.forEach((s, i) => {
                    observer.observe(s);
                });
            }
            else {
                observer.disconnect();
            }
        }
        delay(time) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, _) => setTimeout(() => resolve(true), time));
            });
        }
        initNavigationIndicators() {
            const sliderIndicators = this.slider.querySelector('.slidy-indicators');
            if (!sliderIndicators)
                return;
            this.sliderElements = Object.assign(Object.assign({}, this.sliderElements), { sliderIndicators });
            this.handleIndicators();
            window.addEventListener('resize', () => __awaiter(this, void 0, void 0, function* () {
                this.isResizing = true;
                if (!this.sliderIsVisible) {
                    this.isResizing = false;
                    return;
                }
                yield this.updateNumberVisibleSlides();
                this.handleIndicators();
                this.isResizing = false;
            }));
        }
        initNavigationButtons(restart) {
            var _a, _b;
            // add previous/next buttons events
            let sliderBtnNext = this.slider.querySelector('.slidy-next');
            let sliderBtnPrevious = this.slider.querySelector('.slidy-previous');
            if (restart) {
                const newNext = sliderBtnNext.cloneNode(true);
                const newPrevious = sliderBtnPrevious.cloneNode(true);
                (_a = sliderBtnNext.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(newNext, sliderBtnNext);
                (_b = sliderBtnPrevious.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(newPrevious, sliderBtnPrevious);
                sliderBtnNext = newNext;
                sliderBtnPrevious = newPrevious;
            }
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
            const { sliderIndicators } = this.sliderElements;
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
                    if (this.options.indicatorsAsButtons) {
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
                    }
                    else {
                        temp.innerHTML = `
                            <div
                                class="slidy-indicator slidy-indicator-${id} ${id === this.currentSlide ? 'active ' : ''}btn btn-indicator">
                            </div>`;
                    }
                    sliderIndicators.append(temp.children[0]);
                    temp.remove();
                }
                // this.handleEventIndicators(sliderElements);
                // moves to slide after resizing
                const regexMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
                if (this.isResizing && !regexMobile.test(navigator === null || navigator === void 0 ? void 0 : navigator.userAgent)) {
                    this.goToSlide(this.currentSlide);
                }
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
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                this.isMoving = true;
                if (!this.sliderElements)
                    return;
                const { sliderStage } = this.sliderElements;
                const currentSlide = sliderStage.children[index];
                const previousSlide = sliderStage.children[this.currentSlide];
                this.toggleActiveClass(previousSlide, false);
                yield this.delay((_a = this.options.animationDuration) !== null && _a !== void 0 ? _a : 0);
                currentSlide.scrollIntoView({ inline: 'start', block: 'nearest' });
                this.toggleActiveClass(currentSlide, true);
                let gap = ((_b = sliderStage.children[index - 1]) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect().left) - ((_c = sliderStage.children[index]) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect().left) + ((_d = sliderStage.children[index - 1]) === null || _d === void 0 ? void 0 : _d.clientWidth);
                gap = gap ? Math.abs(gap) : 0;
                let point;
                this.currentSlide = index;
                yield this.delay((_e = this.options.animationDuration) !== null && _e !== void 0 ? _e : 0);
                if (Math.round(sliderStage.scrollLeft + currentSlide.clientWidth + gap) + 2 >= sliderStage.scrollWidth)
                    point = 'end';
                if (sliderStage.scrollLeft === 0)
                    point = 'start';
                this.handleNavigationButtonsState(point);
                this.isMoving = false;
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
            if (sliderBtnNext) {
                sliderBtnNext.disabled = point === "end" ? true : false;
                sliderBtnNext.ariaDisabled = point === "end" ? "true" : "false";
            }
            if (sliderBtnPrevious) {
                sliderBtnPrevious.disabled = point === "start" ? true : false;
                sliderBtnPrevious.ariaDisabled = point === "start" ? "true" : "false";
            }
        }
    }
    const sliders = [...document.querySelectorAll('.slidy')];
    sliders.forEach((slide, i) => {
        var _a;
        let sliderOptions;
        if (Array.isArray(options)) {
            sliderOptions = (_a = options.find(op => (op === null || op === void 0 ? void 0 : op.id) === i)) !== null && _a !== void 0 ? _a : {};
        }
        else {
            sliderOptions = (options === null || options === void 0 ? void 0 : options.id) === i ? options : {};
        }
        new Slider(slide, i, sliderOptions);
    });
}
export default { init };
