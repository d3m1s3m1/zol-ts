# zol-ts

https://d3m1s3m1.github.io/zol-ts/

The worst Zeroth-Order-Logic implementation in TypeScript

I created this as an experiment to see just how much I can implement by myself.  I never worked with syntax trees before and have a vague idea of the process through which plaintext gets converted into something machine-readable.

I wanted to create an algebra interpreter but I thought I'd better implement something with a simpler syntax.

I created (probably not the first) the algorithm to turn a tokenized string into an Expression Object through trial and error with a pen and a lot of paper.

![image](https://user-images.githubusercontent.com/77368058/186716227-fdb742b5-1ac4-4bb2-9f66-8d34fa051d29.png)

![image](https://user-images.githubusercontent.com/77368058/186716404-6ea5359e-413b-42ec-8e30-38966038b767.png)

Goals
1. ~Truth Table Generator~
2. Argument Validity Checker (you could just take the conjuction of each premise implies conclusion and see if its a tautology.)
3. ~Web version?~
