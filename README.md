<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/miikalei/mlox">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">mlox</h3>
  <p align="center">
    (Multi-paradigm Language for Optimized eXpression), a supercharged version of the toy language lox, introduced in the book Crafting Interpreters by Robert Nystrom. Mlox extends the original language with modern features while maintaining its elegant simplicity.
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

This is a Typescript implementation of a programming language mlox, a modified version of the toy language lox, introduced in the book Crafting Interpreters by Robert Nystrom. Purpose of this project is to allow me to better follow through the book as I go. And also to have fun. Please avoid ever using this, anywhere.

> [!WARNING]  
> While the language was useful for my learning, it is a joke language and not a serious project. Please don't judge my language design skills based on this.

## Features

- 🌍 **Runs anywhere**: Mlox is implemented in Javascript, so it can be run anywhere Javascript is supported. Note that Mlox officially only supports Von Neumann architectures.
- ⚡ **Blazing fast**: Mlox utilizes Central Processing Units (CPUs) to execute programs, and is able to calculate dozens of Fibonacci numbers in just a few seconds.
- 🔄 **Multi-paradigm**: Mlox supports imperative, object-oriented, functional and programming paradigms. There is partial support of declarative programming (you can declare variables) and visual programming (assuming you have a screen).
- 🎖️ **NATO compatible**: Mlox prints single character strings using the NATO phonetic alphabet.
- 🔒 **Security first**: Mlox does not support any form of user input, so it is impossible to crash the program with invalid input, and all your SQL queries will be safe.
- 🚫 **No regular expressions**: With some careful language design, we can not support these annoyances.
- 🔮 **Quantum ready**: While not quantum compatible, Mlox is ready to be quantum compatible as soon as quantum computers become available (estimated 2024±50 years).
- 🛡️ **Web3 resistant**: Guaranteed to never implement blockchain features or mint NFTs (see "Security first").

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Go see the [online demo environment](https://github.com/miikalei/mlox) if you really want to see this in action. If you want to run it yourself, follow these steps.

### Prerequisites

- yarn
  ```sh
  npm install yarn@latest -g
  ```
- npm
  ```sh
  yarn install npm@latest -g
  ```
- node_modules folder with tons of stuff
- Fresh Linux build with `ENABLE_MLOX=1` build flag enabled
- A computer with electricity

### Example program

```typescript
fun fib(n) {
  if (n <= 1) return n;
  return fib(n - 2) + fib(n - 1);
}

for (var i = 0; i < 20; i = i + 1) {
  print fib(i);
}
```

### Running the program

To run a script,

```sh
yarn start example.mlox
```

To run in REPL,

```sh
yarn start
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Support for multiple files
- [ ] Compile time AI code completion
- [ ] Debugger
  - [ ] Better debugger

See the empty issues page (https://github.com/miikalei/mlox/issues) for a full list of proposed features and known issues (there are none).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/miikalei/mlox.svg?style=for-the-badge
[contributors-url]: https://github.com/miikalei/mlox/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/miikalei/mlox.svg?style=for-the-badge
[forks-url]: https://github.com/miikalei/mlox/network/members
[stars-shield]: https://img.shields.io/github/stars/miikalei/mlox.svg?style=for-the-badge
[stars-url]: https://github.com/miikalei/mlox/stargazers
[issues-shield]: https://img.shields.io/github/issues/miikalei/mlox.svg?style=for-the-badge
[issues-url]: https://github.com/miikalei/mlox/issues
[license-shield]: https://img.shields.io/github/license/miikalei/mlox.svg?style=for-the-badge
[license-url]: https://github.com/miikalei/mlox/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/miikaleinonen
[product-screenshot]: images/screenshot.png
