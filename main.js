"use strict";
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
    constructor(name) {
        super();
        this.operation = name;
    }
    static find(stack, tokens, offset) {
        if (tokens[offset + 1] instanceof Open) {
            return [tokens[offset + 1], offset + 1];
        }
        return undefined;
    }
}
class Close extends Token {
    constructor(name) {
        super();
        this.operation = name;
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
        // if (this.myPath[0].name == "Variable") {
        //     let variable: Variable = this.value[0] as Variable;
        //     return variable.name;
        // }
        return undefined;
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
    map.set("(", new Open("("));
    map.set(")", new Close(")"));
    map.set("&", new Operator("AND"));
    map.set("AND", new Operator("AND"));
    map.set("^", new Operator("AND"));
    map.set("v", new Operator("OR"));
    map.set("OR", new Operator("OR"));
    map.set("|", new Operator("OR"));
    map.set("XOR", new Operator("XOR"));
    map.set("IMPLIES", new Operator("IMPLIES"));
    map.set("WHEN", new Operator("IMPLIES"));
    map.set("IF", new Operator("IMPLIES"));
    map.set("->", new Operator("IMPLIES"));
    map.set("=>", new Operator("IMPLIES"));
    map.set("<=>", new Operator("IFF"));
    map.set("<->", new Operator("IFF"));
    map.set("IFF", new Operator("IFF"));
    map.set("~", new UnaryOperator("~"));
    map.set("NOT", new UnaryOperator("NOT"));
    return map.get(input);
}
function tokenize(input) {
    let madeWord = "";
    let tokens = [];
    for (const char of input) {
        madeWord += char;
        let insert = getTokenFor(madeWord);
        if (insert != undefined) {
            tokens.push(insert);
            madeWord = "";
            continue;
        }
        if (char == " ") {
            tokens.push(new Variable(madeWord));
            madeWord = "";
            continue;
        }
    }
    return tokens;
}
let tokenized = tokenize("P IMPLIES Q");
// console.log(tokenized);
let expr = Expr.find([], [
    new Open("("),
    new Variable("A"),
    new Operator("AND"),
    new Open("("),
    new Variable("X"),
    new Operator("<=>"),
    new UnaryOperator("NOT"),
    new Variable("C"),
    new Close(")"),
    new Close(")"),
    new Operator("=>"),
    new Variable("B")
], -1);
// (A AND (X <=> NOT C)) => B
console.log(expr[0]);
// console.log(expr.getString());
// import util from 'util';
// console.log(expr[0].value[0].value[1]);
// console.log(util.inspect(expr, false, null, true /* enable colors */));
