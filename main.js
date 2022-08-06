"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
}
class Variable extends Token {
    constructor(name) {
        super();
        this.name = name;
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof Variable) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
}
class Operator extends Token {
    constructor(name) {
        super();
        this.operation = name;
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof Operator) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
    static getEvaluationFor(first, second, operation) {
        if (operation == "∧") {
            return first && second;
        }
        if (operation == "∨") {
            return first || second;
        }
        if (operation == "⇒") {
            return (!first) || second;
        }
        if (operation == "≡") {
            return ((!first) || second) && ((!second) || first);
        }
    }
}
class UnaryOperator extends Token {
    constructor(name) {
        super();
        this.operation = name;
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof UnaryOperator) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
}
class Open extends Token {
    constructor() {
        super();
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof Open) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
}
class Close extends Token {
    constructor() {
        super();
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof Close) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
}
class Expr extends Token {
    constructor(value) {
        super();
        this.myPath = [];
        this.value = value;
    }
    stringify() {
        if (this.isOfPath([Variable])) {
            let variable = this.value[0];
            return variable.name;
        }
        if (this.isOfPath([UnaryOperator, Expr])) {
            let expr = this.value[1];
            return "¬" + expr.stringify();
        }
        if (this.isOfPath([Expr, Operator, Expr])) {
            let expr1 = this.value[0];
            let expr2 = this.value[2];
            let oper = this.value[1];
            return `${expr1.stringify()} ${oper.operation} ${expr2.stringify()}`;
        }
        if (this.isOfPath([Open, Expr, Close])) {
            let expr = this.value[1];
            return "(" + expr.stringify() + ")";
        }
    }
    isOfPath(path) {
        for (let i = 0; i < this.myPath.length; i++) {
            if (this.myPath[i].name != path[i].name) {
                return false;
            }
        }
        return true;
    }
    eval(truthValues) {
        if (this.isOfPath([Variable])) {
            let variable = this.value[0];
            if (truthValues.has(variable.name)) {
                return truthValues.get(variable.name);
            }
            else {
                throw Error("Variable is not given truth value.");
            }
        }
        if (this.isOfPath([UnaryOperator, Expr])) {
            let expr = this.value[1];
            return (!(expr.eval(truthValues)));
        }
        if (this.isOfPath([Expr, Operator, Expr])) {
            let expr1 = this.value[0];
            let expr2 = this.value[2];
            let oper = this.value[1];
            return Operator.getEvaluationFor(expr1.eval(truthValues), expr2.eval(truthValues), oper.operation);
        }
        if (this.isOfPath([Open, Expr, Close])) {
            let expr = this.value[1];
            return expr.eval(truthValues);
        }
    }
    static find(stack, tokens, offset) {
        for (const path of Expr.paths) {
            if (stack.length > 0) {
                if (stack[stack.length - 1][0].name == path[0].name) {
                    continue;
                }
                if (stack[stack.length - 1][0].name == "UnaryOperator" && path[0].name == "Expr") {
                    continue;
                }
            }
            let now = [];
            Object.assign(now, stack);
            let searchValue = [];
            let off = offset;
            let success = true;
            now.push(path);
            for (const route of path) {
                let answer = route.find(now, tokens, off);
                if (answer == undefined) {
                    success = false;
                    break;
                }
                let ans = answer[0];
                let offs = answer[1];
                off = offs;
                searchValue.push(ans);
            }
            if (success) {
                let ret = new Expr(searchValue);
                ret.myPath = path;
                return [ret, off];
            }
        }
        return undefined;
    }
}
Expr.paths = [
    [Expr, Operator, Expr],
    [UnaryOperator, Expr],
    [Open, Expr, Close],
    [Variable]
];
function getTokenFor(input) {
    let map = new Map;
    map.set("(", new Open());
    map.set(")", new Close());
    map.set("[", new Open());
    map.set("]", new Close());
    map.set("{", new Open());
    map.set("}", new Close());
    map.set("&", new Operator("∧"));
    map.set("and", new Operator("∧"));
    map.set("AND", new Operator("∧"));
    map.set("^", new Operator("∧"));
    map.set(",", new Operator("∧"));
    map.set("v", new Operator("∨"));
    map.set("OR", new Operator("∨"));
    map.set("or", new Operator("∨"));
    map.set("|", new Operator("∨"));
    map.set("XOR", new Operator("XOR"));
    map.set("xor", new Operator("XOR"));
    map.set("IMPLIES", new Operator("⇒"));
    map.set("implies", new Operator("⇒"));
    map.set("WHEN", new Operator("⇒"));
    map.set("IF", new Operator("⇒"));
    map.set("->", new Operator("⇒"));
    map.set("=>", new Operator("⇒"));
    map.set("<=>", new Operator("≡"));
    map.set("<->", new Operator("≡"));
    map.set("IFF", new Operator("≡"));
    map.set("~", new UnaryOperator("NOT"));
    map.set("NOT", new UnaryOperator("NOT"));
    map.set("not", new UnaryOperator("NOT"));
    map.set("!", new UnaryOperator("NOT"));
    return map.get(input);
}
function getExprFromTokens(tokens) {
    let ret = Expr.find([], tokens, -1);
    if (ret == undefined) {
        return undefined;
    }
    if (ret[1] != (tokens.length - 1)) {
        let tryAgain = [];
        let remainingTokens = tokens.splice(ret[1] + 1);
        tryAgain.push(new Open());
        tryAgain.push(...tokens.slice(0, ret[1] + 1));
        tryAgain.push(new Close());
        tryAgain.push(...remainingTokens);
        return getExprFromTokens(tryAgain);
    }
    return ret[0];
}
function generateAllTruthValues(variables) {
    if (variables.length == 1) {
        let first = new Map;
        first.set(variables[0].name, true);
        let sec = new Map;
        sec.set(variables[0].name, false);
        return [first, sec];
    }
    let final = [];
    let firstVar = variables[0];
    let others = generateAllTruthValues(variables.slice(1));
    for (const truthValues of others) {
        let first = new Map(truthValues);
        let sec = new Map(truthValues);
        first.set(firstVar.name, true);
        sec.set(firstVar.name, false);
        final.push(first);
        final.push(sec);
    }
    return final;
}
function TF(value) {
    if (value) {
        return "T";
    }
    return "F";
}
// let expr = getExprFromTokens([new Variable("p"), new Operator("AND"), new Variable("q"), new Operator("AND"), new Variable("q")]);
// console.log(expr?.stringify());
function tokenize(input) {
    input += " ";
    let madeWord = "";
    let tokens = [];
    let append = [];
    for (const char of input) {
        if (char == " ") {
            if (madeWord == "") {
                continue;
            }
            let variable = new Variable(madeWord);
            tokens.push(variable);
            for (const token of append) {
                tokens.push(token);
            }
            append = [];
            madeWord = "";
            continue;
        }
        let charToken = getTokenFor(char);
        if (charToken != undefined) {
            if (charToken instanceof Close) {
                append.push(charToken);
            }
            else {
                tokens.push(charToken);
            }
            continue;
        }
        madeWord += char;
        let token = getTokenFor(madeWord);
        if (token != undefined) {
            tokens.push(token);
            madeWord = "";
        }
    }
    return tokens;
}
const readline = __importStar(require("readline"));
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let formula = "";
rl.question("FORMULA: ", (answer) => {
    formula = answer;
    let tokenized = tokenize(formula);
    let variables = [];
    for (const token of tokenized) {
        if (!(token instanceof Variable)) {
            continue;
        }
        let check = true;
        for (const variable of variables) {
            if (variable.name == token.name) {
                check = false;
                break;
            }
        }
        if (!check) {
            continue;
        }
        variables.push(token);
    }
    let expr = getExprFromTokens(tokenized);
    formula = expr.stringify();
    let reversed = [];
    Object.assign(reversed, variables);
    reversed.reverse();
    let values = generateAllTruthValues(reversed);
    let tableHead = "";
    for (const variable of variables) {
        tableHead += variable.name + " | ";
    }
    tableHead += formula;
    console.log(tableHead);
    for (const truthValues of values) {
        let out = "";
        for (const variable of variables) {
            out += TF(truthValues.get(variable.name)) + " | ";
        }
        out += TF(expr.eval(truthValues));
        console.log(out);
    }
    rl.close();
});
// benchmark 😈 
// (((((((((((((((a & b) & c) & d) & e) & f) & g) & h) & i) & j) & k) & l) & m) & n) & o) & p)
