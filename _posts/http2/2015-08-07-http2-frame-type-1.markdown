---
layout: post
title:  "RFC 7540(HTTP 2) Frame Type 上"
date:   2015-08-07 16:37:00
categories: http2
description: http2의 frame 종류에 대한 설명
keywords: http, http2, header, data, setting, frame, type

---

![Http logo]({{ site_url }}/assets/http2-fast-websites.png)

---

HTTP/2에서는 Frame을 기본 단위로 하여 통신을 한다. 이런 Frame에는 여러가지의 타입이 있는데 현재 정의되어 있는 타입은 전체 10개다. 이 타입은 Frame의 구조에 Type(8 bit)에 표시되어 있고 각 타입마다 Frame 구조의 Payload에 들어가는 구조가 따로 정의되어 있다.

flag는 지정된 값을 0에서 부터 하나하나 더하여(OR연산을 구현해도 비트수가 각기 다르기 때문에 더하기와 같은 값을 얻는다.) 설정함으로 다중의 flag를 사용할 수 있다. 구조에서 이름은  ```Pad Length? (8)``` 이런 형식으로 되어 있는데, 이 때 ?가 들어가 있으면 flag 설정에 따라 없을 수 있음을 표시한 것이고 괄호 안에 있는 숫자는 비트수이다 이가 *인 경우에는 가변적임을 나타낸다.

그리고 특수한 경우가 아닌 이상  stream id가 0x0이 할당되어 있으면 PROTOCOL_ERROR로 처리된다. 또한 가변적인 값이 아닌 곳에서 더 많은 바이트를 할당하게 되면 FRAME_SIZE_ERROR로 처리한다.

----

## DATA

DATA frame은 type id로 0번이 할당되어 있고 가변적 길이의 바이너리 데이터를 주고 받는데에 사용된다 한개 혹은 여러개의 데이터 프레임을 이용하여 HTTP의 request나 response의 entity를 구현할 수 있다. DATA frame은 padding을 포함할 수 있는데, 보안적 이유에서 사용한다고 명시해두었다.

### 구조

    +---------------+
    |Pad Length? (8)|
    +---------------+-----------------------------------------------+
    |                            Data (*)                         ...
    +---------------------------------------------------------------+
    |                           Padding (*)                       ...
    +---------------------------------------------------------------+

* Pad Length에는 padding을 구현할 시에 패딩할 데이터의 길이에 대하여 정의해 둘 수 있고 패딩을 구현 안한다면 이 8비트는 할당되어서는 안된다.

* Data는 실제 DATA Frame이 주고받을 데이터를 정의해두는 구간이다.

* Padding은 Pad length에 정의 해둔 길이만큼 패딩하면 되고 아니라면 무시하면된다.

### Flag

* END_STREAM (0x1): 이 flag가 설정되어 있다면 half-closed 상태로 만들거나 혹은, closed 상태로 만들수 있다(Stream state 글 참조)

* PADDED (0x8):  이 flag가 설정되어 있으면 DATA Frame payload에 padding이 구현되어 있음을 설정한다.

----

## HEADERS

HEADES frame은 type id 1번으로 할당되어 있고 일반적으로 스트림을 여는데에 사용한다.(Stream state 글 참조) 이는 HTTP request와 response의 header에 대해서 나타낼때 사용하고 여러개의 Frame으로 분할 하여 보낼 수 있으며 End Frame flag가 설정되어야 모든 Header가 다 모였다고 판단되어야한다. 또한 이 스트림은 위에서 말했듯 스트림을 여는데에 사용하기 때문에 처음 스트림을 열때에 스트림의 우선순위를 나타내기 위해서 Priority를 설정할 수 있는 영역이 있다.

### 구조

	+---------------+
	|Pad Length? (8)|
	+-+-------------+-----------------------------------------------+
	|E|                 Stream Dependency? (31)                     |
	+-+-------------+-----------------------------------------------+
	|  Weight? (8)  |
	+-+-------------+-----------------------------------------------+
	|                   Header Block Fragment (*)                 ...
	+---------------------------------------------------------------+
	|                           Padding (*)                       ...
	+---------------------------------------------------------------+

* Pad Length에는 padding을 구현할 시에 패딩할 데이터의 길이에 대하여 정의해 둘 수 있고 패딩을 구현 안한다면 이 8비트는 할당되어서는 안된다.

* E는 Exclusive설정이다. (이것과 관련된 사항은 다음 포스팅에...)

* Stream dependency는 이 스트림이 의존하고 있는 Stream의 ID를 나타낸다. flag에 PRIORITY설정이 없을 시 무시된다.

* Weight은 스트림이 얼마나 위의 dependent stream을 공유하고 있는 스트림들 가운데에서 얼마나 비중을 갖는지를 나타내는 값이다.

* Header block fragment는 HPACK으로 압축한 헤더의 데이터를 넣는다.

* Padding은 Pad length에 정의 해둔 길이만큼 패딩하면 되고 아니라면 무시하면된다.

### Flag

* END_STREAM (0x1): 이 flag가 설정되어 있다면 half-closed 상태로 만들거나 혹은, closed 상태로 만들수 있다(Stream state 글 참조)
      
* END_HEADERS (0x4):헤더가 종료되었음을 설정할 수 있는 flag다.

* PADDED (0x8): 현재 헤더가 padding되어 있음을 나타낸다.

