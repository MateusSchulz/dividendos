import { Component, OnInit } from '@angular/core'
import { listStocks } from 'src/config/listStocks'
import { IStocks } from './models/stocks.model'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  stocks: IStocks[]

  ngOnInit() {
    this.stocks = []
    listStocks.forEach((value: string) => {
      this.readFile(value)
    })
  }

  readFile (stock: string) {
    const file = new XMLHttpRequest()
    file.open("GET", `assets/stocks/${stock}.txt`, true)
    file.onreadystatechange = () => {
      if(!(file.readyState === 4 && (file.status === 200 || file.status == 0))) return

      const parser = new DOMParser()
      const document = parser.parseFromString(file.response, 'text/html')

      const tbodyElements = document.querySelector('.normal-table tbody')
      if (!tbodyElements) return console.warn('Error: ', stock)
      const typeElements = tbodyElements.querySelectorAll('tr td:nth-child(1)')
      const dateElements = tbodyElements.querySelectorAll('tr td:nth-child(4)')
      const valueElements = tbodyElements.querySelectorAll('tr td:nth-child(5)')

      const types: string[] = []
      const dates: string[] = []
      const values: string[] = []

      const populeArrays = (element: Element, array: string[]) => element?.innerHTML && array.push(element.innerHTML)

      typeElements.forEach(element => populeArrays(element, types))
      dateElements.forEach(element => populeArrays(element, dates))
      valueElements.forEach(element => populeArrays(element, values))

      const valuesNumber = values.map(value => Number(value.replace(',', '.')))

      this.calculateDividends({ dates, values: valuesNumber, stock })

    }
    file.send()
  }

  calculateDividends({ dates, values, stock }: { dates: string[], values: number[], stock: string }) {

    const year2018 = this.populeYearsDividends({ dates, values, year: '2018' })
    const year2019 = this.populeYearsDividends({ dates, values, year: '2019' })
    const year2020 = this.populeYearsDividends({ dates, values, year: '2020' })
    const year2021 = this.populeYearsDividends({ dates, values, year: '2021' })
    const year2022 = this.populeYearsDividends({ dates, values, year: '2022' })
    const yearDividends = [year2018, year2019, year2020, year2021, year2022]
    const totalYearDividends = this.getTotalDividends(yearDividends)
    const countYearDividends = yearDividends.filter(yearDividend => !!yearDividend).length
    const average = totalYearDividends / countYearDividends

    const result = {
      2018: year2018,
      2019: year2019,
      2020: year2020,
      2021: year2021,
      2022: year2022,
      total: totalYearDividends,
      average: average,
      name: stock
    }

    this.stocks.push(result)
  }

  populeYearsDividends ({ dates, values, year }: { dates: string[], values: number[], year: string }) {
    const dateValues = dates.map((date, index) => date.substring(6) === year ? values[index] : 0)
    const somar = (a: number, b: number) => a + b
    return dateValues.reduce(somar)
  }

  getTotalDividends (dividends: number[]) {
    return dividends.reduce((previous, current) => previous + current)
  }

  sortBy (prop: string) {
    return this.stocks.sort((a, b) => a[prop] > b[prop] ? -1 : a[prop] === b[prop] ? 0 : 1)
  }

  trackById (index: number) {
    return index
  }
}
