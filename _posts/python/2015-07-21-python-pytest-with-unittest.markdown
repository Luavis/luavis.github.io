---
layout: post
title:  "Python pytest with unittest"
date:   2015-07-21 19:27:00
categories: python
description: pytest with uniitest
keywords: pyetst, unittest

---

<img src="{{ site_url }}/assets/pytest.png" class="sm-img">

*이 외의 pytest 관련 문서*

1. [Python fixture]({% post_url /python/2015-07-19-python-pytest-fixture %})
1. [Python hoook]({% post_url /python/2015-07-19-python-pytest-hook %})

--

## @pyetst.mark.userfixture

pytest는 pythons에서 기본지원하는 unittest와의 연동을 지원한다. 예를들어 pytest의 fixture를 unittest에서 사용할 수 있다. 그래서 아래와 같은 예제를 만들어 보았다.


    import pytest
    import unittest

    @pytest.fixture(scope="class")
    def fixt_test(request):
      request.cls.test = "Test fixture with unittest"


    @pytest.mark.usefixtures("fixt_test")
    class Unittest(unittest.TestCase):
      def test_case(self):

        assert 0, self.test

이 코드를  py.test 명령어를 이용하여 실행 할 때:

    $ py.test
    ============================================== test session starts ===============================================
    platform darwin -- Python 2.7.6 -- py-1.4.30 -- pytest-2.7.2
    rootdir: /Users/Luavis/Projects/pytest-examples, inifile:
    collected 1 items

    test_unittest.py item
    <TestCaseFunction 'test_case'>
    call
    <CallInfo when='setup' result: []>
    item
    <TestCaseFunction 'test_case'>
    call
    <CallInfo when='call' exception: Test fixture with unittest
    assert 0>
    Fitem
    <TestCaseFunction 'test_case'>
    call
    <CallInfo when='teardown' result: ['tear down test']>


    ==================================================== FAILURES ====================================================
    _______________________________________________ Unittest.test_case _______________________________________________

    self = <test_unittest.Unittest testMethod=test_case>

        def test_case(self):

    >     assert 0, self.test
    E     AssertionError: Test fixture with unittest
    E     assert 0

    test_unittest.py:14: AssertionError
    ============================================ 1 failed in 0.03 seconds ============================================

