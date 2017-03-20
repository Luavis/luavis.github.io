---
layout: post
title:  "Instagram이 Python garbage collection 없앤 이유 - 上"
date:   2017-03-21 03:33:00 +09:00
categories: python
description: Instagram사에서 GC를 끄는것이 메모리를 위한 선택이였던 이유
keywords: python, django, production, garbage collection, gc, insatgram, memory, management, multi processor

---

*TL;DR*

이 글은 [Instagram의 블로그 글](https://engineering.instagram.com/dismissing-python-garbage-collection-at-instagram-4dca40b29172#.koitdzt7n)을 번역하고, 저의 개인적인 사견을 담은 글입니다. GC를 없애면 Instagram에서는 10%의 효율을 얻었다고 합니다. 이는 GC를 사용하지 않은것인데요, CPU LLC cache hit율을 높이고 메모리 사용률을 줄일 수 있다고 주장합니다.

### Instagram에서 서버가 동작하는 방법

Instagram의 웹서버는 Django의 multi-process mode로 동작합니다. application 서버는 pre-fork모드를 이용해서 uWSGI 서버를 사용합니다.

### Memory에 대하여

Instagram에서는 master process spawn되고 난 직후에 worker process의 메모리가 빠르게 증가하는지를 알아봤습니다. 이를 찾기위해서 Instagram에서 테스트 해본 결과 spawn 직후 공유 메모리는 전체의 2/3 밖에 못 차지합니다. 1/3에 해당하는 메모리가 어떤 이유로 private 메모리로 바뀌는지 알아보겠습니다.

### Copy-on-read

일단 공유메모리가 가능한 원리에 대해서 조금 생각해 볼 필요가 있습니다. Linux kernel에서는 공유메모리를 지원하기 위해서 fork된 프로세스에 Copy-on-Write 방법을 사용하여 메모리를 관리합니다. 메모리의 page 단위로 쓰기 작업이 일어나는 순간에 page 전체를 copy 하게됩니다. 이를 통해서 단순 읽기 작업만 일어나는 page에 대해서는 fork된 process간 공유가 가능합니다.

하지만 Python에서는 이 상황이 조금 다르게 적용됩니다. Python의 object들은 Reference counting을 사용합니다. 따라서 Python의 object를 읽게되면(reference) interpreter가 내부적으로 ref count를 올리게 됩니다. 이는 내부에 있는 ```PyObject```의 refcnt에 write 작업이 수행되고, 이로인해 Python에서는 읽는 순간에  copy가 발생하는 Copy-on-Read가 됩니다.

```c
#define PyObject_HEAD                   \
    _PyObject_HEAD_EXTRA                \
    Py_ssize_t ob_refcnt;               \
    struct _typeobject *ob_type;
...
typedef struct _object {
    PyObject_HEAD
} PyObject;
```

여기서 드는 의문은 [code objects](https://docs.python.org/3/c-api/code.html)와 같은 변하지 않는 데이터도 위에서 언급한 문제가 발생하는가 입니다. Python에서 code object인 PyCodeObject는 PyObject의 상속을 받고 있기 때문에 우선 겉으로 보이기에는 괜찮아 보입니다. 그래서 우선 PyCodeObject의 reference counting부터 없애보도록 하겠습니다. 조금 부연 설명을 하면 fork 되면 이미 master process에서 동작한 코드들이 woker process에서도 동작할것이고, 그러면 ref count가 올라가니, 위에서 언급한 문제인 CoR이 발생하지 않을까..? 하는 추론을 했던것으로 보입니다.

```c
/* Bytecode object */
typedef struct {
    PyObject_HEAD
    int co_argcount;		/* #arguments, except *args */
    int co_nlocals;		/* #local variables */
    int co_stacksize;		/* #entries needed for evaluation stack */
	...
} PyCodeObject;
```

### 첫번째 시도, Code object에서 reference counting 없애기

Instagram에서 빠르게 실험적으로 CPython interpreter 개조해서 code object reference count이 올라가지 않는것을 확인하고, production 서버에 올려봤습니다. 하지만 효과는 미약했습니다... 왜 그런가에 대해서 고민했다 합니다. 일단 개조했던 구현체가 의도한대로 돌아간다는 보장이 없습니다. 그리고 공유메모리와 code object copy와의 고나계에 대해서 확실하게 증명한것이 아니라 어디까지나 심증이였습니다.. 여기서 배운 이론은 하기전에 증명부터(Prove your theory before going for it) <strike>괜히 번역했다..</strike>

### Page faults

InstagramCopy-on-Write에 대해서 찾아본 결과, Copy-on-Write는 page fault와 관련이 있다는 것을 찾았습니다. 각각의 CoW는 page fault를 발생 시킵니다. 그래서 perftool을 이용해서 production 서버를 껏다가 켜고 fork되어서 worker process의 PID가 나올때까지 기다리고(...) 아래 커맨드를 이용해서 perftool을 붙여 언제  page fault가 일어나는지 지켜본 뒤 stack trace를 확인했다고 합니다.

```sh
$ perf record -e page-faults -g -p <PID>
```

그리고 결과는 생각했던것과는 의외의 결과가 나왔습니다. code object를 copy하는 문제보다는 가장 의심되는것은 `gcmodule.c`에 있는 `collect`였습니다. 그리고 이는 GC가 발생한 순간에 호출됩니다. CPython에서 GC가 어떻게 동작하는지에 대해서 학습하고 다음과 같은 이론을 세웠습니다.

CPython의 GC는 threshold(문턱, 공학에서 자주 사용하는 용어입니다. 허용가능한 한계치라고 생각하면 됩니다)를 기반으로 발생합니다. 기본적인 threshold는 매우 낮습니다. 따라서 GC는 생각보다 빠르게 찾아오게 됩니다. Python에서의 GC는 각 세대별로 object를 linked list로 관리합니다. 그리고 linked list의 형태는 아래와 같이 생겼습니다.

```c
/* GC information is stored BEFORE the object structure. */
typedef union _gc_head {
    struct {
        union _gc_head *gc_next;
        union _gc_head *gc_prev;
        Py_ssize_t gc_refs;
    } gc;
    long double dummy;  /* force worst-case alignment */
} PyGC_Head;
```
원본에서는 GC 도중에 linked list가 뒤섞인다(shuffled) 라는 표현을 사용했습니다. 이로 인해서 CoW가 발생한다고 이야기하고 있습니다. 그리고 이는 메모리에 오히려 부작용을 낳고 있다 설명합니다. 필자는 shuffled라는 표현이 조금 애매해서 [코드](https://github.com/python-git/python/blob/master/Modules/gcmodule.c#L815)를 분석해봤습니다. 상세하게 해석한것이 아니라 정확하지는 않지만 finalizer가 호출게될 있는 object를 제외하고 세대별로 (기본적으로 3개가 있는것으로 보입니다, 혹시 이것이 이해가 안간다면 [Hello World에 좋은 글이](http://d2.naver.com/helloworld/1329) 있습니다.) 현재 reachable 하지 않은 object를 찾고 이를 비우는 방식입니다. 그리고 살아남은 Object를 gc_count를 기준으로 더 늙은(old) 세대로 옮기게 됩니다. 이런 과정속에 young 세대와 old 세대의 list를 합치는 과정, 혹은 ref count를 다시 세는 과정 등등이 shuffle에 해당하는것인지는 잘 모르겠습니다. 하지만 이런 과정속에 사용중인 대부분의 object에 해당하는 PyGC_Head및 PyObject 구조체에 쓰기 작업이 진행됩니다.

> **참고**
>
> 필자는 PyObject에 선언되어 있지도 않은 Py_GC_Head와 PyObject간의 관계가 어떻게 되는지 궁금했습니다. 이는 첫번째 변환식을 보면 조금의 답을 얻을 수 있었습니다. 
>
> 포인터 연산자에 1을 더하여 PyObject 포인터를 받아오는것으로 보아 메모리에 allocation 하는 순간에 이미 공간을 차지하고 있다 생각했고, [이 코드를](https://github.com/python/cpython/blob/6f0eb93183519024cb360162bdd81b9faec97ba6/Modules/gcmodule.c#L1732) 참조하시면 됩니다.

```c
/* Get an object's GC head */
#define AS_GC(o) ((PyGC_Head *)(o)-1)

/* Get the object given the GC head */
#define FROM_GC(g) ((PyObject *)(((PyGC_Head *)g)+1))
```

### 두번째 시도, GC를 꺼보자
<strike>GC에 통수 맞았습니다.</strike>

우선 `gc.disable()`을 호출하여 GC 호출을 껐습니다. 하지만 Instagram팀은 여전히 변화가 없는것을 보았고 찾아보니 `msgpack`이라고 하는 third-party library가  `gc.enable()`을 호출하고 있었습니다. 이로 인해서 `gc.disable()`은 소용없는 짓이 되었고, 이를 대체하기 위해서 `gc.set_threshold(0)`를 호출했습니다.(어떤 third-party도 이를 수정하는 일은 없었다고 합니다.) 결과는 성공적이였고, 공유메모리의 사용률이 90%에 육박하는 결과를 이루었습니다(이전 결과는 66%). 이는 전체 Django에 25%의 메모리 효율을 가져오는 결과를 주었고, 그리고 더 높은 GC 메모리 threshold(제한을 없앴기 때문에)로 인해서 Django의 성능(throughput) 또한 향상되는 효과를 얻었습니다.

다음 글에서는, GC를 끔으로 인해서 생기는 여러가지 다양한 문제에 대해서 서술하겠습니다.

### Reference

* [Instagram engineering blog](https://engineering.instagram.com/dismissing-python-garbage-collection-at-instagram-4dca40b29172#.koitdzt7n)
* [Stackoverflow: Python garbage collector documentation](http://stackoverflow.com/questions/4484167/python-garbage-collector-documentation)
* [Python: memory management](https://intopython.com/2016/12/13/memory-management/)
