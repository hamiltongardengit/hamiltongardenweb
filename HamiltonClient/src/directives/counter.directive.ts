import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appCounter]'
})
export class CounterDirective {
  @Input('appCounter') target: number = 0;
  @Input() speed: number = 3000;

  private hasCounted: boolean = false; // Track if the counter has already started

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.observeElement();
  }

  observeElement() {
    const element = this.el.nativeElement;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasCounted) {
            this.hasCounted = true;
            this.startCounter();
            observer.disconnect(); // Stop observing after the animation has started
          }
        });
      },
      {
        threshold: 0.1 // Adjust as needed, 0.1 means the element should be at least 10% visible
      }
    );

    observer.observe(element);
  }

  startCounter() {
    const element = this.el.nativeElement;
    let count = 0;
    const increment = this.target / (this.speed / 25);

    const updateCount = () => {
      count += increment;
      if (count < this.target) {
        element.innerText = Math.ceil(count).toString();
        setTimeout(updateCount, 15);
      } else {
        element.innerText = this.target.toString();
      }
    };

    updateCount();
  }
}
