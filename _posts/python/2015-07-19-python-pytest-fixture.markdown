---
layout: post
title:  "Python pytest fixture"
date:   2015-07-19 14:12:00
categories: python

---

![pytest]({{ site_url }}/assets/pytest.png)

우리가 흔히 사용하는 라이브러리에서는 일반적으로  unit test기반의 테스팅 파일을 설치시 정상적인 설치가 되었는지 또 라이브러리를 PR할 시에 이 라이브러리의 확장이 버그 없이 확장된것인지를 확인해주기 위해서 함께 업로드해 준다. python에서는 보통 Pytest를 사용하는데, 그 중 Fixture 기능에대해서 정리해보기 위해 Pytest 공식 사이트의 latest 버전의(2.4) fixture 기능에 대해 나와있는 [페이지](https://pytest.org/latest/fixture.html)를 번역해 보기로 했다.

===

test fixture의 목적은 신뢰되고 반복적으로 실행되는 테스팅에서 고정된 기반을 만들어주는것이다. pytest fixtures setup/teardown 함수가 제공되는 일반적인 xUnit 스타일을 활용하여 성능 향상을 보여준다.

* fixtures는 표현적인(explicit) 이름을 갖고 있고, 함수하나 혹은 클래스, 모듈, 전체 프로젝트 내에서 사용할 수 있도록 선언하여 사용할 수 있다.

* fixture는 모듈 방식에서 구현되고, fixture함수는 다른 fixture함수를 사용할 수 있으며, fixture는 fixture의 이름으로 호출된다.

* fixture은 단순한 유닛에서 부터(unit of unittesting) 함수 하나하나를 테스팅하도록 파라미터화한 fixture와 test의 configuration과 component options를 통하여 범위를 관리할 수 있다. 또한 fixture의 재사용은 클래스, 모듈 혹은 전 테스팅 세션에서 재사용이 가능하다.

추가로, pytest는 일반적인 xunit style의 setup을 계속 지원한다. 당신은 이 고전적인 방식에서 새로운 스타일로 옮겨가면서 두가지를 혼용해서 사용할 수 있다.(주: new style로 옮겨주길 바라는거 같다.) 또한 원한다면 이미 있는 unittest.TestCase 혹은 nose based projects에서 바로 시작할 수 있다. 

> ###Note
>
> integration and more linear writing of teardown code. pytest-2.4는 추가로 context 관리의 통합과 teardown code를 더 선형적으로 작성할 수 있도록 만들어주는 *yield* fixture mechanism에 대해서 소개하고 있다.(*experimental*)
