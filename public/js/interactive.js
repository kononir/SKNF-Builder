/*
 * Лабораторная работа 2 по дисциплине ЛОИС
 * Выполнена студентом группы 621701 БГУИР Новицким Владиславом Александровичем
 * Скрипт предназначен для тестирования знаний пользователя, загрузки теста и переключения между заданиями
 * Версия №1
*/

let testMas;
let testNum;

document.getElementById('files').addEventListener('change', handleLoading, false);
function handleLoading(evt) {
    let files = evt.target.files;

    let reader = new FileReader();
    reader.onload = getTestMas;
    reader.readAsText(files[0]);
}

function getTestMas(evt) {
    let lines = evt.target.result;

    try {
        if (lines === undefined) {
            throw "Ошибка чтения файла!";
        }

        testMas = JSON.parse(lines);
        testNum = 0;

        showTest();
    } catch (e) {
        alert(e);
    }
}

function showTest() {
    let test = testMas[testNum];

    let optionValues = test["options"];

    let options = document.getElementById("options");

    let newOptions = document.createElement("div");
    newOptions.id = "options";
    for (let i = 0; i < optionValues.length; i++) {
        let optionValue = optionValues[i];

        let option = document.createElement("input");
        option.name = "radio_button";
        option.type = "radio";
        option.value = optionValue;

        let label = document.createElement("label");
        label.innerText = optionValue;

        let p = document.createElement("p");
        p.appendChild(option);
        p.appendChild(label);

        newOptions.appendChild(p);
    }

    document.getElementById("formula").value = test["formula"];
    options.replaceWith(newOptions);
}

function startTest() {
    try {
        if (testMas === undefined) {
            throw "Пожалуйста, выберите файл теста!";
        }

        let checkedAnswer = getCheckedAnswer();

        if (checkedAnswer === undefined) {
            throw "Пожалуйста, выберите ответ!";
        }

        let inputFormula = document.getElementById("formula").value;
        let correctAnswer = buildFormula(inputFormula);

        showTestResult(checkedAnswer, correctAnswer);
    } catch (e) {
        alert(e);
    }
}

function getCheckedAnswer() {
    let checkedAnswer;

    let radBtns = document.getElementsByName("radio_button");
    for (let i = 0; i < radBtns.length; i++) {
        if (radBtns[i].checked) {
            checkedAnswer = radBtns[i].value;
        }
    }

    return checkedAnswer;
}

function showTestResult(checkedAnswer, correctAnswer) {
    let result;
    if (checkedAnswer === correctAnswer) {
        result = "Ответ верный.";
    } else {
        result = "Ответ неверный. Верный ответ: " + correctAnswer;
    }

    document.getElementById("answer").innerHTML = result;
}

function nextTest() {
    try {
        if (testMas === undefined) {
            throw "Пожалуйста, выберите файл теста!";
        }

        if (testNum + 1 > testMas.length - 1) {
            throw "Вы достигли конца теста!";
        }

        document.getElementById("answer").innerHTML = "";

        testNum++;
        showTest();
    } catch (e) {
        alert(e);
    }
}

function prevTest() {
    try {
        if (testMas === undefined) {
            throw "Пожалуйста, выберите файл теста!";
        }

        if (testNum - 1 < 0) {
            throw "Это первая формула теста!";
        }

        document.getElementById("answer").innerHTML = "";

        testNum--;
        showTest();
    } catch (e) {
        alert(e);
    }
}