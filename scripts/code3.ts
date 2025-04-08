function* fizzBuzz(n: number): Generator<string | number> {
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) yield "FizzBuzz"
    else if (i % 3 === 0) yield "Fizz"
    else if (i % 5 === 0) yield "Buzz"
    else yield i
  }
}

for (const value of fizzBuzz(15)) {
  console.log(value)
}
