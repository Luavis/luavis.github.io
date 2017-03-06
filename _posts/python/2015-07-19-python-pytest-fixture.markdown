---
layout: post
title:  "Python pytest fixture"
date:   2015-07-19 14:12:00
categories: python
description: pytest fixture
keywords: pyetst, fixture

---

![pytest]({{ site_url }}/assets/pytest.png)

우리가 흔히 사용하는 라이브러리에서는 일반적으로  unit test기반의 테스팅 파일을 설치시 정상적인 설치가 되었는지 또 라이브러리를 PR할 시에 이 라이브러리의 확장이 버그 없이 확장된것인지를 확인해주기 위해서 함께 업로드해 준다. python에서는 보통 Pytest를 사용하는데, 그 중 Fixture 기능에대해서 정리해보기 위해 Pytest 공식 사이트의 latest 버전의(2.4) fixture 기능에 대해 나와있는 [페이지](https://pytest.org/latest/fixture.html)를 번역해 보기로 했다.

*이 외의 pytest 관련 문서*

1. [Python hook]({% post_url /python/2015-07-19-python-pytest-hook %})
1. [Pytest with unittest]({% post_url /python/2015-07-21-python-pytest-with-unittest %})

----

test fixture의 목적은 신뢰되고 반복적으로 실행되는 테스팅에서 고정된 기반을 만들어주는것이다. pytest fixtures setup/teardown 함수가 제공되는 일반적인 xUnit 스타일을 활용하여 성능 향상을 보여준다.

* fixtures는 표현적인(explicit) 이름을 갖고 있고, 함수하나 혹은 클래스, 모듈, 전체 프로젝트 내에서 사용할 수 있도록 선언하여 사용할 수 있다.

* fixture는 모듈 방식에서 구현되고, fixture함수는 다른 fixture함수를 사용할 수 있으며, fixture는 fixture의 이름으로 호출된다.

* fixture은 단순한 유닛에서 부터(unit of unittesting) 함수 하나하나를 테스팅하도록 파라미터화한 fixture와 test의 configuration과 component options를 통하여 범위를 관리할 수 있다. 또한 fixture의 재사용은 클래스, 모듈 혹은 전 테스팅 세션에서 재사용이 가능하다.

추가로, pytest는 일반적인 xunit style의 setup을 계속 지원한다. 우리는 이 고전적인 방식에서 새로운 스타일로 옮겨가면서 두가지를 혼용해서 사용할 수 있다.(주: new style로 옮겨주길 바라는거 같다.) 또한 원한다면 이미 있는 unittest.TestCase 혹은 nose based projects에서 바로 시작할 수 있다.

> ###Note
>
> integration and more linear writing of teardown code. pytest-2.4는 추가로 context 관리의 통합과 teardown code를 더 선형적으로 작성할 수 있도록 만들어주는 *yield* fixture mechanism에 대해서 소개하고 있다.(*experimental*)

## Fixtures as Function arguments

Test function들은 fixture object들을 매개변수의 이름을 통하여 받을수 있다. 각각의 매개변수 이름은 fixture의 이름이다. fixture function들은 *@pytest.fixture* decorator를 통하여 등록할 수 있다. 간단한 예제를 우선 보자.

*test_smtpsimple.py*
{% highlight python linenos %}
import pytest

@pytest.fixture
def smtp():
    import smtplib
    return smtplib.SMTP("merlinux.eu")

def test_ehlo(smtp):
    response, msg = smtp.ehlo()
    assert response == 250
    assert 0 # for demo purposes

{% endhighlight %}

여기서 *test_ehlo* 테스트 함수는 *smtp fixture*를 갖는다. pytest는 이를 찾고 *@pytest.fixture*가 마크되어있는 *stmp*함수를 호출하게 된다. 테스트를 실행하게 되면 아래와 같은 출력화면을 볼 수 있다.

    $ py.test test_smtpsimple.py
    =========================== test session starts ============================
    platform linux -- Python 3.4.1 -- py-1.4.27 -- pytest-2.7.1
    rootdir: /tmp/doc-exec-98, inifile:
    collected 1 items

    test_smtpsimple.py F

    ================================= FAILURES =================================
    ________________________________ test_ehlo _________________________________

    smtp = <smtplib.SMTP object at 0x7f9d45764c88>

    def test_ehlo(smtp):
        response, msg = smtp.ehlo()
        assert response == 250
    >       assert 0 # for demo purposes
    E       assert 0

    test_smtpsimple.py:11: AssertionError
    ========================= 1 failed in 1.07 seconds =========================

failure traceback를 보면 우리는 test 함수가 fixture function에 의해서 *smtplib.SMTP()*가 호출되고 이로 인해 만들어진 인스턴스인 smtp 매개변수를 통하여 smtp fixture를 호출한 것을 볼 수 있다. test function은 출력 결과를 보기 위해 의도적으로 설치한 assert 0으로 인하여 fail 하게 되었다.

pytest가 위의 test_elho function을 호출하는 방법에 대해서 정확하게 서술해보았다.

 1. pytest는 test_가 접두사(prefix)로 되어 있기 떄문에 test_elho를 찾을것이다. 이 test function은 smtp라는 이름의 함수 매개변수를 필요로한다. fixture-marked된 함수들중에서 smtp라는 이름의 fixture function을 찾는다.

 1. *smtp()*를 호출하고 return instance를 받는다.

 1. *test_ehlo()*는 호출되고 테스트 함수 내에서 실패했다.(assert 0 떄문에)

    주의할 점은 만약 우리가 함수의 매개변수를 잘못 입력하였거나 혹은 원하는 기능이 사용불가능한 상태이면, 당연히 에러가 발생할 것이다.


> ###Note
>
> 언제나 --fixtures를 이용하여
>
> *py.test --fixtures test_simplefactory.py*
>
> 사용가능한 fixture들을 확인할 수 있다.
>
> 2.3 버전 이전에는 @pytest.fixture decorator가 없었다. pytest_funcarg__NAME prefix를 사용하여 fixture임을 표기할 수 있었다. 이 기능은 남아 있으나, 더 이상 권장하지는 않는다.

##“Funcargs” a prime example of dependency injection

fixtures를 test function에 적용하기 위해서는 pytest-2.0에서는 현재까지 사용되고 있는 “funcargs” or “funcarg mechanism”를 소개하고 있다. pytest-2.3에서부터는 더 많은 방법이 있지만 “funcargs”가 가장 주로  test function의 dependency를 직접적으로 설정하는 방법이다.

## Sharing a fixture across tests in a module (or class/session)

네트워크 연결을 필요로 하는 Fixture 연결성에 의존하게 되고 연결 생성에 시간적 비용이 많이 드는 경우가 흔하다.
이 전의 예제를 확장하여 우리는 *scope="module"* 매개변수를 @pytest.fixture에 추가하여 module 내에서 한 번만 실행하도록 설정할 수 있다. 한 test module 내에 복수의 test function에서 사용하더라도 같은 stmp fixture instance를 받을 수 있다.
다음 예제는 fixture function을 conftest.py라는 test function 과는 분리된 파일에 넣어 다른 test module에서도 접근할 수 있도록 했다.

*conftest.py*
{% highlight python linenos %}
import pytest
import smtplib

@pytest.fixture(scope="module")
def smtp():
    return smtplib.SMTP("merlinux.eu")
{% endhighlight %}

fixture의 이름은 다시 한번 smtp로 하였고 conftest.py가 위치한 directory 혹은 그 하위 directory에 있는 test function 혹은 다른 fixture function에서 접근할 수 있다.

*test_module.py*
{% highlight python linenos %}

def test_ehlo(smtp):
  response = smtp.ehlo()
  assert response[0] == 250
  assert "merlinux" in response[1]
  assert 0  # for demo purposes

def test_noop(smtp):
  response = smtp.noop()
  assert response[0] == 250
  assert 0  # for demo purposes

{% endhighlight %}

우리는 의도적으로 어떻게 진행되고 있는지 분석하기 위해서 *assert 0* 구문을 추가하였다. 그리고 테스트를 실행하면:

    $ py.test test_module.py
    =========================== test session starts ============================
    platform linux -- Python 3.4.1 -- py-1.4.27 -- pytest-2.7.1
    rootdir: /tmp/doc-exec-98, inifile:
    collected 2 items

    test_module.py FF

    ================================= FAILURES =================================
    ________________________________ test_ehlo _________________________________

    smtp = <smtplib.SMTP object at 0x7fb558b12240>

        def test_ehlo(smtp):
            response = smtp.ehlo()
            assert response[0] == 250
    >       assert "merlinux" in response[1]
    E       TypeError: Type str doesn't support the buffer API

    test_module.py:5: TypeError
    ________________________________ test_noop _________________________________

    smtp = <smtplib.SMTP object at 0x7fb558b12240>

        def test_noop(smtp):
            response = smtp.noop()
            assert response[0] == 250
    >       assert 0  # for demo purposes
    E       assert 0

    test_module.py:11: AssertionError
    ========================= 2 failed in 0.82 seconds =========================


여기서 우리는 두 개의 *assert 0*을 볼 수 있다. 그리고 더 중요한 것은 동일 모듈 범위 내에서 pytest가 traceback을 통하여 보여준 매개변수로부터 smtp object가 공유되고 있다는 것 또한 볼 수 있다는 것이다.(같은 object hash 값을 갖고 있다[0x7fb558b12240]) 결과적으로 smtp를 사용하고 있는 두 개의 test functions은 하나의 재사용된 같은 smtp instance를 사용하여 더 빠르게 동작한다.
두 개의 assert 0을 볼 수 있다. 그리고 더 중요한 것은 동일 모듈 범위 내에서 pytest가 traceback을 통하여 보여준 매개변수로부터 smtp object가 공유되고 있다는 것 또한 볼 수 있다는 것이다.(같은 object hash 값을 갖고 있다[0x7fb558b12240]) 결과적으로 smtp를 사용하고 있는 두 개의 test functions은 하나의 재사용된 같은 smtp instance를 사용하여 더 빠르게 동작한다.

만약 이것을 모듈 범위가 아닌 테스트의 전체 세션에서 동작하는 편이 더 좋다고 결정했다면. 간단하게 선언할 수 있다.

{% highlight python linenos %}
@pytest.fixture(scope="session")
def smtp(...):
    # the returned fixture value will be shared for
    # all tests needing it
{% endhighlight %}

## fixture finalization / executing teardown code

pytest는 fixture가 지정 구역을 벗어날때에 특정 종결자를(finalization) 호출하는 것을 지원한다. fixture function 내에서 *request* 객체를 이용하여 *request.addfinalizer*를 한번 혹은 여러번 호출하여 이용할 수 있다.

*conftest.py*
{% highlight python linenos %}
import smtplib
import pytest

@pytest.fixture(scope="module")
def smtp(request):
    smtp = smtplib.SMTP("merlinux.eu")
    def fin():
        print ("teardown smtp")
        smtp.close()
    request.addfinalizer(fin)
    return smtp  # provide the fixture value
{% endhighlight %}

이 *fin* 함수는  모듈의 마지막에서 테스트 시에 테스트가 끝나면 실행 될 것이다.

test를 실행해보자:

    $ py.test -s -q --tb=no
    FFteardown smtp

    2 failed in 1.44 seconds

우리는 smtp 인스턴스가 두개의 테스트 이후에 종결되는것을 볼 수 있다. 주의할 점은 scope='function'으로 데코레이션 했다면, setup(테스트 시작전의 fixture)과 finalize가 매 테스트 함수마다 실행될 것이다.

## Fixtures can introspect the requesting test context

Fixture function는 *request* 객체를 받아서 test function, class 혹은 module에게 "요청"할 수 있다. 이전에서 확인한 smtp fixture를 더 확장하여, 테스트 모듈로 부터 추가적인 서버의 URL을 fixture를 이용하여 읽어보자.

*conftest.py*
{% highlight python linenos %}
import pytest
import smtplib

@pytest.fixture(scope="module")
def smtp(request):
    server = getattr(request.module, "smtpserver", "merlinux.eu")
    smtp = smtplib.SMTP(server)

    def fin():
        print ("finalizing %s (%s)" % (smtp, server))
        smtp.close()

    return smtp
{% endhighlight %}

우리는 *request.module*를 사용하여 test 모듈로부터 optional하게 *smtpserver* attribute를 받아온다, 없다면 merlinux.eu로 설정 될 것이다. test_module.py를 다시 test해봐도 바뀐것은 없을것 이다.

    $ py.test -s -q --tb=no
    FF
    2 failed in 0.62 seconds

이제 다시 새로운 test모듈을 작성해서 모듈에 server URL을 실제로 설정해보자.

*test_anothersmtp.py*

{% highlight python linenos %}
smtpserver = "mail.python.org"  # will be read by smtp fixture

def test_showhelo(smtp):
    assert 0, smtp.helo()
{% endhighlight %}

위 코드를 test하면:

    $ py.test -qq --tb=short test_anothersmtp.py
    F
    ================================= FAILURES =================================
    ______________________________ test_showhelo _______________________________
    test_anothersmtp.py:5: in test_showhelo
        assert 0, smtp.helo()
    E   AssertionError: (250, b'mail.python.org')
    E   assert 0

smtp fixture가 모듈에 선언되어 있던 mail server 이름을 사용하였다.
