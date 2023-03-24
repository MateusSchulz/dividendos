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
      this.readDividendsFile(value)
    })
  }

  readDividendsFile (stock: string) {
    const file = new XMLHttpRequest()
    file.open("GET", `assets/stocks/${stock}-dividends.txt`, true)
    file.onreadystatechange = () => {
      if(!(file.readyState === 4 && (file.status === 200 || file.status === 0))) return

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
    const zeroDividends = yearDividends.find(yearDividend => !yearDividend)
    if (zeroDividends) return 
    const totalYearDividends = this.getTotalDividends(yearDividends)
    const average = totalYearDividends / 5

    const result = {
      2018: year2018,
      2019: year2019,
      2020: year2020,
      2021: year2021,
      2022: year2022,
      total: totalYearDividends,
      average: average,
      name: stock,
      price: null,
      dy: null,
      adjustedDY: null
    }

    this.readStockFile(result)
  }

  populeYearsDividends ({ dates, values, year }: { dates: string[], values: number[], year: string }) {
    const dateValues = dates.map((date, index) => date.substring(6) === year ? values[index] : 0)
    const somar = (a: number, b: number) => a + b
    return dateValues.reduce(somar)
  }

  getTotalDividends (dividends: number[]) {
    return dividends.reduce((previous, current) => previous + current)
  }

  readStockFile (stock: IStocks) {
    const file = new XMLHttpRequest()
    file.open("GET", `assets/stocks/${stock.name}.txt`, true)
    file.onreadystatechange = () => {
      if(!(file.readyState === 4 && (file.status === 200 || file.status === 0))) return

      const parser = new DOMParser()
      const document = parser.parseFromString(file.response, 'text/html')

      const phase = document.querySelector('#content .about h3').innerHTML
      const price = this.getPrice(phase)
      const dy = this.calculeDy(stock.average, price)
      const averageAdjusted = this.calculeAverageAdjusted(stock)
      const adjustedDY = this.calculeAdjustedDY(averageAdjusted, price)

      this.stocks.push({ ...stock, price, dy, adjustedDY })
    }
    file.send()
  }

  getPrice (phase: string) {
    console.log('phase', phase)
    const stepOne = phase.split('R$')[1]
    console.log('stepOne', stepOne)
    const stepTwo = stepOne.includes('-') ? stepOne.split('-')[0] : stepOne.split('+')[0]
    console.log('stepTwo', stepTwo)
    const price = Number(stepTwo.replace(' ', '').replace(',', '.').slice(1,999))
    return price
  }

  calculeDy (average: number, price: number) {
    return (average / price) * 100
  }

  calculeAverageAdjusted (stock: IStocks) {
    const years = [stock[2018], stock[2019], stock[2020], stock[2021], stock[2022]]
    const max = Math.max(...years)
    const min = Math.max(...years)
    const adjustedDividends = years.filter(year => year !== max && year !== min)
    const somar = (a: number, b: number) => a + b
    const totalAdjustedDividends = adjustedDividends.reduce(somar)
    return totalAdjustedDividends / 3
  }

  calculeAdjustedDY (averageTotalAdjustedDividends: number, price: number) {
    return (averageTotalAdjustedDividends / price) * 100
  }

  sortBy (prop: string) {
    return this.stocks.sort((a, b) => a[prop] > b[prop] ? -1 : a[prop] === b[prop] ? 0 : 1)
  }

  trackById (index: number) {
    return index
  }
}
