import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'somar'
})
export class SomarPipe implements PipeTransform {

  transform (value: number, a: number) {
    console.log('transform')
    return value + a;
  }

}
