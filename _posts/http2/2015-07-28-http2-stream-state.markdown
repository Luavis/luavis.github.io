---
layout: post
title:  "RFC 7540(HTTP 2) Streams State"
date:   2015-07-28 03:27:00
categories: http2
description: http2의 stream의 상태 변화에 대한 번역
keywords: http, http2, stream, state

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

## Streams and Multiplexing

---
HTTP 2.0에서의 스트림은 양방향성의 독립된 client와 server frame을 교환할 수 있는 통로입니다.
스트림들은 몇가지 중요한 특징이 있습니다.

- 하나의 HTTP/2 connection에는 여러개의 stream이 있을 수 있습니다. 각각의 endpoint에서는 frame을 multistream으로 보낼 수 있습니다.

- stream은 설치될 수 있고, 일방적으로 사용되거나 클라이언트나 서버가 공유할 수 있습니다.

- stream은 각각의 endpoint에서 닫을 수 있습니다.

- 스트림에서 frame이 보내지는 순서는 중요합니다. 수신자는 받아들인 순서에 따라 처리합니다. 특히 HEADERS와 DATA frame의 순서는 매우 중요합니다.

- 스트림은 정수로 구분됩니다. 스트림 구분자는 스트림을 만드는 측의 endpoint에서 할당하게 됩니다.

## Stream States

다음은 RFC에 그려져 있는 Stream의 lifecycle입니다.

            
                             +--------+
                     send PP |        | recv PP
                    ,--------|  idle  |--------.
                   /         |        |         \
                  v          +--------+          v
           +----------+          |           +----------+
           |          |          | send H /  |          |
    ,------| reserved |          | recv H    | reserved |------.
    |      | (local)  |          |           | (remote) |      |
    |      +----------+          v           +----------+      |
    |          |             +--------+             |          |
    |          |     recv ES |        | send ES     |          |
    |   send H |     ,-------|  open  |-------.     | recv H   |
    |          |    /        |        |        \    |          |
    |          v   v         +--------+         v   v          |
    |      +----------+          |           +----------+      |
    |      |   half   |          |           |   half   |      |
    |      |  closed  |          | send R /  |  closed  |      |
    |      | (remote) |          | recv R    | (local)  |      |
    |      +----------+          |           +----------+      |
    |           |                |                 |           |
    |           | send ES /      |       recv ES / |           |
    |           | send R /       v        send R / |           |
    |           | recv R     +--------+   recv R   |           |
    | send R /  `----------->|        |<-----------'  send R / |
    | recv R                 | closed |               recv R   |
    `----------------------->|        |<----------------------'
                             +--------+

       send:   endpoint sends this frame
       recv:   endpoint receives this frame

       H:  HEADERS frame (with implied CONTINUATIONs)
       PP: PUSH_PROMISE frame (with implied CONTINUATIONs)
       ES: END_STREAM flag
       R:  RST_STREAM frame


위 그림은 frame으로 인한 상태의 변화에 대해 서술해 놨다. 떄문에 *HEADERS* 혹은 *PUSH_PROMISE*, *CONTINUATION* frame등 상태를 변화 시키지 않는 frame들은 보이지 않습니다. *END_STREAM* flag는 frame의 이벤트를 분할하여 동작시킵니다. *END_STREAM* flag가 설정된 HEADERS frame는 두개의 상태를 발생시킬 수 있다.

두개의 endpoint는 state stream에 대해서 서로 다른 각자의 관점을 갖고 있다. endpoint들은 한 쪽 endpoint에서만 일방적으로 stream 생성하여 편성해서는 안된다. 서로 다른 state를 갖게되어 얻는 부정적인 결과로는 *RST_STREAM*가 보내져서 closed 상태일 때 뿐이다.

위 상태도에 있는 state에 대해 설명하면:

---

*idle:*

모든 스트림은 *idle* 상태로 시작한다.

이 상태에서 다음과 같은 상태로의 이동이 가능하다:

- HEADERS frame보내거나 받으면, frame은 *open* 상태로 변화한다. stream identifier는 이 문서에 *Stream Identifier*에 서술된 형식으로 선택된다. 동일한 HEADERS frame을 받는다면 "half-closed" 상태가 될 수 있다. 

- 다른 stream에게 PUSH_PROMISE frame을 보낸다면, idle stream을 나중에 쓸 것이라 미리 정해두는것이다. reserved stream에 stream 상태는 "reserved (local)"이다.

- 반대로 PUSH_PROMISE를 받는다면 reserved stream에 stream 상태는 "reserved (remote)"이다.

> Note:
>
> PUSH_PROMISE frame은 idle stream에게 보내지는 것이 아니라 새롭게 reserved 상태로 될 stream에게 보내진다. 
> 이 상태의 stream에게는 *HEADERS*나 *PRIORITY* 이외의 다른 frame들 받는건 *PROTOCOL_ERROR*형의 connection error로 취급된다.

---

*reserved (local)*

이 상태에 있는 stream은 PUSH_PROMISE를 보내어 예약한 상태이다.

이 상태에서는 다음과 같은 상태로 이동할 수 있다.

- endpoint는 *HEADERS* frame을 보내어, half-closed (remote) 강태로 갈 수 있다. 

- endpoint는 RST_STREAM을 보내서 closed 상태로 갈 수 있다. 이 를 통해서 stream의 reserved 상태를 풀 수 있다.

endpoint는 이 상태에서 HEADERS나 RST_STREAM 혹은 PRIORITY 외의 frame은 보낼 수 없다.

이 상태에서는 *PRIORITY*나 *WINDOW_UDPATE* frame을 받을 수도 있다. *RST_STREAM*, *PRIORITY*, 혹은 *WINDOW_UPDATE* 이런 타입을 받게 된다면 connection error로 취급해야한다.

