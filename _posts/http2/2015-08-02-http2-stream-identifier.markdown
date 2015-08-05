---
layout: post
title:  "RFC 7540(HTTP 2) Stream Identifiers"
date:   2015-08-02 05:29:00
categories: http2
description: http2의 Stream Identifiers
keywords: http, http2, Stream, Identifiers

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

## Stream Identifiers

스트림들은 31비트의 정수형 문자로 식별된다. 클라이언트에 의해서 생겨나는 stream의 식별자는 홀수로, 서버에 의해서 생기는 스트림은 짝수로해야한다.

stream의 식별자 0은 connection control을 위한 메세지에 사용된다. HTTP/2로 이동하기 위한 HTTP/1.1의 request는 stream identifier 0x1로 응답된다. HTTP/2로 버전업이 완료된 후에는 0x1의 stream 식별자는 클라이언트에게 half-closed (local)상태이다.
따라서, 0x1은 HTTP/1.1에서 버전업 된 클라이언트인 경우에 새로운 스트림의 식별자로 사용할 스 없다.

새롭게 만들어진 stream의 식별자는 수치적으로 다른 stream에 비해서 커야한다. 식별자는 HEADERS나 PUSH_PROMISE를 통해서 새로운 stream을 open또는 reserved 할 때 만들어진다.
알 수 없는 stream 식별자를 받은 endpoint는 *PROTOCOL_ERROR*의 connection error를 발생시킨다.

처음 새로 만든 stream의 식별자는 함축적으로 새로 만든 식별자에 비해 작은 숫자의 식별자들은  모두 closed 상태라고 생각한다.

stream 식별자는 재사용될 수 없다. 만약 할당할 수 있는 식별자를 전부 다 사용했다면, 클라이언트는 새로운 스트림을 만들 수 없다. 서버 또한 새로운 stream 식별자를 만들 수 없으면 *GOAWAY*를 전송해서 강제로 client에게 새로운 connection을 만들도록 하여 새롭게 stream을 제작할 수 있다.