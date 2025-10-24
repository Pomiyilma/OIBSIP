const displayBox = document.querySelector(".display");
const displayInput = document.querySelector(".display-input");
const displayResult = document.querySelector(".display-result");
const buttons = document.querySelectorAll("button");
const operators = ["%", "÷", "×", "-", "+"];

let input = "";
let result = "";
let justEvaluated = false;

const calculate = buttonVal => {

  const lastChar = input.slice(-1),
    secondToLastChar = input.slice(-2, -1),
    withoutLastChar = input.slice(0, -1),
    isLastCharOperator = operators.includes(lastChar),
    isInvalidResult = ["Error", "Infinity"].includes(result);
  let {openBracketsCount, closeBracketsCount} = countBrackets(input);

  //HANDLE EQUALS (=)
  if (buttonVal === "=") {
    if (
      input === "" ||
      lastChar === "." ||
      lastChar === "(" ||
      isLastCharOperator && lastChar !== "%" ||
      justEvaluated
    ) return;

    while(openBracketsCount > closeBracketsCount){
      input += ")";
      closeBracketsCount++;
    }

    const formattedInput = replaceOperators(input);
    try {

      const calculatedVal =  input.includes("%") ? calculatePercentage(input) : eval(formattedInput);

      result = parseFloat(calculatedVal.toFixed(10)).toString();

    } catch {
      result = "Error";
    }

    input += buttonVal;
    justEvaluated = true;
    displayBox.classList.add("active");

  } 
  //HANDLE ALL CLEAR (C)
  else if (buttonVal === "C") {
    resetCalculator("");

  } 
  //HANDLE BACKSPACE
  else if (buttonVal === "") {
      if (justEvaluated) {
        if (isInvalidResult) resetCalculator("");
        resetCalculator(result.slice(0, -1));
      }
      else input = withoutLastChar;

  } 
  //HANDLE OPERATORS
  else if (operators.includes(buttonVal)) {

      if (justEvaluated) {
        if (isInvalidResult) return;
        resetCalculator(result + buttonVal);
      } 

      else if (
        (input === "" || lastChar === "(") && buttonVal !== "-" ||
        input === "-" ||
        lastChar === "." ||
        secondToLastChar === "(" && lastChar === "-" || 
        (secondToLastChar === "%" || lastChar === "%") && buttonVal === "%"
      ) return;

      else if (lastChar === "%") input += buttonVal;
      else if (isLastCharOperator) input = withoutLastChar + buttonVal;

      else input += buttonVal;
  } 
  
  //HANDLE DECIMALS 
  else if (buttonVal === ".") {

    const decimalVal = "0.";
    if(justEvaluated) resetCalculator(decimalVal);
    else if (lastChar === ")" || lastChar === "%") input += "×" + decimalVal;
    else if (input === "" || isLastCharOperator || lastChar === "(") input += decimalVal;
    else {
      lastOperatorIndex = -1;
      for(const operator of operators){
        const index = input.lastIndexOf(operator);
        if(index > lastOperatorIndex) lastOperatorIndex = index;
      }
      if(!input.slice(lastOperatorIndex + 1).includes(".")) input += buttonVal;
    }

  } else if (buttonVal === "( )") {
    if(justEvaluated){
      if(isInvalidResult) resetCalculator("(");
      else resetCalculator(result + "×(");
    } 
    else if (lastChar === "(" || lastChar === ".") return;
    else if (input === "" || isLastCharOperator && lastChar !== "%") input += "(";
    else if (openBracketsCount > closeBracketsCount) input += ")";
    else input += "×(";

  } 

  //HANDLE NUMBERS
  else {
    if (justEvaluated) resetCalculator(buttonVal);
    else if (input === "0") input = buttonVal;
    else if (
      (operators.includes(secondToLastChar) || secondToLastChar === "(") && lastChar === "0"
    ) input = withoutLastChar + buttonVal;
    else if (lastChar === ")" || lastChar === "%") input += "×" + buttonVal;
    else input += buttonVal;
  }

  //UPDATE DISPLAY
  displayInput.value = input;
  displayResult.value = result;
  displayInput.scrollLeft = displayInput.scrollWidth;
};

//FUNC TO REPLACE x AND ÷ SYMBOLS WITH JAVASCRIPT-COMPATIBLE OPERATORS 
const replaceOperators = input => input.replaceAll("÷", "/").replaceAll("×", "*");

//FUNC TO RESET CALCULATOR STATE WITH A NEW INPUT VALUE
const resetCalculator = newInput => {
  input = newInput;
  result = "";
  justEvaluated = false;
  displayBox.classList.remove("active");
}

//FUNC TO COUNT BRACKETS IN INPUT
const countBrackets = input => {
  let openBracketsCount = 0,
      closeBracketsCount = 0;

  for (const char of input){
    if(char === "(") openBracketsCount++;
    else if(char === ")") closeBracketsCount++;
  }
  return {openBracketsCount, closeBracketsCount};
}

//FUNC TO HANDLE PERCENTAGE CALC. 
const calculatePercentage = input => {
  let processedInput = "",
      numberBuffer = "";
  const bracketState = [];

  for (let i=0; i<input.length; i++){
    const char = input[i];

    if(!isNaN(char) || char === ".") numberBuffer += char;
    else if(char === "%"){

      const percentVal = parseFloat(numberBuffer) / 100;

      const previousOperator = i > 0 ? input[i - numberBuffer.length - 1] : "";

      const nextOperator = i + 1 < input.length && operators.includes(input[i + 1]) ? input[i + 1] : "";

      if(
        !previousOperator || 
        previousOperator === "÷" || 
        previousOperator === "×" || 
        previousOperator === "("
      ) processedInput += percentVal;

      else if (previousOperator === "-" || previousOperator === "+"){
        if(nextOperator === "÷" || nextOperator === "×"){
          processedInput += percentVal;
        } else {
          processedInput += "(" + processedInput.slice(0, -1) + ")*" + percentVal;
        }
      }
      numberBuffer = "";
    }
    else if (operators.includes(char) || char === "(" || char === ")"){
      if (numberBuffer){
        processedInput += numberBuffer;
        numberBuffer = "";
      }
      if(operators.includes(char)){
        processedInput += char;
      }
      else if (char === "("){
        processedInput += "(";
        bracketState.push(processedInput);
        processedInput = "";
      }
      else {
        processedInput += ")";
        processedInput = bracketState.pop() + processedInput;
      }
    }
  }
  if(numberBuffer) processedInput += numberBuffer;

  return eval(replaceOperators(processedInput));
};

//ADD CLICK EVENT LISTENERS TO ALL BUTTONS
buttons.forEach(button =>
  button.addEventListener("click", e => calculate(e.target.textContent))
);