/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function buildFormulaWithPrinting() {
    let formula = document.getElementById("formula").value;

    document.getElementById("answer").innerHTML = buildFormula(formula);
}

function buildFormula(formula) {
    let atoms = findAllUniqueAtoms(formula);

    let interpretation = buildInterpretation(atoms);

    let subforms = findAllSubforms(formula);

    let truthTable = buildTruthTable(formula, interpretation, subforms);

    let sknfFormula = "";

    let disjuncts = buildAllDisjuncts(interpretation, truthTable);

    let disjunctsNumber = disjuncts.length;

    for (let i = 0; i < disjunctsNumber; i++) {
        if (i > 0 && i !== disjunctsNumber - 1) {
            sknfFormula += "&(";
        } else if (i > 0 && i === disjunctsNumber - 1) {
            sknfFormula += '&';
        }

        sknfFormula += disjuncts[i];
    }

    for (let i = 0; i < disjunctsNumber - 2; i++) {
        sknfFormula += ')';
    }

    if (disjunctsNumber > 1) {
        sknfFormula = '(' + sknfFormula + ')';
    }

    return sknfFormula;
}

function findAllUniqueAtoms(formula) {
    let atoms = formula.match(/[A-Z]+\d*/g);

    return uniqueArray(atoms);
}

function uniqueArray(arr) {
    let object = {};

    for (let i = 0; i < arr.length; i++) {
        let element = arr[i];

        object[element] = true;
    }

    return Object.keys(object);
}

function buildInterpretation(atoms) {
    let columnsNumber = atoms.length;
    let linesNumber = Math.pow(2, columnsNumber);
    let interpretation = [];

    for (let i = 0; i < linesNumber; i++) {
        let binary = convertToBinaryWithLength(i, columnsNumber);
        let atomsValue = {};

        for (let j = 0; j < columnsNumber; j++) {
            atomsValue[atoms[j]] = Number(binary[j]);
        }

        interpretation.push(atomsValue);
    }

    return interpretation;
}

function convertToBinaryWithLength(number, length) {
    const binRadix = 2;

    let binary = number.toString(binRadix);

    let binaryLength = binary.length;

    if (binaryLength < length) {
        let addingNumber = length - binaryLength;

        for (let i = 0; i < addingNumber; i++) {
            binary = '0' + binary;
        }
    }

    return binary;
}

function findAllSubforms(formula) {
    let subforms = {};
    let regexp = /~|->|&|\||!/g;
    let found;

    while ((found = regexp.exec(formula))) {
        let subform = {};
        let subformKey;

        let operator = found[0];
        let operatorIndex = found.index;

        subform["operator"] = operator;

        if (operator === '!') {
            let operand = findOperandInRightPart(formula, operatorIndex);
            subform["operand"] = operand;

            subformKey = '(' + operator + operand + ')';
        } else {
            let firstOperand = findOperandInLeftPart(formula, operatorIndex);
            subform["first operand"] = firstOperand;

            if (operator === "->") {
                operatorIndex++;
            }

            let secondOperand = findOperandInRightPart(formula, operatorIndex);
            subform["second operand"] = secondOperand;

            subformKey = '(' + firstOperand + operator + secondOperand + ')';
        }

        subforms[subformKey] = subform;
    }

    return subforms;
}

function findOperandInLeftPart(formula, operatorIndex) {
    let i = operatorIndex - 1;
    let unclosedBrackets = 0;

    while (i > 0) {
        if (formula[i] === '(' && unclosedBrackets === 0) {
            break;
        } else if (formula[i] === ')') {
            unclosedBrackets++;
        }  else if (formula[i] === '(') {
            unclosedBrackets--;
        }

        i--;
    }

    return formula.substring(i + 1, operatorIndex);
}

function findOperandInRightPart(formula, operatorIndex) {
    let i = operatorIndex + 1;
    let unclosedBrackets = 0;

    while (i < formula.length) {
        if (formula[i] === '(') {
            unclosedBrackets++;
        } else if (formula[i] === ')' && unclosedBrackets === 0) {
            break;
        } else if (formula[i] === ')') {
            unclosedBrackets--;
        }

        i++;
    }

    return formula.substring(operatorIndex + 1, i);
}

function buildTruthTable(formula, interpretation, subforms) {
    let truthTable = [];

    let linesNumber = interpretation.length;

    for (let i = 0; i < linesNumber; i++) {
        truthTable.push(calculateSubform(formula, subforms, interpretation[i]));
    }

    return truthTable;
}

function calculateSubform(subformKey, subforms, interpretationLine) {
    let result;

    let currentSubform = subforms[subformKey];

    if (currentSubform !== undefined) {
        result = performOperation(currentSubform, subforms, interpretationLine)
    } else {
        result = interpretationLine[subformKey];
    }

    return result;
}

function performOperation(currentSubform, subforms, interpretationLine) {
    let result;

    switch (currentSubform.operator) {
        case '!':
            result = negation(calculateSubform(currentSubform["operand"], subforms, interpretationLine));
            break;
        case '|':
            result = calculateSubform(currentSubform["first operand"], subforms, interpretationLine)
                | calculateSubform(currentSubform["second operand"], subforms, interpretationLine);
            break;
        case '&':
            result = calculateSubform(currentSubform["first operand"], subforms, interpretationLine)
                & calculateSubform(currentSubform["second operand"], subforms, interpretationLine);
            break;
        case '~':
            result = equivalence(calculateSubform(currentSubform["first operand"], subforms, interpretationLine),
                calculateSubform(currentSubform["second operand"], subforms, interpretationLine));
            break;
        case "->":
            result = implication(calculateSubform(currentSubform["first operand"], subforms, interpretationLine),
                calculateSubform(currentSubform["second operand"], subforms, interpretationLine));
            break;
    }

    return result;
}

function equivalence(firstOperand, secondOperand) {
    let result;

    if (firstOperand === secondOperand) {
        result = 1;
    } else {
        result = 0;
    }

    return result;
}

function implication(firstOperand, secondOperand) {
    return negation(firstOperand) | secondOperand;
}

function negation(operand) {
    let result;

    if (operand === 1) {
        result = 0;
    } else {
        result = 1;
    }

    return result;
}

function buildAllDisjuncts(interpretation, truthTable) {
    let disjuncts = [];

    let linesNumber = interpretation.length;

    for (let i = 0; i < linesNumber; i++) {
        if (truthTable[i] === 0) {
            disjuncts.push(convertToDisjunct(interpretation[i]));
        }
    }

    return disjuncts;
}

function convertToDisjunct(interpretationLine) {
    let disjunct = "";

    let keys = Object.keys(interpretationLine);
    let keysNumber = keys.length;

    for (let i = 0; i < keysNumber; i++) {
        let key = keys[i];

        if (i > 0 && i !== keysNumber - 1) {
            disjunct += "|(";
        } else if (i > 0 && i === keysNumber - 1) {
            disjunct += '|';
        }

        if (interpretationLine[key] === 0) {
            disjunct += key;
        } else {
            disjunct += "(!" + key + ")";
        }
    }

    for (let i = 0; i < keysNumber - 2; i++) {
        disjunct += ')';
    }

    if (keysNumber > 1) {
        disjunct = '(' + disjunct + ')';
    }

    return disjunct;
}
