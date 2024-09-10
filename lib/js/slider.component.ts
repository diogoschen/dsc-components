import { ISliderElements, ISliderOptions } from "./slider.interface";

export const init = (options: ISliderOptions | ISliderOptions[]) => document.addEventListener('DOMContentLoaded', () => initSlidy(options));

function initSlidy(options: ISliderOptions | ISliderOptions[]): void {
    class Slider {

        private readonly SWIPPER_THRESHOLD = 1;
        private isMoving: boolean = false;
        private slider: HTMLElement;
        private index: number;
        private nSlides: number;
        private currentSlide: number = 0;
        private nSlidesVisible: number = 0;
        private isResizing: boolean = false;
        private sliderIsVisible: boolean;
        private options: ISliderOptions = {
            indicatorsAsButtons: true,
            animationDuration: 0
        };

        private sliderElements: ISliderElements;

        constructor(slider: HTMLElement, index: number, options: ISliderOptions) {
            this.slider = slider;
            this.index = index;
            this.options = { ...this.options, ...options };

            this.onInit();
        }

        private async onInit() {
            const sliderStage = this.slider.querySelector('.slidy-stage') as HTMLElement;
            const mutationObserver = new MutationObserver(async ()=>{
                await this.delay(500);
                this.restart(sliderStage);
            });
            mutationObserver.observe(sliderStage, {childList: true, subtree: true});

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

            let options = {
                root: document,
                rootMargin: "0px",
                threshold: .5,
            };

            let observer = new IntersectionObserver(e => {
                e.forEach(async (entry) => {
                    this.initSlidesObserver(entry.isIntersecting);
                    this.sliderIsVisible = entry.isIntersecting;

                    if (entry.isIntersecting) {

                        await this.updateNumberVisibleSlides();
                        this.handleIndicators();
                    }
                });
                observer.disconnect();
            }, options);

            observer.observe(this.slider);
        }

        private async restart(sliderStage: HTMLElement) {
             // records number of childs
             this.nSlides = sliderStage.childElementCount;
             const slides = [...sliderStage.children].map((c, i) => {
                 const el = c as HTMLElement;
                 el.dataset.id = `${i}`;
                 return el
             });
 
             this.slider.id = `slidy-${this.index}`;
 
             this.sliderElements = { slider: this.slider, sliderStage, slides };
 
             this.initNavigationButtons(true);
             await this.updateNumberVisibleSlides();
             this.initNavigationIndicators();
 
             let options = {
                 root: document,
                 rootMargin: "0px",
                 threshold: .5,
             };
 
             let observer = new IntersectionObserver(e => {
                 e.forEach(async (entry) => {
                     this.initSlidesObserver(entry.isIntersecting);
                     this.sliderIsVisible = entry.isIntersecting;
 
                     if (entry.isIntersecting) {
 
                         await this.updateNumberVisibleSlides();
                         this.handleIndicators();
                     }
                 });
             }, options);
 
             observer.observe(this.slider);
        }

        private toggleActiveClass(element: HTMLElement, isIntersecting: boolean) {
            if (this.isResizing || !element) return;

            if (isIntersecting) {
                element.classList.add("slidy-active");
                element.ariaCurrent = "true";
                element.ariaHidden = "false";
                element.ariaDisabled = "false";
                [...element.querySelectorAll("a, button")].map(p => p.setAttribute("tabIndex", "0"));
            } else {
                element.classList.remove("slidy-active");
                element.ariaCurrent = "false";
                element.ariaHidden = "true";
                element.ariaDisabled = "true";
                [...element.querySelectorAll("a, button")].map(p => p.setAttribute("tabIndex", "-1"));
            }
        }

        private updateNumberVisibleSlides(): Promise<void> {

            const observeElements = (resolve) => {

                if (!this.sliderElements) return

                const { slides, sliderStage } = this.sliderElements;
                let options = {
                    root: sliderStage,
                    rootMargin: "0px",
                    threshold: this.SWIPPER_THRESHOLD,
                };
                let observer = new IntersectionObserver(e => {
                    
                    this.nSlidesVisible = 0;
                    e.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        this.nSlidesVisible += 1;
                    })
                    
                    observer.disconnect();
                    resolve();
                }, options);
                
                slides.forEach((s) => {
                    observer.observe(s)
                });
            }

            return new Promise((resolve, _) => {
                observeElements(resolve)
            })

        }

        private initSlidesObserver(connect: boolean) {

            if (!this.sliderElements) return

            const { slides, sliderStage, sliderIndicators } = this.sliderElements;

            let options = {
                root: sliderStage,
                rootMargin: "0px",
                threshold: this.SWIPPER_THRESHOLD - 0.01,
            };

            let observer = new IntersectionObserver(e => {
                e.forEach((entry) => {

                    this.toggleActiveClass(entry.target as HTMLElement, entry.isIntersecting);

                    if (!entry.isIntersecting || !sliderIndicators || this.isMoving || this.isResizing) return;
                    const id = Number((entry.target as HTMLElement)?.dataset?.id);
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
                    observer.observe(s)
                });
            } else {
                observer.disconnect()
            }
        }

        private async delay(time: number) {

            return new Promise((resolve, _) => setTimeout(() => resolve(true), time))
        }

        private initNavigationIndicators(): void {

            const sliderIndicators = this.slider.querySelector('.slidy-indicators') as HTMLElement;

            if (!sliderIndicators) return

            this.sliderElements = { ...this.sliderElements, sliderIndicators };

            this.handleIndicators();

            window.addEventListener('resize', async () => {
                this.isResizing = true;
                if (!this.sliderIsVisible) {
                    this.isResizing = false;
                    return;
                }
                await this.updateNumberVisibleSlides();
                this.handleIndicators();
                this.isResizing = false;
            });
        }

        private initNavigationButtons(restart?: boolean): void {

            // add previous/next buttons events
            let sliderBtnNext = this.slider.querySelector('.slidy-next') as HTMLElement;
            let sliderBtnPrevious = this.slider.querySelector('.slidy-previous') as HTMLElement;

            if(restart){
                const newNext = sliderBtnNext.cloneNode(true);
                const newPrevious = sliderBtnPrevious.cloneNode(true);
                sliderBtnNext.parentNode?.replaceChild(newNext, sliderBtnNext);
                sliderBtnPrevious.parentNode?.replaceChild(newPrevious, sliderBtnPrevious);

                sliderBtnNext = newNext as  HTMLElement;
                sliderBtnPrevious = newPrevious as  HTMLElement;
            }

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

            const { sliderIndicators } = this.sliderElements;

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
                    if (this.options.indicatorsAsButtons) {
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
                    } else {
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
                if (this.isResizing) {

                    this.goToSlide(this.currentSlide)
                }
            }
        }

        private handleActiveIndicators(index: number) {

            if (!this.sliderElements) return

            const { sliderIndicators } = this.sliderElements;

            sliderIndicators?.querySelectorAll('.slidy-indicator')!.forEach(btn => btn.classList.remove('active'));
            sliderIndicators?.querySelector(`.slidy-indicator-${index}`)?.classList.add('active');
        }

        private async goToSlide(index: number) {

            this.isMoving = true;
            if (!this.sliderElements) return

            const { sliderStage } = this.sliderElements;
            const currentSlide = sliderStage.children[index] as HTMLElement;
            const previousSlide = sliderStage.children[this.currentSlide] as HTMLElement;

            this.toggleActiveClass(previousSlide, false);
            await this.delay(this.options.animationDuration ?? 0);

            currentSlide.scrollIntoView({ inline: 'start', block: 'nearest' });
            this.toggleActiveClass(currentSlide, true);

            let gap = sliderStage.children[index - 1]?.getBoundingClientRect().left - sliderStage.children[index]?.getBoundingClientRect().left + sliderStage.children[index - 1]?.clientWidth;
            gap = gap ? Math.abs(gap) : 0;

            let point;
            this.currentSlide = index;

            await this.delay(this.options.animationDuration ?? 0);

            if (Math.round(sliderStage.scrollLeft + currentSlide.clientWidth + gap) + 2 >= sliderStage.scrollWidth) point = 'end';

            if (sliderStage.scrollLeft === 0) point = 'start';

            this.handleNavigationButtonsState(point);
            this.isMoving = false;
        }

        private handleNavigationButtonsState(point?: string) {
            if (!this.sliderElements) return

            const { sliderButtons } = this.sliderElements;

            if (!sliderButtons) return

            const sliderBtnNext = sliderButtons.sliderBtnNext as HTMLButtonElement;
            const sliderBtnPrevious = sliderButtons.sliderBtnPrevious as HTMLButtonElement;

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

    const sliders = [...document.querySelectorAll('.slidy')] as HTMLElement[];

    sliders.forEach((slide: HTMLElement, i: number) => {
        let sliderOptions;
        if (Array.isArray(options)) {
            sliderOptions = options.find(op => op.id === i) ?? {};
        } else {
            sliderOptions = options.id === i ? options : {};
        }

        new Slider(slide, i, sliderOptions);
    });

}

export default { init }