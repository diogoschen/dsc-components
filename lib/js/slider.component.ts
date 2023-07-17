import { ISliderElements } from "./slider.interface";

export const init = () => document.addEventListener('DOMContentLoaded', initSlidy);

function initSlidy() : void {
    

    class Slider {

        private slider: HTMLElement;
        private index: number;
        private nSlides: number;
        private nIndicators: number;
        private currentSlide: number = 0;

        private sliderElements: ISliderElements;

        constructor(slider: HTMLElement, index: number){
            this.slider = slider;
            this.index = index;

            this.onInit();
        }

        private onInit() {
            
            const sliderStage = this.slider.querySelector('.slidy-stage') as HTMLElement;

            if(!sliderStage) return 

            // records number of childs
            this.nSlides = sliderStage.childElementCount;
            
            this.slider.id = `slidy-${this.index}`;
            
            this.sliderElements = { slider: this.slider, sliderStage };

            this.initNavigationButtons();
            this.initNavigationIndicators();
            
        }

        private initNavigationIndicators(): void {

            const sliderIndicators = this.slider.querySelector('.slidy-indicators') as HTMLElement;

            if (!sliderIndicators) return 

            this.sliderElements = { ...this.sliderElements, sliderIndicators };
            
            this.handleIndicators();

            window.addEventListener('resize', () => this.handleIndicators());
        }

        private initNavigationButtons() : void {

            // add previous/next buttons events
            const sliderBtnNext = this.slider.querySelector('.slidy-next') as HTMLElement;
            const sliderBtnPrevious = this.slider.querySelector('.slidy-previous') as HTMLElement;

            if (!sliderBtnNext && !sliderBtnPrevious) return

            const sliderButtons = {};

            if(sliderBtnPrevious) {
                
                Object.assign(sliderButtons, {sliderBtnPrevious});
                sliderBtnPrevious.addEventListener('click', () => this.nextSlide(-1));
            }

            if(sliderBtnNext){

                Object.assign(sliderButtons, {sliderBtnNext});
                sliderBtnNext.addEventListener('click', () => this.nextSlide(1));

            }

            this.sliderElements = { ...this.sliderElements, sliderButtons}
        }

        private nextSlide(direction: number){
                        
            if (!this.sliderElements) return 

            const { slider, sliderStage } = this.sliderElements;
            const currentSlide = this.currentSlide;
            const nSlides = this.nSlides;

            let nSlidesVisible = ((slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth);
            nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
            let index = currentSlide + direction * nSlidesVisible >= nSlides ? currentSlide : currentSlide + direction * nSlidesVisible;
            index = index < 0 ? 0 : index;
            
            this.handleActiveIndicators(index);
            this.goToSlide(index);

            this.currentSlide = index;
        }

        private handleIndicators(){

            if (!this.sliderElements) return 
            
            const { slider, sliderStage, sliderIndicators } = this.sliderElements;


            // get the number of indicators according to the number of items visible
            let nSlidesVisible = (slider.clientWidth - slider.clientWidth % sliderStage.children[0].clientWidth) / sliderStage.children[0].clientWidth;
            nSlidesVisible = nSlidesVisible < 1 ? 1 : nSlidesVisible;
            const nIndicators = Math.floor(this.nSlides / nSlidesVisible);

            if (sliderIndicators && nIndicators !== this.nIndicators) {

                this.nIndicators = nIndicators;
                this.currentSlide = this.currentSlide - this.currentSlide % nSlidesVisible;
                sliderIndicators.innerHTML = '';

                // adds the number of indicators according to the number of visible cards
                // adds event on click
                for (let i = 0; i < nIndicators; i++) { 
                    const temp = document.createElement('div');
                    temp.innerHTML = `
                        <button
                            type="button"
                            class="slidy-indicator slidy-indicator-${i * nSlidesVisible} ${i * nSlidesVisible === this.currentSlide ? 'active' : null} btn btn-indicator"
                            aria-label="Slide ${i * nSlidesVisible}">
                        </button>`;
                        
                        temp.children[0]!.addEventListener('click', () => {
                            
                            this.goToSlide(i * nSlidesVisible);
                            this.handleActiveIndicators(i * nSlidesVisible)
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

        private goToSlide(index: number) {
            
            if (!this.sliderElements) return 
            
            const { sliderStage } = this.sliderElements;
            
            const scrollAmount = sliderStage.children[0].clientWidth * index * 1.05;
            const scrollMax = sliderStage.scrollWidth - sliderStage.clientWidth * 1.05;
            sliderStage.scrollTo({left: scrollAmount, top: 0, behavior: "smooth"});
            
            this.currentSlide = index;
            
            if (scrollAmount >= scrollMax) return this.handleNavigationButtonsState('end');
            if (scrollAmount === 0) return this.handleNavigationButtonsState('start');
        }

        private handleNavigationButtonsState(point?: string) {
            if (!this.sliderElements) return
            
            const { sliderButtons } = this.sliderElements;
            
            if (!sliderButtons) return

            const sliderBtnNext = sliderButtons.sliderBtnNext as HTMLButtonElement;
            const sliderBtnPrevious = sliderButtons.sliderBtnPrevious as HTMLButtonElement;
            
            sliderBtnNext.disabled = false;
            sliderBtnPrevious.disabled = false;

            if (point === 'end') return sliderBtnNext.disabled = true;
            if (point === 'start') return sliderBtnPrevious.disabled = true;
            
        }
        
    }

    const sliders = [...document.querySelectorAll('.slidy')] as HTMLElement[];
    
    sliders.forEach((slide: HTMLElement, i: number) => {
        new Slider(slide, i);
    });

}

export default { init }