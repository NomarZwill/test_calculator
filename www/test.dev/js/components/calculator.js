'use strict';

export default class Calculator{
  constructor(){
		let self = this;
    self.state = {};
    self.userDisplay = document.querySelector('[data-user-display]');
    document.querySelector('[data-button-block]').addEventListener('click', () => {
      self.buttonClickForwarder();
    });
    self.init();
  }

  init(){
    let self = this;
    self.state['inputString'] = '0';
    self.updateUserDisplay();
    // console.log(document.querySelector('[data-button-block]'));
  }

  buttonClickForwarder(){
    let self = this;
    let currentButton = null;

    if (event.target.tagName === 'SPAN'){
      currentButton = event.target.parentNode;
    } else if (event.target.tagName === 'BUTTON'){
      currentButton = event.target;
    } else {
      return;
    }

    if (currentButton.hasAttribute('data-digit')){
      self.digitHandler(currentButton.getAttribute('data-value'));
    } else if (currentButton.hasAttribute('data-action')){
      self.actionHandler(currentButton.getAttribute('data-value'));
    } else if (currentButton.hasAttribute('data-dot')){
      self.dotHandler();
    } else if (currentButton.hasAttribute('data-get-result')){
      self.resultHandler();
    }
  }

  digitHandler(digit){
    let self = this;

    if (self.checkLastChunkMaxLength()){
      return;
    }

    if (self.state['inputString'].substring(self.state['inputString'].length - 2) === ' 0'){
      self.state['inputString'] = self.state['inputString'].substring(0, self.state['inputString'].length - 1) + digit;
    } else if (self.state['inputString'] === '0'){
      self.state['inputString'] = digit;
    } else {
      self.state['inputString'] += digit;
    }
    self.updateUserDisplay();
  }

  actionHandler(action){
    let self = this;

    if (self.state['inputString'].substring(self.state['inputString'].length - 1) === ' '){
      self.state['inputString'] = self.state['inputString'].substring(0, self.state['inputString'].length - 2) + action + ' ';
    } else if (self.state['inputString'].substring(self.state['inputString'].length - 1) === '.'){
      self.state['inputString'] = self.state['inputString'].substring(0, self.state['inputString'].length - 1) + ' ' + action + ' ';
    } else {
      self.state['inputString'] += ' ' + action + ' ';
    }
    self.updateUserDisplay();
  }

  dotHandler(){
    let self = this;

    if (self.getLastChunk().indexOf('.') !== -1){
      return;
    }

    if (self.state['inputString'].substring(self.state['inputString'].length - 1) === ' '){
      self.state['inputString'] += ' 0.';
    } else if (self.state['inputString'].substring(self.state['inputString'].length - 1) === '.'){
      return;
    } else {
      self.state['inputString'] += '.';
    }
    self.updateUserDisplay();
  }

  resultHandler(){
    let self = this;
    let data = {
      "inputString": self.state['inputString'],
    }

    console.log(data);

    fetch("/", {
      method: 'POST',
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(data)  
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })

    // async function postData(url = '', data = {}) {
    //   const response = await fetch(url, {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     headers: {  
    //       'Content-Type': 'application/json'        },
    //   });
    //   return await response.json();
    // }

    // postData('/', { answer: 42 })
    // .then((data) => {
    //   console.log(data); // JSON data parsed by `response.json()` call
    // });
  }

  updateUserDisplay(){
    let self = this;
    self.userDisplay.innerHTML = self.state['inputString'];
  }

  getLastChunk(){
    let self = this;
    return self.state['inputString'].split(' ').pop();
  }

  checkLastChunkMaxLength(){
    let self = this;
    return self.getLastChunk().length > 10; 
  }
}