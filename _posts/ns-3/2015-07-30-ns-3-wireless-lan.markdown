---
layout: post
title:  "Wireless LAN(IEEE 802.11) in NS-3 上"
date:   2015-08-06 05:39:00
categories: ns-3
description: wifi환경에서의 ns-3 무선통신 simulation
keywords: ns-3, wireless, simulation

---

아는 교수님으로부터 서울대의 Multimedia & Wireless Networking Laboratory에 근무하시는 윤강진 교수님이 제작한걸로 보이는 자료를 받았다.

문제는 이 자료가 영어고, 발표 자료라 컨셉에 대해서만 적혀있고 구체적인 설명은 조금 결여되어 있어, 발표자료를 토대로 하여 인터넷에서 뒤적이며 자료를 보강하여 블로그를 써보기로 했다. 일단 내용은 Wireless LAN(802.11)에 대한 설명과 NS-3에서 테스트를 구현하는 방법이다.

----

IEEE 802.11 Wireless LAN은 우리가 알고있는 WiFi에 관련된 표준을 IEEE에서 정의해둔 표준 이름이다. 처음 wifi를 써본 기억은 초등학생때, PSP를 샀을때인데 이때, 사용했던 Netgear의 공유기 지원 표준이 802.11 g였던것을 생각하면 기가비트까지 지원하는 현재에 비하면 옛날이라는 생각이든다.

