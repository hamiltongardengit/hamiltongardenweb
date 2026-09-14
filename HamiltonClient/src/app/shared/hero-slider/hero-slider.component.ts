import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero-slider',
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('1s ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HeroSliderComponent {
  slides = [
    {
      image: 'assets/clientTemplate/img/slider/1.webp',
      subtitle: 'Explore Your Travel',
      title: 'Travelling Around The World',
      description: 'Embark on a journey like never before with Hamilton Garden Inn & Suites. Our curated travel experiences take you to some of the most breathtaking destinations across the globe.',
    },
    {
      image: 'assets/clientTemplate/img/slider/2.webp',
      subtitle: 'Luxury Travel Redefined',
      title: 'Explore Top Destinations',
      description: 'Travel in style and comfort with Hamilton Garden Inn & Suites. From exotic islands to vibrant cities, our tailored journeys ensure your ultimate satisfaction.',
    },
    {
      image: 'assets/clientTemplate/img/slider/3.webp',
      subtitle: 'Your Journey, Our Priority',
      title: 'Tailored Experiences Await',
      description: 'Let us craft a travel experience that aligns with your dreams. Explore breathtaking landscapes and indulge in the finest hospitality with us.',
    },
    {
      image: 'assets/clientTemplate/img/slider/4.webp',
      subtitle: 'Plan Your Perfect Getaway',
      title: 'Dream, Explore, Discover',
      description: 'Escape the ordinary and immerse yourself in extraordinary destinations. With Hamilton Garden Inn & Suites, your perfect vacation is just a click away.',
    },
    {
      image: 'assets/clientTemplate/img/slider/5.webp',
      subtitle: 'Unmatched Hospitality Awaits',
      title: 'Explore, Relax, Repeat',
      description: 'From serene escapes to thrilling expeditions, Hamilton Garden Inn & Suites curates experiences that redefine travel. Relax and let us take care of the rest.',
    },
    {
      image: 'assets/clientTemplate/img/slider/6.webp',
      subtitle: 'Unmatched Hospitality Awaits',
      title: 'Explore, Relax, Repeat',
      description: 'Explore breathtaking landscapes and indulge in the finest hospitality with us. Relax and let us take care of the rest.',
    },
  ];
  currentSlide = 0;

  ngOnInit(): void {
    setInterval(() => this.nextSlide(), 10000); // Changes every 5 seconds
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

}
