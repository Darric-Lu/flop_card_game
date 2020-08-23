// 遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
// 卡片樣式
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]
// 視覺模組
const view = {
  getCardElement(index) { //渲染卡片背面
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) {//渲染卡片內容
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src="${symbol}" />
    <p>${number}</p>
    `
  },
  transformNumber(number) {// 數字字母轉換
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {// 渲染牌桌
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {//翻轉卡片
    cards.map(card => {
      if (card.classList.contains('back')) { // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back') // 回傳背面
      card.innerHTML = null
    })
  },
  pairCards(...cards) {//固定翻開卡片
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {//更新分數
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },
  renderTriedTimes(times) {//更新次數
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {//錯誤提示動畫
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {//完成遊戲
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
      <p><button id="reset-game" class="btn btn-info">在挑戰再一次!!</button></p>
    `
    const header = document.querySelector('#header')
    header.before(div)
    const resetGame = document.querySelector('#reset-game')
    resetGame.addEventListener('click', controller.resetGameClicked)
  }
}
//資料控制模組
const model = {
  revealedCards: [],//待核對的卡片

  isRevealedCardsMatched() {//比對是否數字相同
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 250,//起始分數
  triedTimes: 0,//起始次數
}
//狀態控制模組
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,//遊戲起始狀態
  generateCards() {//洗牌並渲染遊戲介面
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {//依照不同的遊戲狀態，做不同的行為
    if (!card.classList.contains('back')) {//無法點擊已翻開的卡片
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {//配對正確
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.FirstCardAwaits
          if (model.score === 260) {//達到完成分數
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            model.revealedCards = []//
            return
          }
        } else { //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    // console.log(this.currentState)
    // console.log(model.revealedCards.map(card => card.dataset.index))
    // // console.log(model.isRevealedCardsMatched())
  },
  resetCards() {//配對失敗、蓋回卡片
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  resetGameClicked() {
    const finished = document.querySelector('.completed')
    finished.remove()
    model.score = 0
    view.renderScore(model.score)
    model.triedTimes = 0
    view.renderTriedTimes(model.triedTimes)
    controller.generateCards()
    this.currentState = GAME_STATE.FirstCardAwaits//
  }

}

const utility = {// 洗牌功能
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}



controller.generateCards()

// 監聽器 Node List (arry-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})


