pragma solidity ^0.4.18;

contract A {

  event somethingA();

  function f() {
    somethingA();
  }
}

contract B is A {

  event somethingB();

  function f() {
    somethingB();
    super.f();
  }
}

contract C is A {

  event somethingC();

  function f() {
    somethingC();
    super.f();
  }
}

contract D is B, C {

  event somethingD();

  function f() {
    somethingD();
    super.f();
  }
}

contract invertedD is C, B {

  event somethingD();

  function f() {
    somethingD();
    super.f();
  }
}
