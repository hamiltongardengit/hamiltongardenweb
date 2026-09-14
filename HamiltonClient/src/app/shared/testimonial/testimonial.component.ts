import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.css']
})
export class TestimonialComponent implements OnInit {
  testimonials = [
    { name: "Sneha Kapoor", review: "Fantastic service and attention to detail! The team truly knows how to craft amazing travel experiences.", rating: 5 },
    { name: "Ananya Nair", review: "From start to finish, this was the best travel experience I’ve had. Highly recommended!", rating: 5 },
    { name: "Vikram Rao", review: "The entire trip was well-organized, and the guides were knowledgeable and friendly.", rating: 5 },
    { name: "Nisha Verma", review: "Every detail was perfect. The team at Hamilton Garden Inn & Suites truly made my trip unforgettable.", rating: 5 },
    { name: "Ishaan Khanna", review: "The trip exceeded all my expectations! I will be recommending this agency to everyone I know.", rating: 5 },
    { name: "Aman Kapoor", review: "This travel agency knows how to make every moment special. The experience was flawless!", rating: 5 },
  ];

  constructor() { }

  ngOnInit() {
  }

  generateStars(rating: number): Array<number> {
    return Array(rating).fill(0);
  }

}