* PRIORITY (0x20): Priority 설정이  HEADERS frame에 포함되어 있음을 나타낸다.

----

## PRIORITY

PRIORITY frame은 type id 2번 이다. 이 frame으로는 Stream의 우선순위를 HEADERS로 먼저 설정하지 않았을 경우에 PRIORITY frame을 이용하여 설정할 수 있다.

### 구조

    +-+-------------------------------------------------------------+
    |E|                  Stream Dependency (31)                     |
    +-+-------------+-----------------------------------------------+
    |   Weight (8)  |
    +-+-------------+

* E는 Exclusive설정이다. (이것과 관련된 사항은 다음 포스팅에...)

* Stream dependency는 이 스트림이 의존하고 있는 Stream의 ID를 나타낸다. flag에 PRIORITY설정이 없을 시 무시된다.

* Weight은 스트림이 얼마나 위의 dependent stream을 공유하고 있는 스트림들 가운데에서 얼마나 비중을 갖는지를 나타내는 값이다.

*PRIORITY frame은 flag로 설정할 수 있는 설정이 없다.*

----

## RST_STREAM

RST_STREAM는 type id 3번으로 이 frame은 stream을 stream error 때문에 스트림을 무조건적으로 닫는다. 

    +---------------------------------------------------------------+
    |                        Error Code (32)                        |
    +---------------------------------------------------------------+

stream error를 처리하는 frame이다. 특정 flag를 설정 할 수 없으며, 에러 코드에 대해서는 下편 포스트에 나와 있을 것이다...(아마도..). 만약 에러코드의 사이즈가 4바이트 이상이라면 FRAME_SIZE_ERROR로 처리한다.

----

## SETTINGS

SETTINGS frame은 type id 4번을 갖고 있는 frame이다. connection에 대한 설정을 진행하기 떄문에 stream id가 0x0이 아니라면 PROTOCOL_ERROR로 connection error처리한다. 또한 이 Frame은 설정을 진행하는것이 아니라 보낸측의 설정을 알려주는 frame이다. 따라서 sender와 receiver는 둘이 다른 setting값을 갖을 수 있습니다. 

> 이 부분의 해석에 대해서 자신감이 없어서....ㅠ 원어는 이렇습니다.
> 
> SETTINGS parameters are not negotiated; they describe characteristics of the sending peer, which are used by the receiving peer.  Different values for the same parameter can be advertised by each peer.  For example, a client might set a high initial flow-control window, whereas a server might set a lower value to conserve resources.)

### flag

ACK(0x1): SETTINGS frame에 대한 응답으로 송신자 측에게 수신자 측이 이해했다는 응답을 보내주기 위해서 ACK flag를 담아 보내는데, 이 flag가 설정 된 frame이 frame pyaload의 length가 0이 아니라면 FRAME_SIZE_ERROR로 처리된다.

### 구조

아래와 같은 형식을 갖고 있는 구조를 여러개 포함하야 설정을 알려주고 이 또한 size가 맞지 않으면 FRAME_SIZE_ERROR로 처리된다.

    +-------------------------------+
    |       Identifier (16)         |
    +-------------------------------+-------------------------------+
    |                        Value (32)                             |
    +---------------------------------------------------------------+
 
 Identification에는 여러가지 설정의 id가 들어가고 Value에는 해당 설정에 대한 설정 값을 나타낸다.
 
### SETTINGS Parameters
 
* SETTINGS_HEADER_TABLE_SIZE (0x1) : 헤더 압축시 사용하는 테이블의 전체 사이즈를 나타낸다, 초기 값은 4,096으로 자세한 항목은 HPACK관련글을 참조하세요.
 
* SETTINGS_ENABLE_PUSH (0x2) : PUSH_PROMISE를 이용한 PUSH기능을 사용할지에 대한 값을 나타낸다. 초기 설정은 Enable설정이고, 0으로 설정되어 있으면 불가능함을 의미한다, 만약 Disable상태에서 PUSH_PROMISE를 받게 된다면 PROTOCOL_ERROR로 처리된다, 또한 이 설정에 대해서 값이 0 혹은 1이 아닌 경우도 PROTOCOL_ERROR로 처리된다.

* SETTINGS_MAX_CONCURRENT_STREAMS (0x3) : 동시에 스트림을 열수 있는 한계치에 대해서 설정하는 id다. 이 설정을 0으로 한다면 더이상 Stream을 만들지 못하게 됨으로, 아주 짧은 시간 서버가 잠시 요청에 대해서 대기하고 싶을떄에 사용할 수 있다, RFC에서는 100정도를 권장값으로 말하고 있다.

* SETTINGS_INITIAL_WINDOW_SIZE (0x4) : steram level에서 초기 flow의 window 사이즈에 대해서 설정할 수 있다, 이 값을 설정하면 모든 스트림에 적용될 수 있으며, 초기 값은 2^16 - 1이다, 2^ 31 - 1이상으로 설정된다면, connection error로 FLOW_CONTROL_ERROR로 처리된다. 

* SETTINGS_MAX_FRAME_SIZE (0x5) : Frame의 payload 사이즈를 특정할 수 있다. 기본값은 2^14다.

* SETTINGS_MAX_HEADER_LIST_SIZE (0x6) : 헤더를 압축해제 할 때 HTTP 헤더의 개수에 대해서 나타낸다. (해석이 쫌  정확하지 않습니다..)

알 수 없는 SETTINGS id에 대해서는 무시한다.

계속..