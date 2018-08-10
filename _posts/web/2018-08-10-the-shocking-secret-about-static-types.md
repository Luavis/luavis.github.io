---
layout: post
title: "Static type의 맹점"
date: 2018-08-10 11:07:00 +09:00
categories: web
description: "static typing은 정말 만병통치약인가?"
keywords: "Typescript, static type, static typing typing, duck typing, bug density, 버그, 타입스크립트, Javascript, 자바스크립트"

---

이 글은 "Programming JavaScript Applications" (O’Reilly)의 저자 [Eric Elliott](https://medium.com/@_ericelliott)의 [The Shocking Secret About Static Types](https://medium.com/javascript-scene/the-shocking-secret-about-static-types-514d39bf30a3)을 번역한 글 입니다.

*TL;DR*

**정말 버그를 줄이고 싶다면 TDD를 사용하세요. 멋진 툴과 함께 하고 싶은것 이라면 static type을 사용해보세요.**

## static type은 만병통치약인가?

Typescript의 인기는 폭발적으로 증가해왔습니다. 저는 Typescript와 static type을 좋아합니다.(사내 프로젝트를 Typescript로 진행했고 typing을 선호합니다.) 하지만 Typescript를 단순히 타입 시스템 때문에 사용하는 것이 아니라 다른 훌륭한 기능 때문에 사용합니다. Typescript는 명칭적 타이핑(Nominal)보다는 구조적 타이핑(Structural)에 가깝습니다.([Nominal typing과 Structural typing의 차이에 대해서](https://medium.com/@thejameskyle/type-systems-structural-vs-nominal-typing-explained-56511dd969f4)) 이 말인즉슨 타입의 이름이나 식별자를 기반으로 한 타입 시스템이라기 보다는 duck typing이 자동화되어 동작하는것에 가깝다는 의미입니다. 이는 Javascript와 같은 동적인 언어의 장점을 잘 살린 부분입니다.

사람들이 오해하는 것 중에 하나가 Typescript가 실제로 해결할 수 없는 문제를 해결해 줄 것이라 믿는 것 입니다.

Typescript의 가장 강한 강점으로 소개하는 내용은 "대규모의 웹 애플리케이션은 static type 없이는 힘들다." 입니다. Typesciprt를 통해 static type을 사용하면 `jump to definition`이나 `automatic refactoring`과 같은 기능을 사용할 수 있도록 만들어줍니다. 그리고 이런 기능은 우리의 생산성이 높아진 것처럼 느끼게 해줍니다.(그리고 실제로도 더 생산적이게 만들어 줍니다.)

하지만 많은 사람들은 static type을 사용하면 애플리케이션의 버그가 줄어드는데에 도움을 줄 것이라고 믿습니다. static type을 사용하면 중대한 버그는 잡을 수 있습니다. 이는 부정하기 힘든 사실입니다. 하지만 정말로 static type은 전반적으로 버그율을 낮추는데 도움이 될까요?

## static type은 거짓된 안정감을 줍니다.

두 가지의 [연구](https://labs.ig.com/static-typing-promise) [자료](http://macbeth.cs.ucdavis.edu/lang_study.pdf)에서 Github의 데이터를 사용해 얼마나 많은 버그율을 갖고 있는지 조사했습니다.

![](/assets/bug-density-100-stars.png)

> 확실히 말하기는 힘들지만 위 차트에서는 강력한 타입언어가 우리가 버그를 덜 만들도록 만들어 준다고 확신하기는 어렵다. -  Daniel Lebrero, "The Broken Promise of Static Typing"

좀 더 권위있는 연구에서는 Static type이 조금 더 도움이 된다고 이야기하고 있습니다: "A Large Scale Study of Programming Languages and Code Quality in Github" from Baishakhi Ray, Daryl Posnett, Vladimir Filkov, Premkumar T Devanbu, from UC Davis.

> 데이터를 통해서 절차지향 언어보다는 함수형 언어가, 약한 타이핑보다는 강한 타이핑이, 동적 타입보다는 정적 타입이 그리고 unmanaged memory보다는 managed memory가 더 버그를 적게 만든다는 것을 알 수 있다.

여기까지만 보면 Static type이 더 좋다는 이야기 같지만,

> 이 관계들은 통계적으로는 **중요하지만 영향도는 좀 적었다.**

제게도 static type이 버그를 줄이는데 중대한 역할을 한 경험적 증거가 없습니다. 개발자가 사용할 수 있는 멋진 개발툴과 static type은 실제로 전반적인 버그를 잡는데에 도움이 되지 않습니다.

## 타입의 정확도는 프로그램의 정확도를 보장하지 않습니다.

코드를 실제로 돌려보지 않고서는 이 코드가 진짜 동작할지 전혀 알 수가 없습니다. 물론 static type을 사용하면 변수가 선언되지 않았느지, object가 넘어가야할 함수 파라미터에 array가 넘어갔다던지 이런 문제는 해결할 수 있습니다. 하지만,

* 타입 체크만으로는 잡을 수 없는 버그가 수없이 많습니다. 그리고 ...
* 이걸 잡을 수 있는 다른 여러가지 방법이 있습니다.

## 그래서 정말로 버그를 잡을 수 있는 효과적인 방법은 뭔가요?

테스트 주도 개발!(Test Driven Development, TDD) 특히 테스트 우선 방법론!

	TDD만이 구원이다.

몇몇 좋은 연구에서 TDD의 효과에 대해서 이야기하고 있습니다. Microsoft, IBM, 그리고 Springer 같은 유명한 곳에서 나온 [연구](https://link.springer.com/article/10.1007%2Fs10664-008-9062-z)도 있습니다. Springer의 연구에서는 비슷한 두 프로젝트 중에서 테스트 우선적인 방법을 사용해서 개발한 프로젝트가 40%-90%의 버그가 줄어들었다고 합니다. 테스트를 우선해서 개발했을 때와 테스트를 개발 후에 했을때, 테스트를 전혀 안 했을때를 비교한 Springer 이외의 다른 [연구에서도](https://www.computer.org/csdl/mags/so/2007/03/s3024.pdf) 비슷한 결과를 보여줍니다. 특히 테스트 우선 개발시에는 탁월한 버그 감소율을 보여주는데 40%-80%의 버그가 줄어듭니다.

TDD야 말로 버그를 반으로 줄여주는 가장 효과적인 방법입니다. 그리고 이 주장을 뒷받침해주는 많은 사례들이 있습니다.

## 그래서 Typescript를 쓰지 말라는 말인가?

그럼에도 우리는 static type을 사용하고 싶습니다. 그러나 이 선택지를 고르는 이유가 Typescript가 주는 굉장한 기능들 때문이여야하지 버그를 잡아줄 것이라 기대하면서 사용하면 안됩니다.

standard javascript에 타입 표시 기능을 추가한 [rtype](https://github.com/ericelliott/rtype)에 영향을 받은 Typescript의 첫 인상은 굉장했습니다. 하지만 사용을 적극 권장하지 않는데에는 몇 가지 이유가 있습니다.

코드를 Typescript로 작성하기에는 거부감이 드는것은 단지 ECMAScript 표준과 Typescript와 키워드, 타입 기능들이 충돌하는 것 때문이 아닙니다.(`interface`와 `implements`와 같은 키워드)

Typescript의 장점 중 하나는 이런 충돌이 생긴다 하더라도, 컴파일러가 충분히 번역해서 ECMAScript에 맞는 표준으로 다르게 컴파일 할 수 있다는 점입니다. 하지만 단점으로는 Javascript 표준으로 더 이상 작성하지 않는다는 점입니다. 제 예상으로는 Typescript가 Javascript의 superset자리를 계속 유지한다기 보다는 다른 형태로 갈라져 나올것이라 생각합니다.

그리고 제게는 이 부분이 굉장히 걱정하는 부분입니다. Javascript를 가르치는 입장에서 많은 개발자들이 사용하는 다양한 개발툴과 개발 프레임워크에 적용가능한 것을 가르치고 싶습니다. 여러분은 이런 점을 걱정하지 않겠지만, 여러분의 코드는 다른 개발자에게도 읽고 배우기 쉬워야하고 무엇보다 그 코드에 기여하기 쉬워야합니다. 당신 혼자는 Typescript에 적응했을지 모르지만 그 외의 다른 사람들은 Typescript에 적응하기 어려울 수 있습니다.

지금 당장에는 엄청난 속도로 Typescript가 성장해나가고 있지만, 전체 Javascript의 환경에 비해서는 아직 작습니다. 심지어 jQuery보다도. 물론 성장해 나아가는 속도는 놀랍고, Javascript로 컴파일 가능한 대체제(Coffeescript, ...) 중에서는 지배적인 위치에 다다랐습니다.

어떤 도구는 단점을 알고도 사용하기에 가치있지만, Typescript는 제게는 지금 당장 사용하기엔 올바르지 않은것 같습니다. 하지만 MS의 Code와 Typescript의 궁합은 한 번쯤은 사용해봐도 좋습니다. 맘에 들것을 확신합니다.

## Conclusion

버그를 줄여주는 점을 강점으로 보기에는

**Static type는 과대평가되어 있습니다.**

그러나 다른 기능들과 함께 보면 static type은 여전히 멋지고 사용하기에 가치가 있습니다.
결론을 내자면,

### 정말 버그를 줄이고 싶다면 TDD를 사용하세요. 멋진 툴과 함께 하고 싶은것 이라면 static type을 사용해보세요.
