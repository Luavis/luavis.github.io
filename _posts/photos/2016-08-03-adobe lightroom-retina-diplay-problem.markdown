---
layout: post
title:  "Adobe Lightroom retina diplay problem"
date:   2016-09-03 22:41:00 +09:00
categories: photos
description: "애플 레티나 제품군에서 Lightroom의 퍼포먼스 문제"
keywords: "github, two factor, 2차 비밀번호"
---

## 너무느렸다...

최근에 아이맥 레티나 5K 27인치(중급형)를 구매하고 퍼포먼스에는 크게 문제를 못 느끼면서 사용하고 있었다. 램 부족 증상을 느껴서 32GB 램을 구매해서 장착한 이후에는 크롬탭으로 램 구이(?)를 해도 크게 문제를 느끼지 못했다. 하지만 이전에는 데스크탑으로 작업해오던 Lightroom 사진작업을 아이맥에서 하는 순간 이게 왜 이럴까 싶을 정도로 심각한 퍼포먼스 문제를 겪었다.

이전에 맥북프로에서 작업했을때 보다 느린게 느껴질 정도였다. 그리고 exporting이 느리기보단 preview에 drawing이 속도저하가 되는걸 보고 고해상도가 문제가 된다는 걸 알 수 있었다. 이 문제를 구글링해보니 많은 사람들이 이 문제에 대해서 issue를 등록해놓은 것을 확인할 수 있었고, 어도비 공식 help에 해결법이 나와있었다.

## 해결법

[링크](https://helpx.adobe.com/lightroom/kb/performance-hints.html?sdid=KBQWU)에 들어가보면 아래와 같은 문제에 대한 해결법이 나와있다.

> High-resolution displays
> 
> Drawing to the screen can be slow when Lightroom is using the entire screen of a high-resolution display. A high-resolution display has a native resolution near 2560 x 1600, and is found on 30-inch monitors and Retina MacBooks. To increase performance on such displays, reduce the size of the Lightroom window, or use the 1:2 or 1:3 views in the Navigator panel.

우선 고해상도의 디스플레이(2560 x 1600), 맥북 레티나에서 화면에 사진을 미리보기로 그려주는것은 느리다고 한다. 이를 해결하기 위해서는 그림에 나와있듯 축척을 1:2, 1:3으로 설정한다. 아니면 lightroom의 윈도우 사이즈 자체를 줄이는 방법이 있고, 구글링해본 결과 몇몇 사람들 같은 경우에는 보조모니터에서 작업하는 경우도 있다고 한다.

![adobe lightroom high resolution solutiuon]({{ site_url }}/assets/adobe-lightroom-high-resolution-solutiuon.png)
