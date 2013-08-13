This compiles JavaScript, replacing every single expression with a
`yield` form that yields the expression and other useful debugging
info. I wrote a VM that executes this special code, and allows you to
break and step through code.

Essentially, I've stolen control of the stack, but let JavaScript take
care of data and all the other complicated stuff.