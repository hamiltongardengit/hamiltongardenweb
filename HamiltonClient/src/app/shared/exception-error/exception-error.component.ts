import { Component, Input, OnInit } from '@angular/core';
import { ExceptionService } from '../../../services/exception.service';

@Component({
  selector: 'app-exception-error',
  templateUrl: './exception-error.component.html',
  styleUrls: ['./exception-error.component.css']
})
export class ExceptionErrorComponent implements OnInit {
  @Input() message: string = '';
  
  constructor(private exceptionService: ExceptionService) { }

  ngOnInit() {
  }

  closeNotification() {
    this.exceptionService.clearNotification();
  }

}
