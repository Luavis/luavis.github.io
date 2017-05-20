---
layout: post
title:  "Changing standard (Python) test discovery"
date:   2015-07-25 01:17:00
categories: python
description: Changing standard (Python) test discovery
keywords: pyetst, change, test file, directory

---

<img src="{{ site_url }}/assets/pytest.png" class="sm-img">

*이 외의 pytest 관련 문서*

1. [Python fixture]({% post_url /python/2015-07-19-python-pytest-fixture %})
1. [Python hoook]({% post_url /python/2015-07-19-python-pytest-hook %})

---

## Changing directory recursion

ini-file에 *norecursedirs*을 이용하여 테스팅 파일 찾는 것을 막을수 있다. setup.cfg가 프로젝트의 루트 폴더에 있다면:

*content of setup.cfg*

    [pytest]
    norecursedirs = .svn _build tmp*

이를 통하여 .svn이나 tmp가 붙는 directory에는 접근하지 않는다.


## Changing naming conventions

테스트 코드를 찾는 naming convention을 변경할 수도 있는데,


*content of setup.cfg*

    # can also be defined in in tox.ini or pytest.ini file

    [pytest]
    python_files=check_*.py
    python_classes=Check
    python_functions=*_check

이렇게 구현하면 check_로 시작하는 python파일들을 찾아 테스트하고 그중에서도 클래스 이름에는 Check가 포함되어야하고, ```_check```가 뒤에 붙은 함수만을 테스트 실행한다.

*content of check_myapp.py*
{% highlight python linenos %}

class CheckMyApp:
    def simple_check(self):
        pass
    def complex_check(self):
        pass

{% endhighlight %}

collect-only 옵션과 함께 테스트를 시도하면:

    $ py.test --collect-only
    =========================== test session starts ============================
    platform linux -- Python 3.4.1 -- py-1.4.27 -- pytest-2.7.1
    rootdir: /tmp/doc-exec-160, inifile: setup.cfg
    collected 2 items
    <Module 'check_myapp.py'>
      <Class 'CheckMyApp'>
        <Instance '()'>
          <Function 'simple_check'>
          <Function 'complex_check'>

    =============================  in 0.01 seconds =============================

## Interpreting cmdline arguments as Python packages

--pyargs 옵션을 이용하여 pytest 가 읽어드린 이름을 python의 패키지 이름으로 해석하고, 패키지이름을 파일시스템에서 찾이 가져오게된다.
아래와 같은 식으로 package를 잡으면:

    py.test --pyargs unittest2.test.test_skipping -q

unittest2.test.test_skipping 테스트 모듈을 찾아서 테스팅을 시도한다.

---

pytest.ini 파일에 addopts 설정을 이용하여 영구히 설정하는것 또 가능하다.

*content of pytest.ini*

    [pytest]
    addopts = --pyargs

```py.test NAME```인 형태를 이용할 수 있다. 다만 NAME이 실질적으로 존재하는지에 대해서 확인해야합니다.

> Note:
>
> 어떤 파일의 어떤 함수를 테스트 파일들로 찾았는지 알기 위해서 --collect-only flag를 이용하여 아래와 같이 확인 할 수 있다.

    $ py.test --collect-only pythoncollection.py
    =========================== test session starts ============================
    platform linux -- Python 3.4.1 -- py-1.4.27 -- pytest-2.7.1
    rootdir: /tmp/sandbox/pytest/doc/en, inifile: pytest.ini
    collected 3 items
    <Module 'example/pythoncollection.py'>
      <Function 'test_function'>
      <Class 'TestClass'>
        <Instance '()'>
          <Function 'test_method'>
          <Function 'test_anothermethod'>

    =============================  in 0.01 seconds =============================

## customizing test collection to find all .py files

만약 모든 .py 파일을 테스팅 파일로 추가하고 싶다면 위에 나온 방식을 활용하여 아래와 같이 구현하면 된다:

*content of pytest.ini*

{% highlight python linenos %}
[pytest]
python_files = *.py

{% endhighlight %}

하지만 setup.py가 추가되고 싶지 않다면, conftest.py에서 제외할 수 있습니다:

*content of conftest.py*
{% highlight python linenos %}
import sys

collect_ignore = ["setup.py"]
if sys.version_info[0] > 2:
    collect_ignore.append("pkg/module_py2.py")
{% endhighlight %}
