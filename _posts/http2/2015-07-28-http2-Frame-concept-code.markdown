---
layout: post
title:  "RFC 7540(HTTP 2) Frame code"
date:   2015-07-28 00:23:00
categories: http2
description: http2의 전체적인 동작방식
keywords: http, http2, rfc 7540, frame, poc, code

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---


[HTTP2 Frame]({% post_url 2015-07-25-http2-Frame %})

HTTP2의 Frame에 대해서 공부하고 포스팅 안한 부분에 대한 공부까지 합쳐서 일단 코드를 짜고 보았다. 개인적으로 Flow control을 보고 있지만 빠른 시간내로 포스팅 할 것을 목표로하고 일단 코드를 써봤는데..

{% gist 3119e73646c6686bddf7 %}

python으로 작성했고 Frame이란 클래스를 작성하여 추후에 코드 재사용을 목표로 하고는 있지만...

여튼 frame의 사이즈 제한 정책에 따라 data를 설정할 때 maximum size보다 사이즈가 클 경우에는 exception raise가 된다.
그리고 바이트 단위의 컨트롤을 쉽게 하기위하여 bytearray를 사용했는데 잘한건지에 대한 확신이 없다. length나 id 값들을 설정할 때는 바이트 단위로 잘 짜르기 위해서 and 연산자와 shift연산자로 잘게 잘게 잘라서 결과물 buffer에 차곡차곡 append 시키는 구조이다.
