import { Component, OnInit } from '@angular/core'
import { listStocks } from 'src/config/listStocks'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  stocks: any[]

  ngOnInit(): void {
    this.stocks = []
    listStocks.list.forEach((value, index) => {
      this.readFile(value, index)
    })
  }

  readFile (stock: string, index: number) {
    const file = new XMLHttpRequest()
    file.open("GET", `assets/stocks/${stock}.txt`, true)
    file.onreadystatechange = () => {
      if(!(file.readyState === 4 && (file.status === 200 || file.status == 0))) return
      const parser = new DOMParser()
      if (!parser) return
      const doc = parser.parseFromString(file.response, 'text/html')
      if (!doc) return
      const input = doc.getElementById('results')
      if (!input) return
      const attribute = input.getAttribute('value')
      if (!attribute) return
      const dividends = eval(attribute)
      if (!dividends) return
      const price = Number(doc.querySelector('[title="Valor atual do ativo"] .value').innerHTML.replace(',', '.'))
      if (!price) return
      this.calculateDividends(dividends, price, stock, index)
    }
    file.send()
  }

  calculateDividends(dividends: any, price: number, stock: string, index: number): void {
    const result: any = {
      2017: 0,
      2018: 0,
      2019: 0,
      2020: 0,
      2021: 0
    }

    for (let i=0; i<dividends.length; i++) {
      let year = Number(dividends[i].ed.substr(6))
      if(year < 2017) break
      if(!result[year]) result[year] = 0
      result[year] += dividends[i].v
    }

    let count = Object.keys(result).length
    let keys = Object.keys(result)

    for (let i=0; i<count; i++) {
      if(!result.total) result.total = 0
      if(result[keys[i]]) result.total += result[keys[i]]
    }

    result.name = stock
    result.average = result.total / count
    result.price = price
    result.dy = (result.average * 100) / result.price

    count = Object.keys(result).length
    keys = Object.keys(result)
    
    const roundTo = function(num: number, places: number) {
      const factor = 10 ** places;
      return Math.round(num * factor) / factor;
    };
        
    for (let i=0; i<count; i++) {
      if(keys[i] === 'name') continue
      if(result[keys[i]]) result[keys[i]] = roundTo(result[keys[i]], 2)//Math.round(result[keys[i]], -2)
    }

    // if (!result.average || !result.price || !result[2017] || !result[2018] || !result[2019] || !result[2020] || !result[2021]) return
    this.stocks.push(result)
  }

  sortBy (prop: string): any[] {
    return this.stocks.sort((a, b) => a[prop] > b[prop] ? -1 : a[prop] === b[prop] ? 0 : 1)
  }
}
