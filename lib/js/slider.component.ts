import { ISliderElements } from "./slider.interface";

export const init = () => document.addEventListener('DOMContentLoaded', initSlidy);

function initSlidy(): void {


    class Slider {

        private readonly SWIPPER_THRESHOLD = 1;

        private slider: HTMLElement;
        private index: number;
        private nSlides: number;
        private nIndicators: number;
        private currentSlide: number = 0;
        private nSlidesVisible: number = 0;
        private checkIndicators: boolean = true;

        private sliderElements: ISliderElements;

        constructor(slider: HTMLElement, index: number) {
            this.slider = slider;
            this.index = index;

            this.onInit();
        }

        private async onInit() {

            const sliderStage = this.slider.querySelector('.slidy-stage') as HTMLElement;

            if (!sliderStage) return

            // records number of childs
            this.nSlides = sliderStage.childElementCount;
            const slides = [...sliderStage.children].map((c, i) => {
                const el = c as HTMLElement;
                el.dataset.id = `${i}`;
                return el
            });

            this.slider.id = `slidy-${this.index}`;

            this.sliderElements = { slider: this.slider, sliderStage, slides };

            this.initNavigationButtons();
            await this.updateNumberVisibleSlides();
            this.initNavigationIndicators();
            this.initSlidesObserver();
        }

        private updateNumberVisibleSlides(): Promise<void> {

            const observeElements = (resolve) => {

                if (!this.sliderElements) return

                const { slides, sliderStage } = this.sliderElements;
                this.nSlidesVisible = 0;
                let options = {
                    root: sliderStage,
                    rootMargin: "0px",
                    threshold: this.SWIPPER_THRESHOLD,
                };
                let observer = new IntersectionObserver(e => {
                    e.forEach(entry => {

                        if (!entry.isIntersecting) return;
                        this.nSlidesVisible += 1;
                    })

                    resolve();
                    observer.disconnect();
                }, options);
                slides.forEach((s, i) => {
                    observer.observe(s)
                });
            }

            return new Promise((resolve, reject) => {
                observeElements(resolve)
            })

        }

        private initSlidesObserver() {

            if (!this.sliderElements) return

            const { slides, sliderStage, sliderIndicators } = this.sliderElements;

            let options = {
                root: sliderStage,
                rootMargin: "0px",
                threshold: this.SWIPPER_THRESHOLD-0.01,
            };

            let observer = new IntersectionObserver(e => {
                e.forEach((entry) => {
                    if (!entry.isIntersecting || !sliderIndicators) return;
                    const id = Number((entry.target as HTMLElement)?.dataset?.id);
                    const hasIndicator = sliderIndicators.querySelector(`.slidy-indicator-${id}`);

                    if(hasIndicator) {
                        this.handleActiveIndicators(id);
                        this.goToSlide(id);
                    }
                    if(id === this.nSlides - 1){
                        this.handleNavigationButtonsState("end");
                    }
                    if(id === 0){
                        this.handleNavigationButtonsState("start");
                    }

                });
            }, options);

            slides.forEach((s, i) => {
                observer.observe(s)
            });

        }

        private async delay(time: number) {

            return new Promise((resolve, _) => setTimeout(() => resolve(true), time))
        }

        private isSmaller(slide: HTMLElement) {

            return this.slider.clientWidth > slide.clientWidth * 1.05
        }

        private initNavigationIndicators(): void {

            const sliderIndicators = this.slider.querySelector('.slidy-indicators') as HTMLElement;

            if (!sliderIndicators) return

            this.sliderElements = { ...this.sliderElements, sliderIndicators };

            this.handleIndicators();

            window.addEventListener('resize', async () => {
                await this.updateNumberVisibleSlides();
                this.handleIndicators();
            });
        }

        private initNavigationButtons(): void {

            // add previous/next buttons events
            const sliderBtnNext = this.slider.querySelector('.slidy-next') as HTMLElement;
            const sliderBtnPrevious = this.slider.querySelector('.slidy-previous') as HTMLElement;

            if (!sliderBtnNext && !sliderBtnPrevious) return

            const sliderButtons = {};

            if (sliderBtnPrevious) {

                Object.assign(sliderButtons, { sliderBtnPrevious });
                sliderBtnPrevious.addEventListener('click', () => this.nextSlide(-1));
            }

            if (sliderBtnNext) {

                Object.assign(sliderButtons, { sliderBtnNext });
                sliderBtnNext.addEventListener('click', () => this.nextSlide(1));

            }

            this.sliderElements = { ...this.sliderElements, sliderButtons }
        }

        private getActiveIndex(direction: number): number {
            const { slider, sliderStage } = this.sliderElements;
            const currentSlide = this.currentSlide;
            const nSlides = this.nSlides;

            let nSlidesVisible = this.nSlidesVisible;
            let index = currentSlide + direction * nSlidesVisible >= nSlides ? currentSlide : currentSlide + direction * nSlidesVisible;
            index = index < 0 ? 0 : index;

            return index
        }

        private nextSlide(direction: number) {

            if (!this.sliderElements) return

            const index = this.getActiveIndex(direction);

            this.handleActiveIndicators(index);
            this.goToSlide(index);

            this.currentSlide = index;
        }

        private handleIndicators() {

            if (!this.sliderElements) return

            const { slider, sliderStage, sliderIndicators } = this.sliderElements;

            let nSlidesVisible = this.nSlidesVisible;

            if (sliderIndicators && nSlidesVisible > 0) {

                let nIndicators = Math.ceil(this.nSlides / nSlidesVisible);

                sliderIndicators.innerHTML = '';

                // adds the number of indicators according to the number of visible cards
                // adds event on click
                sliderIndicators.innerHTML = "";
                for (let i = 0; i < nIndicators; i++) {
                    if (nIndicators === 1) break;
                    const temp = document.createElement('div');
                    const id = nSlidesVisible * i;
                    temp.innerHTML = `
                        <button
                            type="button"
                            class="slidy-indicator slidy-indicator-${id} ${id === this.currentSlide ? 'active ' : ''}btn btn-indicator"
                            aria-label="Slide ${id}">
                        </button>`;

                    temp.children[0]!.addEventListener('click', () => {

                        this.goToSlide(id);
                        this.handleActiveIndicators(id)
                    })
                    sliderIndicators.append(temp.children[0]);
                    temp.remove();
                }

                // this.handleEventIndicators(sliderElements);
                // moves to slide after resizing
                this.goToSlide(this.currentSlide)
            }
        }

        private handleActiveIndicators(index: number) {

            if (!this.sliderElements) return

            const { sliderIndicators } = this.sliderElements;

            sliderIndicators?.querySelectorAll('.slidy-indicator')!.forEach(btn => btn.classList.remove('active'));
            sliderIndicators?.querySelector(`.slidy-indicator-${index}`)?.classList.add('active');
        }

        private async goToSlide(index: number) {

            if (!this.sliderElements) return

            const { sliderStage } = this.sliderElements;
            const currentSlide = sliderStage.children[index];
            currentSlide.scrollIntoView({ behavior: 'smooth', inline: 'start' });

            let gap = sliderStage.children[index - 1]?.getBoundingClientRect().left - sliderStage.children[index]?.getBoundingClientRect().left + sliderStage.children[index - 1]?.clientWidth;
            gap = gap ? Math.abs(gap) : 0;

            let point;
            this.currentSlide = index;

            await this.delay(1000);

            if (Math.round(sliderStage.scrollLeft + currentSlide.clientWidth + gap) + 2 >= sliderStage.scrollWidth) point = 'end';

            if (sliderStage.scrollLeft === 0) point = 'start';

            this.handleNavigationButtonsState(point);
        }

        private handleNavigationButtonsState(point?: string) {
            if (!this.sliderElements) return

            const { sliderButtons } = this.sliderElements;

            if (!sliderButtons) return

            const sliderBtnNext = sliderButtons.sliderBtnNext as HTMLButtonElement;
            const sliderBtnPrevious = sliderButtons.sliderBtnPrevious as HTMLButtonElement;

            if (sliderBtnNext) sliderBtnNext.disabled = false;
            if (sliderBtnPrevious) sliderBtnPrevious.disabled = false;

            if (sliderBtnNext && point === 'end') return sliderBtnNext.disabled = true;
            if (sliderBtnPrevious && point === 'start') return sliderBtnPrevious.disabled = true;

        }

    }

    const sliders = [...document.querySelectorAll('.slidy')] as HTMLElement[];

    sliders.forEach((slide: HTMLElement, i: number) => {
        new Slider(slide, i);
    });

}

export default { init }