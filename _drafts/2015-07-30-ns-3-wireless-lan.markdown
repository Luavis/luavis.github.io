---
layout: post
title:  "Wireless lan ns-3"
date:   2015-07-29 18:28:00
categories: ns-3
description: ns-3 무선통신 simulation
keywords: ns-3, wireless, simulation

---

아는 교수님으로 서울대의 Multimedia & Wireless Networking Laboratory에 근무하시는 윤강진 교수님이 제작한걸로 보이는 자료를 받았다.

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




---

# Reference

- [https://en.wikipedia.org/wiki/Media_access_control](https://en.wikipedia.org/wiki/Media_access_control)
- [http://www.ktword.co.kr/abbr_view.php?m_temp1=400](http://www.ktword.co.kr/abbr_view.php?m_temp1=400)
- [https://en.wikipedia.org/wiki/Logical_link_control](https://en.wikipedia.org/wiki/Logical_link_control)
- [http://www.ktword.co.kr/abbr_view.php?m_temp1=113](http://www.ktword.co.kr/abbr_view.php?m_temp1=113)