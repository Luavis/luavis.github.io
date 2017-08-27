---
layout: post
title:  "piStream: Adaptive HTTP Video Streaming in LTE"
date:   2015-08-08 04:36:00
categories: ns-3
description: LTE환경에 최적화된 HTTP video streaming
keywords: ns-3, wireless, lte, adaptive, streaming, video, piStream

---

교수님에게 퀘스트를 받았다 [piStream: Physical Layer Informed Adaptive Video Streaming Over LTE](http://xyzhang.ece.wisc.edu/papers/XXie_MobiCom15_piStream.pdf)에 대해 번역을하라는, 우선 이 논문은 LTE환경에서 어떻게 Adaptive HTTP streaming기법을 이용하여 효율적이게 보낼 것인가에 대해서 연구한 자료이다, 이 포스팅에서는 Abstract 부분과 Introduction부분만을 번역해보았다.

----
## ABSTRACT

LTE를 통한 Adaptive HTTP video streaming는 LTE의 성능으로 인해서 많은 인기를 얻고 있습니다. adaptive 스트리밍의 품질은 LTE link dynamics으로 인해 생기는 문제로 end to end network의 대역에 대한 클라이언트의 평가의 정확도에 매우 의존한다.
본 논문에서는 효율적으로 LTE의 기지국의 물리계층 자원 할당을 모니터링하고 이용 가능한 대역폭의 추정 정보를 매핑 할 수 있도록 클라이언트 piStream을 제시한다. 물리계층상에서 알려진 대역폭 추정치를 제시하는것을 통하여 piStream은 영상의 품질과 영상의 멈추는 현상을 균형있게 맞춰줄 수 있고 download 대역폭이 갑작기 busy상태가 될 수 있는 가능성 까지 고려한 개연성 있는 알고리즘을 사용할 수 있다. 우리는 LTE스마트 폰의 테더링을 이용하여 실제로 piStream을 구현하여 실험 해 보았습니다. 최첨단의 adaptive streaming protocol에 비교할때 piStream의 데모는 LTE 대역폭을 효율적으로 활용하였고 더 높은 품질의 비디오를 지연시간 없이 재생할 수 있었습니다.


## INTRODUCTION

모바일 비디오 스트리밍 시장은 지난 수 년에 비해서 모바일 인터넷 트래픽의 70 %를 차지하고 78%의 연평균 성장률로 점점 시장이 급속도로 확대되어 가고 있다.
LTE 서비스는 3G의 약 10배에 달하는 다운로드 bitrate인 300Mbps의 속도를 제공하며 시용자의 대규모 트래픽 요구에 부흥하도록 제공했다. 그러나 사용자 체감 품질(QoE)는 만족스럽지 못한채로 남아 있다.

최근 세계적인 시장조사결과는 LTE 커버리지와 지역에서조차 3G에 비해서 LTE가 20% 비디오 품질을 증가가 있는 것으로 나타났다. 한편, 평균 지연시간은 매분 7.5-12.3초 정도로 여전히 발생하였다.

이 두 효과는 겉으로 보기에는 논쟁의 여지가 있습니다. 예를들어, 비디오 스트리밍 애플리케이션이 심각하게 LTE 대역폭을 제대로 활용하지 않았을 수도 있고, 지연시간은 대역폭의 overestimate에 의해서 발생할 수 있기 때문입니다. 그러나 미세한 측정실험을 통하여, 우리는 streaming application이 기지국에서 발생하는 downlink traffic의 동적인 이동에 영향을 받는 대역폭을 따라간다는 사실을  확인했습니다.

우리의 측정은 HTTP를 기반으로한 adaptive streaming protocol(일반적으로 DASH라고 불리우는)에 집중하여 조사했습니다. DASH 클라이언트는 제일 좋은 품질의 비디오를 제 시간에 재생할 수 있음을 보장하기 위해서 최적화된 비디오 segment를 서버에 요청합니다. 환경의 정밀한 조사를 위해서는 높은 비용을 필요로하기 때문에, DASH 클라이언트는 가장 최신 bandwitdh의 상태를 비디오 segment의 throughput을 통하여 추론해야합니다. 그러나 throuput값은 매우 크게 저평가되어 있을 수 있고, 비디오 segment들이 클라이언트의 end-to-end bandwidth를 완전히 사용할 수 없을 수도 있다. 심지어 DASH는 이전 bandwidth의 기록을 기반으로 하여 미래의 bandwidth를 예측하기 때문에 가끔 이런 일은 bandwidth의 overestimation를 초래할 수 있고 이는 비디오의 재생중 지연시간을 발생시킨다. 이런 양측면을 볼때 DASH client의 end to end network의 대역폭의 over/under-estimate의 영향으로 인해서 매우 정확하지 않은 환경 속에서 통신을 할 수 밖에 없다.

----

위의 문제점들을 해결하기 위해서, 우리는 LTE 물리 계층으로부터 네트워크의 대역폭을 활용하는 방법에 대해서 연구했다. 잘 정리된 무선통신 리소스 구조는 무선 랜 또는 블루투스와 같은 대부분의 다른 무선 통신 시스템과 LTE를 구별할 수 있다. LTE의 특정 셀과 통신 시간이 주어지는것은 다운로드 가능한 무선통신 리소스의 전체 양을 항상 알 수 있다는 것이다. 이 특징으로 우리는 bandwidth의 활용문제를 해결할 수 있다.

이 논문은 LTE를 통한 Adaptive 비디오 스트리밍의 성능을 향상시키기 위해 위의 기능을 최대한 활용 piStream을 제공합니다. piStream는 MPEG-DASH 표준에 호환되면서 LTE통신에는 딱 맞는 클라이언트 중심의 비디오 adaptation 프레임워크입니다. 높은레벨에서 piStream는 LTE 클라이언트가 셀 전체의 물리 계층 자원 이용 상태를 모니터링하고 순식간에 전체 네트워크 대역폭을 매핑할 수 있도록 한다.

piStream의 자원 모니터 방식은 LTE UE(사용자 장비) 정확성과 효율성에 초점을 두고 있다. 자원을 할당 상태를 가장 간단하고 직접적인 방법은 기지국의 전체 control channel을 디코딩하는 것이다. 그러나, 이러한 접근 방식은 효율과 확장성에 문제가 있다. 이러한 방식은 각각의 UE들이 control channel을 모니터링하고 다른 UE들에게로 가는 컨트롤 메세지를 디코딩한다는 것이다. piStream은 잘 정리된 LTE 자원 구조를 활용하여이 문제를 해결합니다. 다른 UE에게로 가는 control 메시지를 디코딩하는 대신에, UE는 자신이 점유율하고 있는 LTE 주파수 리소스의 신호에서 나오는 에너지만을 조사한다.

물리 계층에서 남는 무선 주파수의 자원의 양을 얻은 뒤, piStream은 이 네트워크 대역폭에서 활용할 수 있는가능성을 고려하여 측정한 throuput을 확대 해석한다. 이러한 방식으로 미사용 대역폭 piStream은 일반적인 DASH에서 활용하지 못한 영역을 한계를 극복한다.

DASH 애플리케이션의 관점에서, 대역폭 활용도를 최대화하면서 비디오의 지연시간은 최소화하기위하여 , adaptation 방식은 이상적으로 UE에 대한 앞으로 LTE 대역폭 변화를 예측하는 것이다. 찾기힘든 대역폭의 변화를 예츨하는 대신에, piStream은 패킷이 스위칭 네트워크안에서 트래픽의 패턴에 순간적인 변화가 없이 일정한 이득을 얻을 수 있게 된다.

이것은 집계한 다운로드 트래픽측정하고, 사용가능한 대역폭으로인하여 이는 현재의 레벨과 비슷한 레벨로 남을 것이다. 이는 비디오를 전송하는데에 합리적인 기준이 될것이다.(정확한 해석이 안된다 : It estimates how likely the aggregated downlink traffic (or resource usage), and hence available bandwidth, is to remain at a similar level as the current one. It then makes a probabilistic deci- sion to maximize video quality while minimizing the risk of stalling.)

We validate the piStream design by tethering a software- radio that implements the PHY-informed bandwidth esti- mation mechanisms, to an LTE smartphone that implements the application-layer video adaptation scheme. Our piStream client prototype can directly play video in real-time from any server that follows the industrial MPEG-DASH standard [5]. We benchmark piStream’s performance against a standard DASH player from GPAC2, and three state-of-the-art DASH schemes that have demonstrated superior performance over commercial DASH players. These schemes include buffer- based adaptation (BBA [9]), optimization-based adaptation using historical throughput (FESTIVE [10]), and TCP-like bandwidth probing (PANDA [15]). Under a variety of ex- perimental settings including time, location and mobility, piStream outperforms all other DASH schemes by achiev- ing higher video quality and lower/comparable video stalling rate. Under typical static indoor environments, piStream achieves around 1.6× video quality (bitrate) gain over the runner-up (BBA) while maintaining a low video stalling rate close to 0%.

---

이런 생각들로 부터 구현된 piStream LTE환경에서 사용 용이한 첫 물리 레벨을 활용한 adaptive video streaming protocol이다. piStream특징에 대해서 정리해보면:

1. LTE유저가 효율적으로 사용할 수 있는 밴드를 측정하는 방법을 경량화된 PHY계층을 자원 모니터링과 bitrate scaling 방식으로 디자인한다.

1. PHY레벨에서 알려주는 대역폭 측정을 이용하여 video adaptation algoritm을 구현한다.

1. 실질적으로 구현해 본다.

piStream는 기존의 셀룰러 인프라 또는 비디오 스트리밍 서버의 변경이 필요하지 않습니다. 그 PHY모듈은 기존 UE의 통신 하드웨어에 얹어져서, 잠재적으로 펌웨어 업그레이드를 통해 배포 할 수 있습니다.
