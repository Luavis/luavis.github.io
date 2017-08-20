---
layout: post
title:  "Python의 메모리 할당"
date:   2017-08-21 05:48:00 +09:00
categories: python
description: Python이 메모리를 할당하고 관리하는 방법
keywords: python, maclloc, 메모리, 할당,관리

---


**tl;dr**

Python은 pymalloc이란 이름의 커스텀 메모리 관리법이 있습니다. 메모리를 `arena`란 이름의 큰 블럭을 만들고 그 안에 풀을 다시 만들어서 512바이트 보다 작은 오브젝트에 대해서는 대부분 이곳에 생성합니다.

## 문제의 서막

친구가 매우 흥미로운 [글](https://tech.ssut.me/2017/08/05/hack-the-virtual-memory-python-bytes/) 하나를 번역한 뒤에 포스팅하여 읽어보았다. 파이썬에서 `bytes`로 객체를 하나 생성하고 이를 `/proc/../mem`을 이용해서 수정하는 이야기에 관한 글이다. 문제는 우리가 생성한 객체가 힙이 아닌 엉뚱한 segment에 할당되어 있다는 점이고 왜 이것이 heap에 없는지, `Holberton`란 단어가 heap에 있는것들은 무엇인지에 대한 해답은 나와있지 않아 원문을 찾아봤고 원문에도 설명이 되어 있지 않았다. 그래서 한번 찾아나섰다. 이유가 무엇인지.

## 문제를 해결해보자
```sh
julien@holberton:/usr/include/python3.4$ ps aux | grep main_id.py | grep -v grep
julien     4344  0.0  0.7  31412  7856 pts/0    S+   16:53   0:00 python3 ./main_id.py
julien@holberton:/usr/include/python3.4$ cat /proc/4344/maps
00400000-006fa000 r-xp 00000000 08:01 655561                             /usr/bin/python3.4
008f9000-008fa000 r--p 002f9000 08:01 655561                             /usr/bin/python3.4
008fa000-00986000 rw-p 002fa000 08:01 655561                             /usr/bin/python3.4
00986000-009a2000 rw-p 00000000 00:00 0 
021ba000-022a4000 rw-p 00000000 00:00 0                                  [heap]
7f343d797000-7f343de79000 r--p 00000000 08:01 663747                     /usr/lib/locale/locale-archive
7f343de79000-7f343df7e000 r-xp 00000000 08:01 136303                     /lib/x86_64-linux-gnu/libm-2.19.so
7f343df7e000-7f343e17d000 ---p 00105000 08:01 136303                     /lib/x86_64-linux-gnu/libm-2.19.so
7f343e17d000-7f343e17e000 r--p 00104000 08:01 136303                     /lib/x86_64-linux-gnu/libm-2.19.so
7f343e17e000-7f343e17f000 rw-p 00105000 08:01 136303                     /lib/x86_64-linux-gnu/libm-2.19.so
7f343e17f000-7f343e197000 r-xp 00000000 08:01 136416                     /lib/x86_64-linux-gnu/libz.so.1.2.8
7f343e197000-7f343e396000 ---p 00018000 08:01 136416                     /lib/x86_64-linux-gnu/libz.so.1.2.8
7f343e396000-7f343e397000 r--p 00017000 08:01 136416                     /lib/x86_64-linux-gnu/libz.so.1.2.8
7f343e397000-7f343e398000 rw-p 00018000 08:01 136416                     /lib/x86_64-linux-gnu/libz.so.1.2.8
7f343e398000-7f343e3bf000 r-xp 00000000 08:01 136275                     /lib/x86_64-linux-gnu/libexpat.so.1.6.0
7f343e3bf000-7f343e5bf000 ---p 00027000 08:01 136275                     /lib/x86_64-linux-gnu/libexpat.so.1.6.0
7f343e5bf000-7f343e5c1000 r--p 00027000 08:01 136275                     /lib/x86_64-linux-gnu/libexpat.so.1.6.0
7f343e5c1000-7f343e5c2000 rw-p 00029000 08:01 136275                     /lib/x86_64-linux-gnu/libexpat.so.1.6.0
7f343e5c2000-7f343e5c4000 r-xp 00000000 08:01 136408                     /lib/x86_64-linux-gnu/libutil-2.19.so
7f343e5c4000-7f343e7c3000 ---p 00002000 08:01 136408                     /lib/x86_64-linux-gnu/libutil-2.19.so
7f343e7c3000-7f343e7c4000 r--p 00001000 08:01 136408                     /lib/x86_64-linux-gnu/libutil-2.19.so
7f343e7c4000-7f343e7c5000 rw-p 00002000 08:01 136408                     /lib/x86_64-linux-gnu/libutil-2.19.so
7f343e7c5000-7f343e7c8000 r-xp 00000000 08:01 136270                     /lib/x86_64-linux-gnu/libdl-2.19.so
7f343e7c8000-7f343e9c7000 ---p 00003000 08:01 136270                     /lib/x86_64-linux-gnu/libdl-2.19.so
7f343e9c7000-7f343e9c8000 r--p 00002000 08:01 136270                     /lib/x86_64-linux-gnu/libdl-2.19.so
7f343e9c8000-7f343e9c9000 rw-p 00003000 08:01 136270                     /lib/x86_64-linux-gnu/libdl-2.19.so
7f343e9c9000-7f343eb83000 r-xp 00000000 08:01 136253                     /lib/x86_64-linux-gnu/libc-2.19.so
7f343eb83000-7f343ed83000 ---p 001ba000 08:01 136253                     /lib/x86_64-linux-gnu/libc-2.19.so
7f343ed83000-7f343ed87000 r--p 001ba000 08:01 136253                     /lib/x86_64-linux-gnu/libc-2.19.so
7f343ed87000-7f343ed89000 rw-p 001be000 08:01 136253                     /lib/x86_64-linux-gnu/libc-2.19.so
7f343ed89000-7f343ed8e000 rw-p 00000000 00:00 0 
7f343ed8e000-7f343eda7000 r-xp 00000000 08:01 136373                     /lib/x86_64-linux-gnu/libpthread-2.19.so
7f343eda7000-7f343efa6000 ---p 00019000 08:01 136373                     /lib/x86_64-linux-gnu/libpthread-2.19.so
7f343efa6000-7f343efa7000 r--p 00018000 08:01 136373                     /lib/x86_64-linux-gnu/libpthread-2.19.so
7f343efa7000-7f343efa8000 rw-p 00019000 08:01 136373                     /lib/x86_64-linux-gnu/libpthread-2.19.so
7f343efa8000-7f343efac000 rw-p 00000000 00:00 0 
7f343efac000-7f343efcf000 r-xp 00000000 08:01 136229                     /lib/x86_64-linux-gnu/ld-2.19.so
7f343f000000-7f343f1b6000 rw-p 00000000 00:00 0 
7f343f1c5000-7f343f1cc000 r--s 00000000 08:01 918462                     /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
7f343f1cc000-7f343f1ce000 rw-p 00000000 00:00 0 
7f343f1ce000-7f343f1cf000 r--p 00022000 08:01 136229                     /lib/x86_64-linux-gnu/ld-2.19.so
7f343f1cf000-7f343f1d0000 rw-p 00023000 08:01 136229                     /lib/x86_64-linux-gnu/ld-2.19.so
7f343f1d0000-7f343f1d1000 rw-p 00000000 00:00 0 
7ffccf1fd000-7ffccf21e000 rw-p 00000000 00:00 0                          [stack]
7ffccf23c000-7ffccf23e000 r--p 00000000 00:00 0                          [vvar]
7ffccf23e000-7ffccf240000 r-xp 00000000 00:00 0                          [vdso]
ffffffffff600000-ffffffffff601000 r-xp 00000000 00:00 0                  [vsyscall]
julien@holberton:/usr/include/python3.4$ 

```

위 글에서 bytes가 저장된 위치는 여기였다 `7f343f000000-7f343f1b6000 rw-p 00000000 00:00 0`. 할당된 위치도 그러하고 이름도 없는것으로 보아 느낌상 mmap으로 할당된 메모리임을 알 수 있었다. 일단은 mmap이 언제부터 호출된것인지. 그리고 이걸 파이썬이 어떻게 관리하는지를 알기 위해서 코드를 쫓아가기 편하도록 Python C library를 이용해서 본 문에 나온 python bytes 출력 코드를 똑같이 작성하였다.

```c
#include <Python.h>
#include <stdio.h>

int
main(int argc, char *argv[]) {
    Py_Initialize();

    PyObject *s = PyBytes_FromString("Holberton");
    PyObject_Print(s, stdout, 0);

    getchar();
    PyObject_Print(s, stdout, 0);

    Py_DECREF(s);
    Py_Finalize();

    return 0;
}
```

똑같이 동작하였고 메모리에 할당되는 부분 그리고 `rw_all.py`를 이용해서 메모리가 수정되는 부분까지 완벽하게 동작하였다. 이제 이 코드를 기반으로 어떻게 파이썬이 메모리를 할당해 나가는지에 대해서 알아보았다.

우선 `bytes`를 할당해준 `PyBytes_FromString`이란 함수에서 메모리가 할당될 것이기에 여기서 부터 출발했고 메모리가 할당되는 부분의 call stack을 그려보면 아래와 같다.

```
PyBytes_FromString <Objects/bytesobject.c>
|_ PyObject_MALLOC <Objects/obmalloc.c>
	|_ _PyObject_Malloc <Objects/obmalloc.c>
		|_ _PyObject_Alloc<Objects/obmalloc.c>
```

`_PyObject_Alloc`란 함수가 필요로하는 부분만큼 메모리에서 할당해주는 부분이다. 이 함수에 대해서 찾아보았다.


## Python의 메모리 관리

이번 파이콘 행사 이후에 커밋로그 찾으면서 역사 탐방하는 것에 취미가 생겨서 이런 관리법이 언제 생겼는지 알아봤는데 [Python 2.1 버전](https://github.com/python/cpython/tree/a35c688055c72e9442f6a82c3ec0e09654077975)부터 변화가 시작되어 시험사용하고, 2.3버전에서 정식 사용되기 시작했다. 이전의 PyObject_MALLOC은 macro를 이용해서 jemalloc과 같은 커스텀 memory allocation 라이브러리를 사용 가능 하도록 만들었고 특별한 설정이 없으면 glib의 malloc을 따르게 돼 있다.

현재의 파이썬은 이때 만들어진 Vladimir Marangozov이 작성한 pymalloc 알고리즘을 아직까지 사용하고 있다. obmalloc.c에 주석으로 굉장히 자세하게 설명되어 있어 인용했다. Python에서 대부분의 Object가 생성되고 사라질때에는 PyObject_New/Del를 호출하게 된다. 물론 예외적인 경우도 있다. 예를들면 integer 타입같은 경우 일정한 작은 수들은 캐싱해서 따로 리스트를 만들어 관리한다.

```
    _____   ______   ______       ________
   [ int ] [ dict ] [ list ] ... [ string ]       Python core         |
+3 | <----- Object-specific memory -----> | <-- Non-object memory --> |
    _______________________________       |                           |
   [   Python's object allocator   ]      |                           |
+2 | ####### Object memory ####### | <------ Internal buffers ------> |
    ______________________________________________________________    |
   [          Python's raw memory allocator (PyMem_ API)          ]   |
+1 | <----- Python memory (under PyMem manager's control) ------> |   |
    __________________________________________________________________
   [    Underlying general-purpose allocator (ex: C library malloc)   ]
 0 | <------ Virtual memory allocated for the python process -------> |

   =========================================================================
    _______________________________________________________________________
   [                OS-specific Virtual Memory Manager (VMM)               ]
-1 | <--- Kernel dynamic storage allocation & management (page-based) ---> |
    __________________________________   __________________________________
   [                                  ] [                                  ]
-2 | <-- Physical memory: ROM/RAM --> | | <-- Secondary storage (swap) --> |

```

운영체제가 Virtual memory를 이용해서 page 단위로 메모리를 관리할때 이는 RAM혹은 스왑메모리에 저장됩니다. 하지만 Python은 객체가 생성될때 이를 이용하지 않고 Python object allocator를 거치게 됩니다.

Python object allocator는 `SMALL_REQUEST_THRESHOLD` 매크로를 기준으로 요청된 메모리가 작은 경우에는 allocator를 사용하지만 그렇지 않은 경우에는 raw memory allocator을 이용해서 관리합니다. 예전에는 이 값이 256이였지만 현재에는 512로 정의되어 있습니다. python object allocator요청이 들어오면 우선 큰 크기의 메모리 블럭을 하나 할당합니다. 이 메모리 블럭을 Python에서는 arena라고 이름지었다. 이 arena에는 4K 크기의(일반적인 페이지 사이즈) 풀들이 있고 이 메모리 풀에는 8byte크기의 여러개의 chunk로 관리됩니다. 여기서 굳이 8바이트를 선정한데에는, 많은 플랫폼에서 memory return alignment가 맞지 않는경우에 bus error를 가져옵니다. 그 중에서 8 byte가 가장 일반적인 메모리 정렬 기준이기 때문입니다. ([참고1](https://stackoverflow.com/questions/15422297/when-malloc-returns-what-does-8-byte-alignment-mean), [참고2](https://en.wikipedia.org/wiki/Bus_error))

```
 __________________________________________________________________________
|       |       |       |       |          |       |       |       |       |
| chunk | chunk |  ...  | chunk |    ...   | chunk | chunk | chunk |  ...  |
|_______|_______|_______|_______|__________|_______|_______|_______|_______|
|                       |                          |                       |
|          Pool         |  Pool          ...       |          Pool         |
|_______________________|__________________________|_______________________|
|                                                  |                       |
|                     Arena                        |         Arena ...     |
|__________________________________________________|_______________________|


Request in bytes     Size of allocated block      Size class idx
----------------------------------------------------------------
       1-8                     8                       0
       9-16                   16                       1
      17-24                   24                       2
      25-32                   32                       3
      33-40                   40                       4
      41-48                   48                       5
      49-56                   56                       6
      57-64                   64                       7
      65-72                   72                       8
       ...                   ...                     ...
     497-504                 504                      62
     505-512                 512                      63

```

이런 구조하에서 파이썬이 메모리를 요청해오면 1-8바이트가 요청될 경우 chunk 한개, 9-16인 경우 chunk 2개를 주는 방식으로 되어있다. 당연하지만 이 chunk들은 연속적으로 되어있어야한다. 이런 공간을 최소한의 크기로 찾기 위해서 [simple segregated storage](http://perry.tistory.com/80)라는 전략을 사용한다. 그리고 이렇게 큰 메모리를 선언할때에는 힙 메모리의 파편화를 막기 위해서 mmap을 사용한다. 이는 arena영역을 생성하는 arena allocator에서 확인할수 있다. mmap을 지원하는 플랫폼에서는 mmap을 사용하고 windows환경에서는 [`VirtualAlloc`함수](https://msdn.microsoft.com/ko-kr/library/windows/desktop/aa366887(v=vs.85).aspx)를 사용한다.

```c
static PyObjectArenaAllocator _PyObject_Arena = {NULL,
#ifdef MS_WINDOWS
    _PyObject_ArenaVirtualAlloc, _PyObject_ArenaVirtualFree
#elif defined(ARENAS_USE_MMAP)
    _PyObject_ArenaMmap, _PyObject_ArenaMunmap
#else
    _PyObject_ArenaMalloc, _PyObject_ArenaFree
#endif
    };
```


## 결말

파이콘에서는 메모리가 어떻게 소멸되는지에 대해서 이야기 했는데 어쩌다 보니 파이썬이 메모리를 어떻게 만들고 관리해가는지에 대한 이야기까지 하게 되었다. 파이콘 발표자료를 블로그로 정리해서 어떻게 파이썬이 메모리를 소멸하는지에 대해서도 작성해보겠다.


## 참고

* [http://www.evanjones.ca/memoryallocator/](http://www.evanjones.ca/memoryallocator/)