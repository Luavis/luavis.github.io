---
layout: post
title:  "ADB와 Genymotion"
date:   2016-08-19 02:27:00 +09:00
categories: server
description: "Genymotion을 사용하면서 겪은 에러"
keywords: "Android, genymotion, ADB, kill-server, start-server"
---

사실 안드로이드 쪽은 주력 분야도 아니고 간단 간단하게 개발할때만 사용했지만 일신상의 이유로 이번에 ```react-native```의 버프를 좀 더 힘내서 개발해보게 되었다. 하지만 역시나 수 많은 버그가 떨어졌고(사실 react-native로는 아이폰만 개발하는게 정신건강에 이로운듯 하다.. 아직까지는), 조금 황당한 문제가 생겨서 해결법을 올려본다.

## 문제의 발생

react-native를 사용하면서 adb 커맨드와 친해졌는데

```
$ adb start-server
adb server version (32) doesn't match this client (36); killing...
adv E  2102 29314 usb_osx.cpp:322] Could not open interface: e00002c5
adv E  2102 29314 usb_osx.cpp:284] Could not find device interface
error: could not install *smartsocket* listener: Address already in use ADB server didn't ACK
* failed to start daemon *
error: cannot connect to daemon
```

왠지 모르게 잘 사용하다가 이런 버그와 마주하게되었다. ```react-native run-android``` 커멘드 실행시 adb에서 디바이스 리스트를 뽑아오는데에서 문제가 발생한걸 보고, 이상하다 생각했고 ```kill-server```커멘드도 사용해보고 ```start-server``` 커멘드를 사용해서 adb 데몬을 시작해보고 해도 이미 사용중인 포트여서 못 켜겠다는데 문제는 Genymotion에 있었다.

## 해결방법

Genymotion 자체에도 ADB가 이미 깔려있기 때문에

![]({{ site_url }}/assets/adb-genymotion-solution.png)

```Settings > ADB > ADB tool connection settings > Use custom Android SDK tools``` 에 접속해서 이미 설치했던 sdk path를 잡아주면 문제가 해결된다.

원래 잘되었던 이유는 genymotion보다 adb가 우선해서 켜졌기 때문인걸로 간주되고 위 에러로그를 확인해보면 adb 버전이 다르다고 써있기도 한데, 같다면 문제가 안 발생하는가에 관해선 의문이다.
 