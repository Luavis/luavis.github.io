---
layout: post
title:  "MP3 decoer 제작"
date:   2016-08-08 16:26:00
categories: python
description: python 코드를 이용하여 MP3 decoder 제작해보기
keywords: mp3, Python, id3, MPEG-1 Layer 3

---


## MP3 decoder 제작

### 인간의 청각과 음성 심리

MP3를 비롯한 일반적인 손실형 음성 인코딩 방식은 음성적으로 불필요한 정보들을 음성 시그널에서 제거함으로서 음성 파일의 전체적인 사이즈를 줄이게된다.

사람의 청각에 부족한 부분들을 특징삼아서 손실 오디오 압축을 한다. 이 중에서 가장 기본적인 특징이 사람의 가청주파수다.(20Hz-20kHz). 게다가 사람의 청각에는 한계치가 있다, 신호의 데시벨이 특정 한계치보다 작으면 너무 조용하기 때문에 들리지 않는다. 이 한계치는 주파수에 따라서 다른데, 20Hz의 소리는 60 데시벨보다 높아야만 들린다, 반면에 1-5kHz 대역의 음성은 낮은 볼륨에서도 잘 들을 수 있다.

음성 시스템에서 가장 주요한 특징으로 알려진것은 ```마스킹```이다. 아주 큰 신호는 비슷한 주파수대역이나 거의 동시간에 있는 다른 신호를 거의 들리지 않을 정도로 ```가려버린다.(mask)``. 이는 큰 신호는 동시간대와 스펙트럼이 같은 주변 신호들의 가청 한계치에 영향을 줄 수 있다는것을 의미한다.

### MP3에 대하여

MP3는 MPEG-1 Audio Layer 3 포멧의 코덱이다. 이는 MPEG-1에 정의되어 있는데, 이 표준에는 3개의 각기 다른 Layer 1, 2, 3 오디오관련 코덱이 있다. 이중에서 layer 1은 가장 간단한 코덱이여서 압축률이 가장 낮고, layer 3가 가장 복잡한 압축방식을 거쳐서 압축률이 제일 좋고 결과물인인 음성 파일의 비트레이트도 가장 좋은 품질을 갖고 있다. Layer 3는 layer 2에 기반해 있고 이는 다시 layer 1에 기반된다.

MP3 인코더는 WAV file이라고 할 수 있는 입력 소스가 인코더에 입력되고 이런 신호들은 (time domain을 기준으로) 여러개의 파트로 나눈다. 그리고 인코더는 짧은 신호들을 모아서 이를 frequency domain으로 지정하고 위에서 이야기한 불필요한 정보들을 제거한다. 최소한의 정보만을 갖고 있는 frequency sample들을 일반적인 무손실 압축을 하고 샘플들은 압축된 정보등을 담아서 바이너리 파일 포멧으로 디스크에 쓰게 된다.

디코더는 이와는 반대로 작동하게 된다. 바이너리 파일을 읽고 frequency sample을 압축을 해제 하고 , 어떤 모델을 통해서 정보가 제거되었는지에 대한 정보를 기반으로 복원한다. 그리고 이 frequncy sample들을 time doamin으로 변환한다.

### Step 1: Making sense of the data

많은 사람들은 MP3가 여러개의 frame들로 구성된다고 알고 있다. bit stream을 해석하는데에 있어서, frame들을 기본적인 요소가 아니고 독립적으로 디코딩 될 수 없다. 우선은 흔히 frame이라고 불리는 physical frame에 대해서 알아보자.(실질적으로 우리가 해석해야하는 데이터의 묶음은 logical frame이다.)

## References

* [http://blog.bjrn.se/2008/10/lets-build-mp3-decoder.html](http://blog.bjrn.se/2008/10/lets-build-mp3-decoder.html)
* [http://www.cocoawithlove.com/2010/10/ios-tone-generator-introduction-to.html](http://www.cocoawithlove.com/2010/10/ios-tone-generator-introduction-to.html)