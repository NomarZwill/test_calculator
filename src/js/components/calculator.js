'use strict';

export default class Calculator{
  constructor(){
		let self = this;
    self.isFirstAction = true;
    self.state = {
      'inputString' : '0',
      'displayString' : '0'
    };
    self.userDisplay = document.querySelector('[data-user-display]');
    
    document.querySelector('[data-button-block]').addEventListener('click', (event) => {
      self.buttonClickForwarder(event);
    });
    self.init();
  }

  init(){
    let self = this;
    let savedState = JSON.parse(localStorage.getItem("calculatorState"));

    if (savedState !== null){
      self.state = savedState;
    }

    self.updateUserDisplay();
  }

  buttonClickForwarder(event){
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
      self.actionHandler(currentButton.getAttribute('data-value'), currentButton.getAttribute('data-value-to-display'));
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
      self.state['displayString'] = self.state['displayString'].substring(0, self.state['displayString'].length - 1) + digit;
      self.saveState();
    } else if (self.state['inputString'] === '0'){
      self.state['inputString'] = digit;
      self.state['displayString'] = digit;
      self.saveState();
    } else {
      self.state['inputString'] += digit;
      self.state['displayString'] += digit;
      self.saveState();
    }
    self.updateUserDisplay();
  }

  actionHandler(action, valueToDisplay){
    let self = this;

    if (!self.isFirstAction && self.state['inputString'].substring(self.state['inputString'].length - 1) !== ' '){

      let input = {
        "inputString": self.state['inputString'],
      };
      self.getCalculation(input)
      .then(data => {
        if (data.state !== 'success') {
          alert(data.state);
          self.state['inputString'] = data.result + '';
          self.state['displayString'] = data.result;
          self.saveState();
          self.isFirstAction = true; 
        } else {
          self.state['inputString'] = data.result + ' ' + action + ' ';
          self.state['displayString'] = data.result + ' ' + valueToDisplay + ' ';
          self.saveState();
        }

        self.updateUserDisplay();
      });
      return;
    }

    if (self.state['inputString'].substring(self.state['inputString'].length - 1) === ' '){
      self.state['inputString'] = self.state['inputString'].substring(0, self.state['inputString'].length - 2) + action + ' ';
      self.state['displayString'] = self.state['displayString'].substring(0, self.state['displayString'].length - 2) + valueToDisplay + ' ';
      self.saveState();
    } else if (self.state['inputString'].substring(self.state['inputString'].length - 1) === '.'){
      self.state['inputString'] = self.state['inputString'].substring(0, self.state['inputString'].length - 1) + ' ' + action + ' ';
      self.state['displayString'] = self.state['displayString'].substring(0, self.state['displayString'].length - 1) + ' ' + valueToDisplay + ' ';
      self.saveState();
    } else {
      self.state['inputString'] += ' ' + action + ' ';
      self.state['displayString'] += ' ' + valueToDisplay + ' ';
      self.saveState();
    }
    self.isFirstAction = false;
    self.updateUserDisplay();
  }

  dotHandler(){
    let self = this;

    if (self.getLastChunk().indexOf('.') !== -1){
      return;
    }

    if (self.state['inputString'].substring(self.state['inputString'].length - 1) === ' '){
      self.state['inputString'] += ' 0.';
      self.state['displayString'] += ' 0.';
      self.saveState();
    } else if (self.state['inputString'].substring(self.state['inputString'].length - 1) === '.'){
      return;
    } else {
      self.state['inputString'] += '.';
      self.state['displayString'] += '.';
      self.saveState();
    }
    self.updateUserDisplay();
  }

  resultHandler(){
    let self = this;
    let input = {
      "inputString": self.state['inputString'],
    };
    self.getCalculation(input)
    .then(data => {

      if (data.state !== 'success') {
        alert(data.state);
      }
      self.state['inputString'] = data.result + '';
      self.state['displayString'] = data.result + '';
      self.saveState();
      self.updateUserDisplay();
      self.isFirstAction = true;
    });
  }

  getCalculation(data){

    return fetch("/src/api/getCalculation.php", {
      method: 'POST',
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(data)  
    })
    .then(response => response.json());
  }

  updateUserDisplay(){
    let self = this;
    self.userDisplay.innerHTML = self.state['displayString'];
  }

  getLastChunk(){
    let self = this;
    return self.state['inputString'].split(' ').pop();
  }

  checkLastChunkMaxLength(){
    let self = this;
    return self.getLastChunk().length > 10; 
  }

  saveState(){
    let self = this;
    localStorage.setItem("calculatorState",JSON.stringify(self.state));
  }
}