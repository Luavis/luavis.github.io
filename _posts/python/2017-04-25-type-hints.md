---
layout: post
title:  "빠르게 배우는 python static type check"
date:   2017-04-25 00:59:00 +09:00
categories: python
description: Python 3.6에서 static type check 사용하기
keywords: python, strong, type, language, pep 484. pep 526, type hints, type check, 타입, 확인

---

파이썬의 장점이자 단점중 하나는 모든 변수의 타입이 [Dynamic type](https://en.wikipedia.org/wiki/Type_system#Dynamic_type_checking_and_runtime_type_information)이라는 점입니다. 파이썬의 변수타입은 변수가 할당되는 시점에서 결정됩니다.

```python
name = "Luavis"
print(type(name)) # <class: 'str'>
```

위의 경우에는 문자열인 `"Luavis"`가 `name`에 할당되었고 `name`변수는 `str`타입을 갖게 됩니다.

