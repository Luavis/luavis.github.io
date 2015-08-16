---
layout: post
title:  "RFC 7540(HTTP 2) Frame Type 下"
date:   2015-08-14 13:21:00
categories: http2
description: http2의 frame 종류에 대한 설명
keywords: http, http2, header, data, setting, frame, type

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

## PUSH_PROMISE

PUSH_PROMISE frame(type=0x5)는 피어에게 31bit의 stream identifier를 주어 앞으로 push할 스트림의 id를 알려준다,
또한 푸시할 stream의 내용에대한 헤더정보도 같이 보낸다. PUSH_PROMISE는 stream을 idle상태에서 reserved된 상태로 만들게 된다.

### 구조

	+---------------+
	|Pad Length? (8)|
	+-+-------------+-----------------------------------------------+
	|R|                  Promised Stream ID (31)                    |
	+-+-----------------------------+-------------------------------+
	|                   Header Block Fragment (*)                 ...
	+---------------------------------------------------------------+
	|                           Padding (*)                       ...
	+---------------------------------------------------------------+

* Pad Length에는 padding을 구현할 시에 패딩할 데이터의 길이에 대하여 정의해 둘 수 있고 패딩을 구현 안한다면 이 8비트는 할당되어서는 안된다.

* Promised Stream ID는 PUSH할 스트림의 ID를 넣는다.

* Header block fragment는 HPACK으로 압축한 헤더의 데이터를 넣는다.

* Padding은 Pad length에 정의 해둔 길이만큼 패딩하면 되고 아니라면 무시하면된다.

### Flag

* END_HEADERS (0x1): 이 flag가 설정되어 있다면 header를 종료한다.

* PADDED (0x8):  이 flag가 설정되어 있으면 PUSH_PROMISE Frame payload에 padding이 구현되어 있음을 설정한다.

----

## PING

PING frame(type=0x6)은 endpoint간의 최소 round-trip 시간을 측정하기 위해서 사용하는 frame이다, 또한 이를 통해서 어떤 통신도 진행하고 있지 않은 connection을 유지시킬 수 있다. PING frame은 어떤 endpoint던지 보낼 수 있다.

### 구조

    +---------------------------------------------------------------+
    |                                                               |
    |                      Opaque Data (64)                         |
    |                                                               |
    +---------------------------------------------------------------+

PING을 받은 측은 ACK flag가 설정되어 있지 않은것을 확인했다면 ACK를 설정하고 똑같은 Opaque data를 갖는 PING frame을 보내야한다. 수신측은 어떤 프레임보다 PING frame을 가장 먼저 처리해야하고, PING frame은 어떤 스트림에 귀속되어 있는 frame이 아님으로 stream id를 0x0으로 설정해야한다, 만약 아니라면 PROTOCOL_ERROR에 해당하는 connection error가 발생한다. 

### Flag

* ACK (0x1): 0이 설정되어 있다면 response를 기다라는 PING이란 의미이고, 이를 받은측은 설정해서 보내야한다. 이 flag가 설정된 frame을 받으면 보냈던 PING frame에 대한 응답임으로 이에대해서 다시 응답해서는 안된다.

----

## GOAWAY

GOWAY frame(0x7)은 에러 조건을 갖고 connection을 종료할때 사용한다. GOWAY는 너무 오래 동안 connection을 유지하여 발생할 수 있는 문제 등, 서버 유지 같은 이유를 위해서 connection을 종료할 때에도 사용할 수 있다. 또한 GOWAY frame은 어떤 이유에서든 프레임을 닫을 때에 양쪽 endpoint는 이 frame을 보내야만 한다.

    +-+-------------------------------------------------------------+
    |R|                  Last-Stream-ID (31)                        |
    +-+-------------------------------------------------------------+
    |                      Error Code (32)                          |
    +---------------------------------------------------------------+
    |                  Additional Debug Data (*)                    |
    +---------------------------------------------------------------+

### 구조

* Last-Stream-ID는 마지막으로 진행되다가 에러와 같은 기타등등의 이유로 처리가 종료된 stream중에서 가장 높은 숫자의 ID를 적는다.

* Error code는 표준에 정의된 code내용을 포함한다. 이를 통해서 어떤 이유로 connection이 종료되었는지를 파악할 수 있다.

* Additional debug data는 추가적인 디버깅 데이터를 포함한다.

---

## WINDOW_UPDATE

WINDOW_UPDATE frame (type=0x8)은 flow control을 구현하기 위해서 사용한다. flow control은 각각의 스트림 단위에서 혹은 전체 connection단위에서 일어날 수 있다. 만약 connection 단위에서 일어나는 경우에는 stream id를 0x0으로 설정하고 stream단위에서 설정하는 경우에는 stream id를 해당하는 stream id로 설정한다.

    +-+-------------------------------------------------------------+
    |R|              Window Size Increment (31)                     |
    +-+-------------------------------------------------------------+

Window size increment는 0일 수 없고 최소 1에서 부터 2^31 - 1(2,147,483,647)까지 가능하다. flow control의 영향을 받는 frame에는 DATA frame만 있으며 이를 제외한 나머지의 frame들은 서버가 처리를 못하더라도 받아져야한다. 만약  설정된 octet보다 더 큰 데이터 frame이 들어온다면 FLOW_CONTROL_ERROR로 connection 혹은 stream에러를 처리한다.

---

6.10.  CONTINUATION

CONTINUATION frame (type=0x9)는 추가적으로 header를 보낼때 사용한다, 예를들어 HEADERS frame에서 header block fragment가 frame사이즈에 걸려서 다 못 담은 경우에 CONTINUATION frame을 이용하여 추가적인 frame을 보낼 수 있다.

### 구조

    +---------------------------------------------------------------+
    |                   Header Block Fragment (*)                 ...
    +---------------------------------------------------------------+

만약 END_HEADERS 비트가 설정되어 있지 않았다면 이 frame은 CONTINUATION frame 뒤에 따라와야한다. 이렇지 않은 경우에는 PROTOCOL_ERROR로 처리한다.

### Flag

* END_HEADERS (0x1): 이 flag가 설정되어 있다면 header를 종료한다.