본 자료에는 600 Mbps를 100m 범위내에서 지원한다고 서술되어 있는데 이는 표준에 따라 다르다. [wiki](https://en.wikipedia.org/wiki/IEEE_802.11)

또한 2.4, 5GHz를 사용하는 wifi는 [ISM band](https://en.wikipedia.org/wiki/ISM_band)라 불리는 다용도 목적의 통신 밴드를 사용하여, 개인용으로 사용할 수 있다.(3.6GHz, 60GHz를 사용하는 버전도 있다. 위키참조)

WLAN의 구현을 위해서 MAC과 PHY와 묶음이다.

## MAC (Media Access Control)

----

여기서 MAC은 Media Access Control으로 OSI model에서 data link 계층의 sublayer 해당하는 레이어로, 여러 단말들이 하나의 회선(무선 환경이라면 주파수)을 공유할때 발생하는 충돌을 제어하는 방식에 대한 총칭이다.

일반적으로 LLC(Logical Link Control)이라 불리는 Data link layer 밑에서 동작한다. 각각의 단말에 주소를 부여하고, channel access control을 이용하여 여러개의 단말이 같은 네트워크를 사용할 수 있도록 만들어 준다. 데이터를 frame화한다. 이런 과정에서 미약한 에러제어가 가능하다. 

![mac]({{ site_url }}/assets/media-access-control.jpg)

이러한 기능을 하는 대표적인 프로토콜로는 이더넷의 프로토콜인 CSMA/CD가 있다.

## LLC (Logical Link Control)

Data communication protocol layer로 MAC과 같은 Data link layer의 sublayer의 위에서  동작한다. 이는 IEEE 802.2로 규정되어 있다.
이 계층에서 다양한 프로토콜들이 같은 네트워크를 사용하는 것이 가능하도록 Multiplexing의 기능을 한다. 

![mac]({{ site_url }}/assets/llc-frame.jpg)

- MAC을 기반으로 multiplexing protocol을  전송하고 이를 해독한다.

- 여러개의 노드가 묶인 네트워크상에서도 노드 대 노드간의 통신을 가능하게 한다.

- 에러제어

IEEE 802.2표준에서는 3가지 타입의 표준을 제공하고 있는데,

- Type 1 : unacknowledged connectionless

	+ 데이터 그램 전송방식

	+ 확인 응답을 하지 않음

- Type 2 : connection-oriented

	+ 신뢰성제공

- Type 3 : acknowledged connectionless

	+ 이전 프레임의 전송완료가 확인 되면 다음 진행


LLC를 IEEE 802.2 표준으로 정하고 환경이나 토폴로지에 따라서 각각의 상이한 MAC 표준을 제공하고 있다.

- 802.3 (CSMA/CD), 802.4 (Token Bus), 802.5 (Token Ring) 등이 정의됨

![mac]({{ site_url }}/assets/802.2.jpg)

## 802.11 Arch

IEEE 802.11에서는 두 가지 모드를 지원하는데 Infrastructure mode, Adhoc mode를 지원한다.
여기서 Infrastructure mode BSS이고, Adhoc은 IBSS인데 이는 무선망의 구성 단위를 표현하는 말이다.

무선 LAN 망 구성 단위

- BSS (Basic Service Set)              : 하나의 AP 에 다수의 이동노드(STA)들과의 구성
- BSA (Basic Service Area)           : BSS로 커버되는 지리적 영역
- ESS (Extended Service Set)           : 여러 BSS들에 의한 구성
- IBSS (Independent Basic Service Set) : AP 없이 노드(STA)들 끼리 만의 구성

밑에 나와있는 표는 기본적인 802.11의 패킷을 구조이다.

![wifi layer]({{ site_url }}/assets/wifi-layer-interactions.jpg)

layer 3에 해당하는 IP에서부터 한단계씩 내려갈때 나올 수 있는 패킷을 구조화한것으로 LPDU는 LLC MPDU가 MAC에 해당하는 영역으로 layer 2에 해당하는 영역을 표현한다.

## 802.11 CSMA/CA

하나의 AP에 접근하고 있는 다중의 STA들이 동시에 전송하는 사태가 벌어지는 것을 충돌이라하고 이를 회피하는 방식으로서 전송전에 센싱을 하고 보낸다. 이런 기법으로 충돌을 회피하는데 충돌이 감지된 경우에는 random한 시간동안 대기한다.(Back off)

하지만 충돌이 발견되지 않은 환경이라 할지라도, 무선환경에서는 fading(신호 방해), 혹은 숨어있는 단말이 있어 모든 충돌이 발견되지 않았다는 사실에 대한 정확성이 보장되지 않는다. 그래서 CSMA/CA에서는 이 문제점을 보강하는 방법을 제시하고 있는데 이를 Distributed Coordination Function, DCF라고 한다.

첫번째로는 IFS(Inter Space Frame)으로 프래임과 프래임간의 대기시간을 주는 방식이다. 이렇게 동작할 시 상대가 먼저 감지하여 보내고 있는 중이였다면, 다른 노드가 채널의 휴지상태를 감지하고 바로보내지 않아 충돌을 없앨 수 있다. 이때 이 대기시간인 길이에 따라서 DIFS, PIFS, SIFS로 나뉘게 되는데 이를 통하여 STA들의 우선순위가 구현된다.

![dcf]({{ site_url }}/assets/dcf.jpg)

또 다른 하나의 방법으로는 Contention Window가 있는데 IFS만큼 대기한 패킷들은 얼마나 대기할 지에 대한 시간의 단위인 time-slot의 양을 뽑는데, 이 때 STA들은 뽑은 만큼의 time-slot동안 대기하고 나서 다시한번 채널이 휴지상태인지 확인하고 확실하다면 전송한다. 만약 다른 STA가 먼저 대기를 끝내고 프레임을 전송하기 시작했다면 다시 휴지상태가 될 때 까지 대기하다가, 휴지상태로 확인 하면 IFS만큼 다시 대기하고 그 전 상태에서 카운트 했던 time-slot에서 다시 카운팅하여 전송을 대기한다.

그리고 여기서 해결되지 않는 것이 숨겨진 단말인데 이는 선택적인 사항인 RTS/CTS를 이용하여 문제를 해결할 수 있다.

RTS/CTS란, 데이터 전송을 원하는 노드 node 가 송신 요청(Request To Send) 프레임을 보내는 것으로 프로세스가 시작된다. 송수신중인 다른 신호가 없어 전송이 가능한 무선 환경인 경우, 목적지 노드는 이 신호에 대해서 송신 확인(Clear To Send) 프레임을 보내 응답하게 된다. RTS나 CTS 프레임을 받은 다른 모든 노드는 정해진 시간동안 데이터 전송을 제한하게 된다. (숨겨진 노드 문제 문제가 해결됨). 전송을 제한하게 되는 시간은 RTS와 CTS 프레임 안에 적혀있다. 이 프로토콜은 모든 노드가 같은 전송 범위를 갖는다는 것을 전제로 하고 있다. *(from wiki)*

![dcf]({{ site_url }}/assets/rts-cts-exchange.png)

---

# Reference

- [https://en.wikipedia.org/wiki/Media_access_control](https://en.wikipedia.org/wiki/Media_access_control)
- [http://www.ktword.co.kr/abbr_view.php?m_temp1=400](http://www.ktword.co.kr/abbr_view.php?m_temp1=400)
- [https://en.wikipedia.org/wiki/Logical_link_control](https://en.wikipedia.org/wiki/Logical_link_control)
- [http://www.ktword.co.kr/abbr_view.php?m_temp1=113](http://www.ktword.co.kr/abbr_view.php?m_temp1=113)
- [http://www.ktword.co.kr/abbr_view.php?m_temp1=2287](http://www.ktword.co.kr/abbr_view.php?m_temp1=2287)
- [http://nenunena.tistory.com/67](http://nenunena.tistory.com/67)
- [https://en.wikipedia.org/wiki/Carrier_sense_multiple_access_with_collision_avoidance](https://en.wikipedia.org/wiki/Carrier_sense_multiple_access_with_collision_avoidance)
- [https://ko.wikipedia.org/wiki/IEEE_802.11_RTS/CTS](https://ko.wikipedia.org/wiki/IEEE_802.11_RTS/CTS)