---

*reserved (remote)*

A stream in the "reserved (remote)" state has been reserved by a remote peer.
이 상태는 상대편 peer에 의해 reserve된 상태가 된 것이다.

이 상태에서는 다음 상태로 이동이 가능하다:

- *HEADERS*를 받게 된다면 half-closed (local) 상태로 접어든다.

- 양쪽 endpoint는 *RST_STREAM*는 보낼 수 있고, closed 상태로 접어든다. 이는 stream의 reserved 상태에서 해제된다.

endpoint는 reserved stream의 *PRIORITY*를 보내어 우선순위를 재조정할 수 있다. RST_STREAM, WINDOW_UPDATE, 혹은 PRIORITY 외의 frame을 보내면 안된다.

*HEADERS*, *RST_STREAM*, *PRIORITY*외의 frame을 받는다면 connection error(*PROTOCOL_ERROR*)로 처리해야만 한다.

---

*open*

open 상태의 stream은 어떠한 타입의 frame이던 서로 주고 받을 수 있다. 이 상태에서는 peer에게 stream-level, flow-control를 확인 하도록 보내는 것이 제한된다.

이 상태에서는 양측 endpoint는 half-closed 상태로 만들기 위해서 END_STREAM flag가 설정된 frame을 보낼 수 있다. endpoint는 
*RST_STREAM*를 보내게된다면 closed상태로 만들게 된다.

---

*half-closed (local)*

이 상태에서는 *WINDOW_UPDATE*, *PRIORITY*, *RST_STREAM* 이 외의 frame은 보낼 수 없다.

*END_STREAM*를 받거나 *RST_STREAM*를 보내면 closed 상태로 변한다.

endpoint는 어떤 상태의 frame이던 받을수 있다. *WINDOW_UPDATE*을 이용하여 flow-control을 제공하기 위해서 flow-controlled frame을 지속적으로 받는 것은 필요하다. 이 상태에서는 수신자는 *END_STREAM*가 도착한지 얼마 안되어 받은 *WINDOW_UPDATE*를 무시할 수 있다.

*PRIORITY* frame을 받게 된다면 우선순위 재조정이 가능하다.

---

*half-closed (remote)*

이 상태에 접어든 stream은 상대편으로 부터 더 이상 frame을 받을 필요가 없다. 이 상태의 endpoint는 수신자의 flow-control window를 유지할 필요없다. 
만약 endpoint가 *WINDOW_UPDATE*, *PRIORITY*, *RST_STREAM*등의 frame을 받게 된다면 *STREAM_CLOSED* 상태의 stream error로 처리 되야한다.

어떤 종류의 frame이던 보낼 수 있는 상태이다.
*END_STREAM* 스트림은 보내거나 *RST_STREAM*을 받거나 보내어 closed상태로 이동 할 수 있다.
<!--In this state, the endpoint continues to observe advertised stream-level flow-control limits (Section 5.2).-->

---

*closed*

closed 상태는 종료 단계이다.

closed된 frame은 PRIORITY 이 외의 frame은 받을 수 없다. *RST_STREAM* 받은 후에 *PRIORITY* 외의 frame을 받게된다면, *STREAM_CLOSED* stream error로 취급된다. 
아래의 경우를 제외하고는 *END_STREAM*가 설정된 frame을 받은뒤에 어떠한 frame이던 endpoint가 받았다면, 이 또한 STREAM_ERROR의 connnection error로 취급된다.

<!--
- WINDOW_UPDATE, RST_STREAM frames들은 이 상태에서 받을 수 있다. 

WINDOW_UPDATE, RST_STREAM frames can be received in this state for a short period after a DATA or HEADERS frame containing an END_STREAM flag is sent. Until the remote peer receives and processes RST_STREAM or the frame bearing the END_STREAM flag, it might send frames of these types. Endpoints MUST ignore WINDOW_UPDATE or RST_STREAM frames received in this state, though endpoints MAY choose to treat frames that arrive a significant time after sending END_STREAM as a connection error (Section 5.4.1) of type PROTOCOL_ERROR.

PRIORITY frames can be sent on closed streams to prioritize streams that are dependent on the closed stream. Endpoints SHOULD process PRIORITY frames, though they can be ignored if the stream has been removed from the dependency tree (see Section 5.3.4).

If this state is reached as a result of sending a RST_STREAM frame, the peer that receives the RST_STREAM might have already sent — or enqueued for sending — frames on the stream that cannot be withdrawn. An endpoint MUST ignore frames that it receives on closed streams after it has sent a RST_STREAM frame. An endpoint MAY choose to limit the period over which it ignores frames and treat frames that arrive after this time as being in error.

Flow-controlled frames (i.e., DATA) received after sending RST_STREAM are counted toward the connection flow-control window. Even though these frames might be ignored, because they are sent before the sender receives the RST_STREAM, the sender will consider the frames to count against the flow-control window.

An endpoint might receive a PUSH_PROMISE frame after it sends RST_STREAM. PUSH_PROMISE causes a stream to become "reserved" even if the associated stream has been reset. Therefore, a RST_STREAM is needed to close an unwanted promised stream.

In the absence of more specific guidance elsewhere in this document, implementations SHOULD treat the receipt of a frame that is not expressly permitted in the description of a state as a connection error (Section 5.4.1) of type PROTOCOL_ERROR. Note that PRIORITY can be sent and received in any stream state. Frames of unknown types are ignored.

An example of the state transitions for an HTTP request/response exchange can be found in Section 8.1. An example of the state transitions for server push can be found in Sections 8.2.1 and 8.2.2.
-->

