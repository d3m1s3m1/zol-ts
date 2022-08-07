abstract class Token {
    public static paths: any[][];
    name: any;
}

class Variable extends Token {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        if (tokens[offset + 1] instanceof Variable) {
            return [tokens[offset + 1], offset + 1]
        }
        return undefined;
    }
}

class Operator extends Token {
    operation: string;

    constructor(name: string) {
        super();
        this.operation = name;
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        if (tokens[offset + 1] instanceof Operator) {
            return [tokens[offset + 1], offset + 1]
        }
        return undefined;
    }

    static getEvaluationFor(first: boolean, second: boolean, operation: string): boolean | undefined {
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
        if (operation == "⊕") {
            return (first || second) && (!(first && second));
        }
    }
}

class UnaryOperator extends Token {
    operation: string;

    constructor(name: string) {
        super();
        this.operation = name;
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        if (tokens[offset + 1] instanceof UnaryOperator) {
            return [tokens[offset + 1], offset + 1]
        }
        return undefined;
    }
}

class Open extends Token {

    constructor() {
        super();
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        if (tokens[offset + 1] instanceof Open) {
            return [tokens[offset + 1], offset + 1]
        }
        return undefined;
    }
}

class Close extends Token {
    
    constructor() {
        super();
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        if (tokens[offset + 1] instanceof Close) {
            return [tokens[offset + 1], offset + 1]
        }
        return undefined;
    }
}

class Expr extends Token {
    value: Token[];

    constructor(value: Token[]) {
        super();
        this.value = value;
    }

    public static paths: any[][] = [
        [Expr, Operator, Expr],
        [UnaryOperator, Expr],
        [Open, Expr, Close],
        [Variable]
    ]

    myPath: Token[] = [];

    stringify(): string | undefined {
        if (this.isOfPath([Variable])) {
            let variable: Variable = this.value[0];
            return variable.name;
        }
        if (this.isOfPath([UnaryOperator, Expr])) {
            let expr: Expr = this.value[1] as Expr;
            return "¬" + expr.stringify();
        }
        if (this.isOfPath([Expr, Operator, Expr])) {
            let expr1: Expr = this.value[0] as Expr;
            let expr2: Expr = this.value[2] as Expr;
            let oper: Operator = this.value[1] as Operator;
        return `${expr1.stringify()} ${oper.operation} ${expr2.stringify()}`;
        }
        if (this.isOfPath([Open, Expr, Close])) {
            let expr: Expr = this.value[1] as Expr;
            return "(" + expr.stringify() + ")";
        }
    }

    isOfPath(path: any[]): boolean {
        for (let i = 0; i < this.myPath.length; i++) {
            if (this.myPath[i].name != path[i].name) {
                return false;
            }
        }
        return true;
    }

    eval(truthValues: Map<string, boolean>): any {
        if (this.isOfPath([Variable])) {
            let variable: Variable = this.value[0];
            if (truthValues.has(variable.name)) {
                return truthValues.get(variable.name);
            } else {
                throw Error("Variable is not given truth value.");
            }
        }
        if (this.isOfPath([UnaryOperator, Expr])) {
            let expr: Expr = this.value[1] as Expr;
            return (!(expr.eval(truthValues)));
        }
        if (this.isOfPath([Expr, Operator, Expr])) {
            let expr1: Expr = this.value[0] as Expr;
            let expr2: Expr = this.value[2] as Expr;
            let oper: Operator = this.value[1] as Operator;
            return Operator.getEvaluationFor(expr1.eval(truthValues), expr2.eval(truthValues), oper.operation);
        }
        if (this.isOfPath([Open, Expr, Close])) {
            let expr: Expr = this.value[1] as Expr;
            return expr.eval(truthValues);
        }
    }

    static find(stack: any[][], tokens: Token[], offset: number): [Token, number] | undefined {
        for (const path of Expr.paths) {
            if (stack.length > 0) {
                if (stack[stack.length - 1][0].name == path[0].name) {
                    continue;
                }
                if (stack[stack.length - 1][0].name == "UnaryOperator" && path[0].name == "Expr") {
                    continue;
                }
            }
            let now: any[][] = [];
            Object.assign(now, stack);
            let searchValue: Token[] = [];
            let off: number = offset;
            let success: boolean = true;
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
                let ret: Expr = new Expr(searchValue);
                ret.myPath = path;
                return [ret, off];
            }
        }
        return undefined;
    }
}

function getTokenFor(input: string): Token | undefined {
    let map: Map<string, Token> = new Map<string, Token>;
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

    map.set("OR", new Operator("∨"));
    map.set("or", new Operator("∨"));
    map.set("|", new Operator("∨"));

    map.set("XOR", new Operator("⊕"));
    map.set("xor", new Operator("⊕"));

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

    
    return map.get(input)
}

