---
layout: post
title:  "RFC 7540(HTTP 2) Frame size and header compression"
date:   2015-07-25 10:15:00
categories: http2
description: http2의 전체적인 동작방식
keywords: http, http2, rfc 7540, frame

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

## Frame Size

frame의 payload의 최대 사이즈는 수신자 측의 *SETTINGS_MAX_FRAME_SIZE*만큼으로 제한되어 있다. 이 설정은 2^14 (16,384)과 2^24-1 (16,777,215) 값 사이에 정해져야한다. 

모든 HTTP/2.0의 구현체는 9바이트의 frame 헤더와 2^14바이트의 payload의 길이를 최소한 받을 수 있어야한다. frame header의 크기는 frame 사이즈에 포함되어 있지 않다.

> Note:
> 
> *PING*과 같은 frame의 타입은 payload data의 사이즈에는 프레임에 따라 정해진 한계가 필요로 한다.

만약 *SETTINGS_MAX_FRAME_SIZE*에 정의된 사이즈에 비해 더 큰 사이즈의 frame이 들어온거나, 들어와야하는 frame data의 사이즈에 비해 적게 들어왔다면 FRAME_SIZE_ERROR를 보낸다. 전체 커넥션의 상태를 좌우할 수 있는 frame이라면, 사이즈 에러는 connection error로 다뤄진다. 이런 frame은 header block을 옮기는 frame 같은(*HEADERS*, *PUSH_PROMISE*, and *CONTINUATION*), *SETTING*등 *stream identification*이 0인 연결을 말한다.

endpoint는 프레임의 모든 공간을 사용할 필요는 없다. 응답의 성능은 가능한 사이즈 보다는 작은 사이즈의 frames을 사용함으로써 증대된다. 큰 프레임을 보내는것은 frame의 time-sensitiv를 지연시키고(*RST_STREAM*, *WINDOW_UPDATE*, 혹은 *PRIORITY*)이는 퍼포먼스에 영향을 줄 수 있다.

----

## Header Compression and Decompression

HTTP/1과 같이 HTTP/2의 헤더영역은 이름과 한개 이상의 값들로 이루어져 있다. 헤더영역은 HTTP request와 response 메세지에서 사용되고 서버 푸쉬에서도 사용된다.

헤더 목록은 없거나 혹은 다수의 헤더들의 집합으로 이루어져 있다. connection을 통하여 보내질때, 헤더 목록은 HTTP header compression을 이용하여 header block으로 만들어져 보내진다. 헤더 블럭은 header block fragments라 불리우는 1개 혹은 다수의 바이트로 이루어져 있다. 그리고 *HEADERS*, *PUSH_PROMISE*, 혹은 *CONTINUATION*의 payload로 전송된다.

Cookie 헤더 영역은 HTTP 매핑에서 특별하게 취급된다.

수신측에서는 헤더 블럭들을 header block fragment를 concat으로 조합하고 헤더 목록을 얻기 위해서 압축을 해제한다.

완전한 헤더 블럭을 얻는 방법은 몇 가지가 있다:

- *END_HEADERS* flag가 설정된 한 개의 HEADERS 혹은 *PUSH_PROMISE* frame이 보내진다. 이 프래임의 payload가 header block이다.

- *END_HEADERS* flag가 unset된 HEADERS 혹은 *PUSH_PROMISE* frame이 보내지고 *CONTINUATION*에 *END_HEADERS* flag가 설정된 프래임을 받을 때 까지 계속 받는다.


header block의 압축 해제과정 중 발생하는 error에 대해서는 *COMPRESSION_ERROR*형태의 connection error로 취급된다.
<!--One compression context and one decompression context are used for the entire connection.-->
각각의 header block은 별개로 다루어진다. Header blocks은 연속적인 frame으로 보내져야만 한다. 다른 형태의 frame들은 Header frame들이 보내지는 중에는 보내질 수 없다. 마지막 *HEADERS*, *PUSH_PROMISE*나 *CONTINUATION* frame은 *END_HEADERS* flag가 설정되어야 한다. 이런 방식은 header block이 논리적으로 한 fraem으로 보내지는 것과 같이 보이게 해 줄 것이다.


*HEADERS*, *PUSH_PROMISE*, or *CONTINUATION*를 받는 endpoint에서는 다른 frame을 무시하고서라도 header block을 조합해야한다. Header block fragment는 *HEADERS*, *PUSH_PROMISE*, or *CONTINUATION*의 payload에서만 보내질 수 있는데 그 이유는 이 frame들은 수신자가 가지고 있는 compression context를 수정할 수 있는 데이터를 전송하기 때문이다.
