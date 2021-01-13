import { Component } from '@angular/core';

const Operators = ['+', '-', '*', '/'];

const priorRe = /\((?:[+\-*\/=\^]*(?:\d|\.)+){2,}\)/g;

const equalNumRe = /(=[+\-]?(?:\d|\.)+)/g;

const opeRe = /([+\-*\/\^])/;

const plusAndMinusRe = /[+\-]+/;

function splitFm(fm: string): string[] {
    return fm
        .split(equalNumRe)
        .map((subFm) => (subFm[0] === '=' ? subFm.replace('=', '') : subFm.split(opeRe)))
        .flat(1)
        .filter((el) => el !== '');
}

function simplifyNumAbs(num: string): string {
    return num.replace(plusAndMinusRe, (match) => {
        let isPositive = true;
        for (const ope of match) {
            if (ope === '-') {
                isPositive = !isPositive;
            }
        }
        return isPositive ? '' : '-';
    });
}

@Component({
    selector: 'app-calculator',
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent {
    formula: string;

    constructor() {
        console.log(this.seperateFormula('2*((2/5)*(5+1)*5)/2+4'));
    }

    clear(): void {
        this.formula = '';
    }

    enterNum(): void {}

    calcResult(): void {}

    private arithmeticCompute(formula: string): number {
        let splitedFm: (string | number)[] = splitFm(formula);

        splitedFm = splitedFm.reduce((result, el) => {
            if (isNaN(+el)) {
                result.push(el);
            } else {
                if (result[result.length - 1] === '*' || result[result.length - 1] === '/') {
                    const ope = result.pop();
                    const firstNum = result.pop();

                    if (ope === '*') {
                        result.push(+firstNum * +el);
                    } else if (ope === '/') {
                        result.push(+firstNum / +el);
                    }
                } else {
                    result.push(el);
                }
            }
            return result;
        }, []);

        splitedFm = splitedFm.reduce((result, el) => {
            if (isNaN(+el)) {
                result.push(el);
            } else {
                if (result[result.length - 1] === '+' || result[result.length - 1] === '-') {
                    const ope = result.pop();
                    const firstNum = result.pop() || 0;

                    if (ope === '+') {
                        result.push(+firstNum + +el);
                    } else if (ope === '-') {
                        result.push(+firstNum - +el);
                    }
                } else {
                    result.push(el);
                }
            }
            return result;
        }, []);

        return +splitedFm[0];
    }

    private seperateFormula(formula: string): number {
        const matchResult = formula.matchAll(priorRe);
        let hasMatch: boolean;

        for (const match of matchResult) {
            hasMatch = true;
            const matchFm = match[0].slice(1, -1);
            formula = formula.replace(match[0], `=${this.arithmeticCompute(matchFm)}`);
        }

        if (hasMatch) {
            return this.seperateFormula(formula);
        } else {
            return this.arithmeticCompute(formula);
        }
    }
}
