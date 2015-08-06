---
layout: post
title:  "NS-3 First satrt"
date:   2015-08-06 05:39:00
categories: ns-3
description: ns-3 시작하기
keywords: ns-3, start, 시작

---

NS-3에서는 C++과 Python 2.x버전을 지원한다. 처음 다운로드를 mercurial로 ns-3 repo에서 clone을 받거나 tarball을 공식 홈페이지에서 다운 받아 빌드하여 설치할 수 있는데,

	./buid.py --enable-examples
	
명령어를 이용하여 빌드를 할 수 있다. 하지만 설치형 모듈이 아니기 때문에 이를 어떤 path에서도 개발할 수 없고 특정한 path아래에서만 개발이 가능하다. 그 위치가 ```ns-<version>/scratch/``` 밑에 저장해두고 waf를 다시 실행하면 된다.

예를 들어 위 path에 test-script.cc라는 소스코드를 추가하고, ```./waf```를 실행하면,

	$ ./waf --run test-script
	Waf: Entering directory `/Users/Luavis/ns-allinone-3.23/ns-3.23/build'
	[ 847/1764] cxx: scratch/test-script.cc -> build/scratch/test-script.cc.3.o
	[1761/1764] cxxprogram: build/scratch/test-script.cc.3.o -> build/scratch/test-script
	Waf: Leaving directory `/Users/Luavis/ns-allinone-3.23/ns-3.23/build'
	'build' finished successfully (1.942s)
	Scratch Simulator
	
이렇게 실행이 가능하다. 하지만 python은 run을 할때 flag를 ``` --pyrun```을 이용해야하는데 예를들면,

	./waf --pyrun scratch/test-script.py
	Waf: Entering directory `/Users/Luavis/ns-allinone-3.23/ns-3.23/build'
	Waf: Leaving directory `/Users/Luavis/ns-allinone-3.23/ns-3.23/build'
	'build' finished successfully (0.873s)

	Modules built:
	antenna                   aodv                      applications
	bridge                    buildings                 config-store
	core                      csma                      csma-layout
	dsdv                      dsr                       energy
	fd-net-device             flow-monitor              internet
	lr-wpan                   lte                       mesh
	mobility                  mpi                       netanim (no Python)
	network                   nix-vector-routing        olsr
	point-to-point            point-to-point-layout     propagation
	sixlowpan                 spectrum                  stats
	test (no Python)          topology-read             uan
	virtual-net-device        wave                      wifi
	wimax

	Modules not built (see ns-3 tutorial for explanation):
	brite                     click                     openflow
	tap-bridge                visualizer

	hello world
	
위와 같이 scratch란 directory 밑에 있어야한다고 명시해주어야하며 확장자도 명시해야한다.