function getExprFromTokens(tokens: Token[]): Expr | undefined {
    let ret = Expr.find([], tokens, -1);
    if (ret == undefined) {
        return undefined;
    } 
    if (ret[1] != (tokens.length-1)) {
        let tryAgain: Token[] = [];
        let remainingTokens: Token[] = tokens.splice(ret[1]+1);
        
        tryAgain.push(new Open());
        tryAgain.push(...tokens.slice(0, ret[1]+1));
        tryAgain.push(new Close());

        tryAgain.push(...remainingTokens);
        return getExprFromTokens(tryAgain);
    }
    return ret[0] as Expr;
}

function generateAllTruthValues(variables: Variable[]) : Map<string, boolean>[]  {
    if (variables.length == 1) {
        let first: Map<string, boolean> = new Map<string, boolean>;
        first.set(variables[0].name, true);

        let sec: Map<string, boolean> = new Map<string, boolean>;
        sec.set(variables[0].name, false);
        
        return [first, sec];
    }
    
    let final: Map<string, boolean>[] = [];
    let firstVar: Variable = variables[0];
    
    let others: Map<string, boolean>[] = generateAllTruthValues(variables.slice(1));
    for (const truthValues of others) {
        let first: Map<string, boolean> = new Map(truthValues);
        let sec: Map<string, boolean> = new Map(truthValues);
        
        first.set(firstVar.name, true);
        sec.set(firstVar.name, false);
        
        final.push(first);
        final.push(sec);
    }
    
    return final;
}

function TF(value: boolean): string {
    if (value) {
        return "T";
    }
    return "F";
}

function tokenize(input: string) {
    input += " ";
    let madeWord = "";
    let tokens: Token[] = [];
    let append: Token[] = [];
    for (const char of input) {
        if (char == " ") {
            if (madeWord == "") { continue; }
            let variable: Variable = new Variable(madeWord);
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
            } else {
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

// import * as readline from 'readline';

// let rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// let formula = ""
// rl.question("FORMULA: ", (answer: string) => {
//     formula = answer;
//     let tokenized: Token[] = tokenize(formula);
//     let variables: Variable[] = [];
    
//     for (const token of tokenized) {
//         if (!(token instanceof Variable)) { continue; }
//         let check: boolean = true;
//         for (const variable of variables) {
//             if (variable.name == token.name) {
//                 check = false;
//                 break;
//             }
//         }
//         if (!check) { continue; }
//         variables.push(token);
//     }
    
//     let expr: any = getExprFromTokens(tokenized);
//     formula = expr.stringify();
//     let reversed: Variable[] = [];
//     Object.assign(reversed, variables);
//     reversed.reverse();
//     let values = generateAllTruthValues(reversed);
        
//     let tableHead: string = "";
//     for (const variable of variables) {
//             tableHead += variable.name + " | "
//     }
//     tableHead += formula;
    
//     console.log(tableHead);
    
//     for (const truthValues of values) {
//         let out: string = "";
//         for (const variable of variables) {
//             out += TF(truthValues.get(variable.name) as boolean) + " | ";
//         }
//         out += TF(expr.eval(truthValues) as boolean);
//         console.log(out);
//     }
//     rl.close();
// });

window.onload = function() {
    const formulaInput = document.getElementById("formula");
    const truthTable = document.getElementById("truth-table");
    formulaInput.value = "p => q";

    update();

    function update() {
        let formula = formulaInput.value;
        let tokenized: Token[] = tokenize(formula);
        let variables: Variable[] = [];
        
        for (const token of tokenized) {
            if (!(token instanceof Variable)) { continue; }
            let check: boolean = true;
            for (const variable of variables) {
                if (variable.name == token.name) {
                    check = false;
                    break;
                }
            }
            if (!check) { continue; }
            variables.push(token);
        }
        
        let expr: any = getExprFromTokens(tokenized);
        if (expr == undefined) {
            return;
        }
        truthTable!.innerHTML = "";
        formula = expr.stringify();
        let reversed: Variable[] = [];
        Object.assign(reversed, variables);
        reversed.reverse();
        let values = generateAllTruthValues(reversed);
            
        let tableHead = document.createElement("tr");
        for (const variable of variables) {
                let add = document.createElement("th");
                add.textContent = variable.name
                tableHead.appendChild(add);
        }
        let formulaAdd = document.createElement("th");
        formulaAdd.textContent = formula;
        tableHead.appendChild(formulaAdd);
        truthTable?.appendChild(tableHead);
        
        for (const truthValues of values) {
            let out = document.createElement("tr");
            for (const variable of variables) {
                let add = document.createElement("td");
                add.textContent = TF(truthValues.get(variable.name) as boolean);
                out.appendChild(add);
            }
            let add = document.createElement("td");
            add.textContent = TF(expr.eval(truthValues) as boolean);
            out.appendChild(add);
            
            truthTable?.appendChild(out);
        }
    }

    formulaInput!.oninput = function(e) {
        update();
    }
};