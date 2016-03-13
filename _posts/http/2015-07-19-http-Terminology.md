---
layout: post
title:  "RFC 1945(HTTP 1.0) 용어 설명"
date:   2015-07-19 06:19:00
categories: http
description: http 용어 설명
keywords: http, rfc 1945, terminology

---

![Http logo]({{ site_url }}/assets/http_logo.png)

*이 외의 RFC 1945 관련 문서*

1. [HTTP overall operation]({% post_url 2015-07-19-http-Overall-operation %})
1. [HTTP ABNF]({% post_url 2015-07-20-http-ABNF %})

---

우리가 지금 사용하고 있는 웹에서 가장 흔하게 볼 수 있는 프로토콜 중 하나를 뽑으라 하면 대부분의 개발자들이 주저없이 HTTP를 선택할 것이다.
이 HTTP의 기본적인 사양을 내포하고 있는 버전인 1.0을 이번에 공부하기 위해 HTTP/1.0의 spec들에 관하여 서술하고 있는 RFC 1945를 공부해보기로 했다.

처음으로는 Terminology, 용어에 관한 설명부분에서 부터 시작한다.

* Connection : 서로 통신 목적을 갖고 있는 두개의 애플리케이션 사이에 설치된 가상 통신 회로
* Message : HTTP 통신의 기본 유닛, 커넥션을 통하여 전달되는 구조가 있음. Section 4에 설명되어 있음 (Simple request, Simple Response, Full request, Full response)

    <pre>
    Full-Request   = Request-Line              ; Section 5.1
                    *( General-Header         ; Section 4.3
                        | Request-Header         ; Section 5.2
                        | Entity-Header )        ; Section 7.1
                    CRLF
                    [ Entity-Body ]           ; Section 7.2
    Full-Response  = Status-Line               ; Section 6.1
                    *( General-Header         ; Section 4.3
                        | Response-Header        ; Section 6.2
                        | Entity-Header )        ; Section 7.1
                    CRLF
                    [ Entity-Body ]           ; Section 7.2
    Simple-Request  = "GET" SP Request-URI CRLF
    Simple-Response = [ Entity-Body ]
    </pre>
* Request : 통신 요청
* Response : 통신 응답
* Resource : URI(Uniform Resource Identifier)로 구분될수 있는 네트워크 데이터 객체 혹은 서비스
* Entity : 특정한 request와 response에 대한 리소스의 표현
* Client : 요청을 보내기 위해 연결된 애플리케이션 프로그램
* User agent : request를 보내는 client, 브라우저, 에디터, 봇 그외 툴들에 해당한다.
* Server : Request에 대한 Response를 다시 보내는 애플리케이션
* Origin server : resource가 원래 존재하거나, 만들어진 서버
* Proxy : 여러 다른 클라이언트를 대표하여 보내는 프로그램, request 해석하고 필요시 재구성함.
* Gateway : 클라이언트는 모르게 설정되는 proxy (Gateways are often used as server-side portals through network firewalls and as protocol translators for access to resources stored on non-HTTP systems.)
* Tunnel : 두 connection사이에 동작하는 blind relay이다.
* Cache : 프로그램의 로컬에 response의 message를 저장해둠, 그리고 시스템에서 이를 저장 삭제 재 요청을 관리함. 캐시는 향후 생기는 response time과 network bandwidth 소비를 줄이기 위하여 캐시 가능한 response를 캐싱함. 클라이언트와 서버 둘다 캐시를 갖을 수 있음, tunnel을 사용하고 있는 서버는 캐싱을 할 수 없다.
