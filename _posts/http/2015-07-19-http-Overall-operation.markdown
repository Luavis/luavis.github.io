---
layout: post
title:  "RFC 1945(HTTP 1.0) 전체적인 동작"
date:   2015-07-19 06:40:00
categories: http
description: http의 전체적인 동작방식
keywords: http, rfc 1945, overall operation, operation, http request, http response

---

![Http logo]({{ site_url }}/assets/http_logo.png)

두번째 파트에서는 HTTP의 전체적인 동작의 흐름에 대해서 정리해보았다.

*이 외의 RFC 1945 관련 문서*

1. [HTTP Terminology]({% post_url /http/2015-07-19-http-Terminology %})
1. [HTTP ABNF]({% post_url /http/2015-07-20-http-ABNF %})

---


## Request
request는 전 파트인 용어 설명에 번역되어 있듯이 클라이언트의 통신 요청이다. RFC 1945에서는 이때에 Request에 수반되는 data들의 항목에 대하여 나열해 놓고 있다.

* Reuqest 방법 (request method) i.e. GET, POST, HEAD

* URI (Uniform Resource Identifier)

* 프로토콜의 버전 (Protocol version)

이 뒤를 따라, 

* request modifiers가 포함되어 있는 MIME-like message

* 클라이언트 정보 (Client information)

* 받아드릴수 있는 body 내용 (Possible body content)

## Response

Response 또한 전 파트인 용어 설명에 번역되어 있듯이 서버가 클라이언트의 요청에 대한 답장이다. Response 또한 RFC 1945에서는 수반되는 data들의 항목에 대하여 나열해 놓고 있다.
, followed by a MIME-like message containing server information, 

* 상태 라인 (Status line)
    * 메세지의 프로토콜 버전 (message's protocol version)
    * 성공 혹은 실패  상태의 코드(success or error code)

* MIME타입의 메세지 (MIME-like message)
    * 서버 정보 (server information)
    * entity의 메타 정보 (entity metainformation)
    * 받아드릴수 있는 body 내용 (possible body content)
    
##일반적인 사례

<pre>
   request chain ------------------------&gt;
UA -------------------v------------------- O
   &lt;----------------------- response chain

UA: user-agent
O : Origin server
v : via Connection
</pre>

이 사례는 아무런 Gateway, Proxy, Tunnel등의 중간자 없이 User agent와 Origin server간의 통신을 보여주고 있는 diagram이다.

## 복잡한 사례

<pre>
   request chain --------------------------------------&gt;
UA -----v----- A -----v----- B -----v----- C -----v----- O
   &lt;------------------------------------- response chain

UA: user-agent
O : Origin server
v : via Connection
A, B, C : Tunnel, Gateway, Proxy, etc...
</pre>

위 사례는 일반적인 사례에 비해서는 여러 Proxy서버나 Tunnel, Gateway들이 중간에서 통신을 처리하는 구조이다, RFC 1945의 diagram에서는 위와같은 선형적인 구조를 취하고 있으나 실상은 그러지 않을 수 있다고 명시해두었다, 예를 들어 B는 다른 User agent를 같이 처리할 수 있고, A가 B 말고 C와 연결된 구조의 사례도 가능하다는 것이다.

