---
layout: post
title:  "Python pytest easy to start"
date:   2015-07-25 00:37:00
categories: python
description: About how to start pytest
keywords: pyetst, easy to start

---

![pytest]({{ site_url }}/assets/pytest.png)

*이 외의 pytest 관련 문서*

1. [Python fixture]({% post_url /python/2015-07-19-python-pytest-fixture %})
1. [Python hoook]({% post_url /python/2015-07-19-python-pytest-hook %})

---

## 설치

설치는 pip이나 easy_install 같은 명령어를 이용하여 설치할 수 있다.

    pip install -U pytest # or
    easy_install -U pytest
    
설치 후 올바른 버전이 설치되었는지를 확인해보기 위해서는

    $ py.test --version

*--version* 옵션을 이용하여 확인할 수 있다.

Our first test run
Let’s create a first test file with a simple test function:
간단하게 첫 테스트를 시도해보면, 

*content of test_sample.py*
{% highlight python linenos %}
def func(x):
    return x + 1

def test_answer():
    assert func(3) == 5
{% endhighlight %}

위 *test* 함수가 테스트의 목표가 될 함수이고 *test_answer* 함수가 테스트 함수이다.

    $ py.test
    =========================== test session starts ============================
    platform linux -- Python 3.4.1 -- py-1.4.27 -- pytest-2.7.1
    rootdir: /tmp/doc-exec-101, inifile:
    collected 1 items

    test_sample.py F

    ================================= FAILURES =================================
    _______________________________ test_answer ________________________________

        def test_answer():
    >       assert func(3) == 5
    E       assert 4 == 5
    E        +  where 4 = func(3)

    test_sample.py:5: AssertionError
    ========================= 1 failed in 0.01 seconds =========================

*py.test* 명령어를 이용하여 testing을 시작할 수 있고 func의 결과가 4인것에 비해 assert에서 비교가 5임으로, 에러가 발생할 수 있다.

    Note
        You can simply use the assert statement for asserting test expectations. pytest’s Advanced assertion introspection
        will intelligently report intermediate values of the assert expression freeing you from the need to learn the
        many names of JUnit legacy methods.
        Asserting that a certain exception is raised

If you want to assert that some code raises an exception you can use the raises helper:
만약 예외가 발생하는 코드를 테스팅한다면, *raise helper*를 사용하여 테스팅 할 수 있다.

*content of test_sysexit.py*
{% highlight python linenos %}
import pytest
def f():
    raise SystemExit(1)

def test_mytest():
    with pytest.raises(SystemExit):
        f()
{% endhighlight %}
Running it with, this time in “quiet” reporting mode:
이번에는 quit모드를(non-verbose) 사용해보자.

    $ py.test -q test_sysexit.py
    .
    1 passed in 0.01 seconds

예외가 발생하였으나 테스트는 통과했음을 알 수 있다.

## Grouping multiple tests in a class

두개의 테스팅함수를 포함한 클래스를 실행해보자.

*content of test_class.py*
{% highlight python linenos %}
class TestClass:
    def test_one(self):
        x = "this"
        assert 'h' in x

    def test_two(self):
        x = "hello"
        assert hasattr(x, 'check')
{% endhighlight %}

 py.test는 2개의 테스트 함수를 기본적인 컨벤션에 부합함으로 찾아낼 것 이다.

    $ py.test -q test_class.py
    .F
    ================================= FAILURES =================================
    ____________________________ TestClass.test_two ____________________________

    self = <test_class.TestClass object at 0x7fbf54cf5668>

        def test_two(self):
            x = "hello"
    >       assert hasattr(x, 'check')
    E       assert hasattr('hello', 'check')

    test_class.py:8: AssertionError
    1 failed, 1 passed in 0.01 seconds

당연히 str type에는 check라 하는 attribute가 없음으로 assert fail이 됨을 확인 할 수 있다.
